import React, { useCallback, useEffect, useRef, useState } from "react"
import { HiOutlineArrowLeft, HiOutlineXCircle } from "react-icons/hi2";
import { useNavigate, useParams, useSearchParams, type NavigateFunction } from "react-router-dom";
import AnalysisService from "../services/Analysis";
import Loading from "../components/Loading";
import ErrorCardInApp from "../components/ErrorCardInApp";
import type { AssetRankingResponse } from "../responses/AssetAnalysisResponse";
import { RankingType } from '../enums/RankType';
import { getMainRankPosition, StocksDetail } from "../components/StockDetail/StockDetail";
import { toast } from "sonner";
import { useSearch } from "../providers/SearchProvider";

const LIMIT = 50;
const offsetStarter = 25;
const AnalysisDetail: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const analysisService = AnalysisService.getInstance();
  const didMountSearchRef = React.useRef(false);
  const loadingRef = useRef(false);
  const hasAnimatedOnceRef = useRef(false);
  const isAutoScrollingRef = useRef(false); 
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [sectorMetaData, setSectorMetaData] = useState<AssetRankingResponse | null>(null)
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const rawType = searchParams.get("type") ?? RankingType.SECTORS;
  const type: RankingType = rawType as RankingType

  const { search } = useSearch();
  const [hasMoreUp, setHasMoreUp] = useState(true);
  const [hasMoreDown, setHasMoreDown] = useState(true);
  const [isLoadingMoreUp, setIsLoadingMoreUp] = useState(false);
  const [isLoadingMoreDown, setIsLoadingMoreDown] = useState(false);
  
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const safeOffset = isNaN(offset) ? 0 : offset;
  const offsetRef = useRef<HTMLDivElement>(null);
  const topOffsetRef = useRef(safeOffset - offsetStarter);
  const bottomOffsetRef = useRef(safeOffset + offsetStarter)

  useEffect(() => {
    if (safeOffset > 0 && offsetRef.current && !hasAnimatedOnceRef.current) {
      hasAnimatedOnceRef.current = true;
      isAutoScrollingRef.current = true;

      const top = offsetRef.current.getBoundingClientRect().top + window.scrollY - 300;
      window.scrollTo({ top, behavior: "smooth" });

      const el = offsetRef.current;
      el.style.transition = "none";
      el.style.transform = "translate(6px, -4px)";
      el.style.boxShadow = "4px 6px 20px rgba(0,0,0,0.25)";
      el.style.borderRadius = "12px";
      el.style.zIndex = "10";
      el.style.position = "relative";

      setTimeout(() => {
        el.style.transition = "transform 0.6s ease-out, box-shadow 0.6s ease-out";
        el.style.transform = "translate(0, 0)";
        el.style.boxShadow = "none";
      }, 3000);

      const unlockTimeout = setTimeout(() => {
        isAutoScrollingRef.current = false; // ✅ débloque juste le scroll infini, sans rejouer l'animation
      }, 1500);

      return () => clearTimeout(unlockTimeout);
    }
  }, [safeOffset, sectorMetaData]);

  useEffect(()=>{
    const fetch = async () => {
      setLoading(true)
      try{
        if(type == null || !uuid) {
          throw Error()
        }
        const response = await analysisService.getWholeSectorsDetailMetaData(type, uuid, offset - offsetStarter < 0 ? 0 : offset - offsetStarter, LIMIT, "")
        setSectorMetaData(response)
      } catch(e) {
        setHasError(true)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  },[])

  const fetchMore = useCallback(
    async (currentSearch: string, requestedOffset: number, replace: boolean, isBottom: boolean) => {
      if (loadingRef.current) return;
      if (!replace && !hasMoreDown && !hasMoreUp) return;
      loadingRef.current = true;
      if (isBottom) {
        setIsLoadingMoreDown(true);
      } else {
        //heightBeforeFetchRef.current = document.documentElement.scrollHeight;
        setIsLoadingMoreUp(true);
      }

      let fetchOffset = requestedOffset;
      let fetchLimit = LIMIT;

      if (!isBottom) {
        const currentTop = topOffsetRef.current;
        if (currentTop <= 0) {
          setHasMoreUp(false);
          loadingRef.current = false;
          setIsLoadingMoreUp(false);
          return;
        }
        fetchOffset = Math.max(0, currentTop - LIMIT);
        fetchLimit = currentTop - fetchOffset;
      }

      try {
        if (!uuid) return;
        const actualOffset = isBottom ? bottomOffsetRef.current : fetchOffset;
        const actualLimit = isBottom ? LIMIT : fetchLimit;

        const newData = await analysisService.getWholeSectorsDetailMetaData(
          type, uuid, actualOffset, actualLimit, currentSearch
        );

        setSectorMetaData(prev => {
          if (!prev) return null;
          if (isBottom) {
            return { ...prev, sectorsData: replace ? newData.sectorsData : [...prev.sectorsData, ...newData.sectorsData] };
          } else {
            return { ...prev, sectorsData: replace ? newData.sectorsData : [...newData.sectorsData, ...prev.sectorsData] };
          }
        });

        if (isBottom) {
          if (newData.sectorsData.length === 0) setHasMoreDown(false);
          bottomOffsetRef.current += LIMIT; // ✅ ref, pas de re-render
        } else {
          topOffsetRef.current = fetchOffset;
          const stillHasMoreUp = fetchOffset > 0 && newData.sectorsData.length > 0;
          if (!stillHasMoreUp) setHasMoreUp(false);

          if (stillHasMoreUp) {
            requestAnimationFrame(() => {
              const currentScrollTop = window.scrollY || document.documentElement.scrollTop;
              // Pousse seulement de quelques px pour sortir de la zone de trigger, jamais à une position fixe
              if (currentScrollTop < 100) {
                window.scrollBy(0, 100 - currentScrollTop); // juste 10px au-dessus du seuil de 250
              }
            });
          }
        }
      } catch {
        toast.error("Can't fetch more");
      } finally {
        loadingRef.current = false;
        setIsLoadingMoreUp(false);
        setIsLoadingMoreDown(false);
      }
    },
    [hasMoreDown, hasMoreUp]
  );

  const handleScroll = useCallback(() => {
    if (isAutoScrollingRef.current) return;
    if ((!hasMoreDown && !hasMoreUp) || loadingRef.current) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    const distanceToTop = scrollTop;

    if (distanceToBottom < 1000 && hasMoreDown) {
      fetchMore(search, 0, false, true);
    } else if (distanceToTop < 250 && hasMoreUp) {
      fetchMore(search, 0, false, false);
    }
  }, [hasMoreDown, hasMoreUp, search, fetchMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!didMountSearchRef.current) {
      didMountSearchRef.current = true;
      return;
    }
    const timeout = setTimeout(() => {
      setHasMoreDown(true);
      setHasMoreUp(false); 
      bottomOffsetRef.current = 0;
      topOffsetRef.current = 0;
      fetchMore(search, 0, true, true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  if ( loading ) {
    return <Loading />
  }
  else if ( hasError || sectorMetaData == null || sectorMetaData.sectorsData == null ) {
    return <ErrorCardInApp
          iconBg="bg-gray-100"
          icon={<HiOutlineXCircle className="w-8 h-8 text-gray-400" />}
          title="Can't fetch details of this sector"
          description="An error has occured try again later"
        />
  }
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <HiOutlineArrowLeft size={16} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-gray-900 text-xl font-bold tracking-tight">{"Performances measurements"}</h2>
            <p className="text-gray-500 text-sm mt-0.5">See each companies performance compared to peers / sectors / countries for the last year.</p>
          </div>
        </div>
      </div>
      <div className="mt-6 bg-white border border-zinc-200 rounded-xl">
        {isLoadingMoreUp && <p className="text-center py-2 text-sm text-zinc-400">Loading...</p>}
        {sectorMetaData.sectorsData.length === 0
          ? <p className="text-sm text-zinc-400 text-center py-6">No stocks found</p> 
          : sectorMetaData.sectorsData.map(p => {
            const {value} = getMainRankPosition(p, type)
            return  <div key={p.asset.uuid} ref={value === safeOffset ? offsetRef : null}>
                <StocksDetail
                  rankAsset={p}
                  mainRank={type}
                />
              </div>
          })
        }
        {isLoadingMoreDown && <p className="text-center py-2 text-sm text-zinc-400">Loading...</p>}
      </div>
    </>
  );
};

export default AnalysisDetail;
