import { useNavigate, type NavigateFunction } from "react-router-dom";
import CardSectorPerf, { type SectorCardDataProps } from "../components/CardSectorPerf";
import AnalysisService from "../services/Analysis"
import React, { useCallback, useEffect, useRef, useState } from "react"
import ErrorCardInApp from "../components/ErrorCardInApp";
import { HiOutlineXCircle } from "react-icons/hi2";
import Loading from "../components/Loading";
import SearchBar from "../components/SearchBar";
import { clusterName } from "../utils/ClusterNaming";
import { useSelectedPortfolio } from "../providers/SelectedPortfolioProvider";
import NoPortfolioSelected from '../components/Error/NoPortfolioSelected';
import type { AssetRankingResponse } from "../responses/AssetAnalysisResponse";
import { RankingType } from "../enums/RankType";
import { StocksDetail } from "../components/StockDetail/StockDetail";

const LIMIT = 50;
const Analysis: React.FC = () => {
  const analysisService = AnalysisService.getInstance();
  const didMountRef = React.useRef(false);
  const didMountSearchRef = React.useRef(false);
  const loadingRef = useRef(false);
  const [clusters, setClusters] = useState<SectorCardDataProps[]>([]);
  const [sectors, setSectors] = useState<SectorCardDataProps[]>([]);
  const [countries, setCountries] = useState<SectorCardDataProps[]>([]);
  const [userStocks, setUserStocks] = useState<AssetRankingResponse | null>(null);
  const navigate: NavigateFunction = useNavigate();
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [view, setView] = useState<"cluster" | "sector" | "my_stocks" | "countries">("my_stocks");
  const { selectedPortfolioId } = useSelectedPortfolio();
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      loadingRef.current = true
      try{
        const [sectorsMetaData, clusterMetaData, countriesMetaData, userStocksMetaData] = await Promise.all([
          analysisService.getSectorsMetaData(),
          analysisService.getClustersMetaData(),
          analysisService.getCountriesMetaData(),
          selectedPortfolioId ? analysisService.getUserStocksMetaData(selectedPortfolioId, 0, LIMIT, "") : Promise.resolve(null)
        ])
        const mappingSectors = sectorsMetaData.sectorsData.map((sector)=>{ 
          const mapped : SectorCardDataProps = {
            name : sector.sector?.sector_name ?? "",
            perf52w : sector.mean_perf,
            top: sector.best_performers.map(p => ({
              name: p.asset.display_name ?? "",
              perf: p.perf
            })),
            worst: sector.worst_performers.map(p => ({
              name: p.asset.display_name ?? "",
              perf: p.perf
            })),
            length : sector.length,
            onClick : () => {navigate("/home/analysis/"+ sector.sector?.uuid + `?type=${RankingType.SECTORS}`)}
          }
          return mapped
        })
        setSectors(mappingSectors)
        const mappingClusters = clusterMetaData.sectorsData.map((cluster)=>{
          const mapped : SectorCardDataProps = {
            name : clusterName(cluster.unique_key),
            perf52w : cluster.mean_perf,
            top: cluster.best_performers.map(p => ({
              name: p.asset.display_name ?? "",
              perf: p.perf
            })),
            worst: cluster.worst_performers.map(p => ({
              name: p.asset.display_name ?? "",
              perf: p.perf
            })),
            length : cluster.length,
            onClick : () => {navigate("/home/analysis/"+ cluster.unique_key + `?type=${RankingType.CLUSTERS}`)}
          }
          return mapped
        })
        setClusters(mappingClusters)
        const mappingCountries = countriesMetaData.sectorsData.map((country)=>{
          const mapped : SectorCardDataProps = {
            name : country.country?.country_name ?? "",
            perf52w : country.mean_perf,
            top: country.best_performers.map(p => ({
              name: p.asset.display_name ?? "",
              perf: p.perf
            })),
            worst: country.worst_performers.map(p => ({
              name: p.asset.display_name ?? "",
              perf: p.perf
            })),
            length : country.length,
            onClick : () => {navigate("/home/analysis/"+ country.country?.uuid + `?type=${RankingType.COUNTRIES}`)}
          }
          return mapped
        })
        setCountries(mappingCountries)
        setUserStocks(userStocksMetaData)
      }
      catch(error : any) {
        console.log(error)
        setHasError(true)
      } finally {
         setLoading(false)
         loadingRef.current = false
      }
    }
    fetchAll()
  }, []);

  useEffect(() => { //change portfolio
    if (!didMountRef.current) {
      didMountRef.current = true;
      return; // skip initial mount, effect #1 already handles it
    }
    if (!selectedPortfolioId) return;
    setLoading(true);
    setHasError(false);
    analysisService.getUserStocksMetaData(selectedPortfolioId,0,LIMIT,"") 
      .then(setUserStocks)
      .catch(() => {})
      .finally(() => {setLoading(false)});
  }, [selectedPortfolioId]);

  const fetchMore = useCallback(
    async (currentSearch: string, offset: number, replace: boolean) => {
      if (loadingRef.current) return;
      if (!replace && !hasMore) return;
      loadingRef.current = true;
      setIsLoadingMore(true);

      try {
        const newData = await analysisService.getUserStocksMetaData(selectedPortfolioId, offset, LIMIT, currentSearch);
        setUserStocks(prev => {
          if (!prev) return null;
          return {
            ...prev,
            sectorsData: replace ? newData.sectorsData : [...prev.sectorsData, ...newData.sectorsData]
          };
        });
        setHasMore(newData.sectorsData.length > 0);
      } finally {
        loadingRef.current = false;
        setIsLoadingMore(false);
      }
    },[hasMore]
  );
  
  useEffect(() => {
    if (!didMountSearchRef.current) {
      didMountSearchRef.current = true;
      return; // skip le premier run, le fetch initial est déjà fait dans fetchAll
    }
    const timeout = setTimeout(() => {
      setHasMore(true);
      fetchMore(search, 0, true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleScroll = useCallback(() => {
    if (!hasMore || loadingRef.current) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    if (scrollHeight - scrollTop - clientHeight < 250) {
      fetchMore(search, userStocks?.sectorsData.length ?? 0, false);
    }
  }, [hasMore, search, userStocks?.sectorsData.length, fetchMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if ( loading ) {
    return <Loading />
  }
  else if ( hasError || sectors == null || clusters == null ) {
    return <ErrorCardInApp
      iconBg="bg-gray-100"
      icon={<HiOutlineXCircle className="w-8 h-8 text-gray-400" />}
      title="Can't fetch details"
      description="An error has occured try again later"
    />
  }

  return (
      <>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-gray-900 text-xl font-bold tracking-tight">
              Analysis
            </h2>
            <p className="text-gray-LIMIT0 text-sm mt-0.5">See each assets ranking compared to peers in the past year.</p>
          </div>
          <SearchBar
            value={search}
            onChange={(v) => setSearch(v)}
            placeholder="Search groups…"
          />
        </div>
        <div className="flex items-center bg-zinc-100 rounded-xl p-1 w-fit mb-6">
          <button
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${view === "my_stocks" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
            onClick={() => setView("my_stocks")}
          >
            My stocks
          </button>
          <button
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${view === "sector" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
            onClick={() => setView("sector")}
          >
            Sectors
          </button>
          <button
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${view === "countries" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
            onClick={() => setView("countries")}
          >
            Countries
          </button>
          <button
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${view === "cluster" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
            onClick={() => setView("cluster")}
          >
            Group by characteristic
          </button>
        </div>

        {view === "my_stocks" && (
          !selectedPortfolioId || selectedPortfolioId === ""
            ? <NoPortfolioSelected />
            : (
              <div className="mt-6 bg-white border border-zinc-200 rounded-xl" >
                {userStocks == null || (userStocks.sectorsData ?? []).length === 0
                  ? <p className="text-sm text-zinc-400 text-center py-6">No stocks found</p>
                  : (userStocks.sectorsData ?? [])
                      .map(p => {
                        return (
                          <div key={p.asset.uuid}>
                            <StocksDetail rankAsset={p} mainRank={"sectors"} />
                          </div>
                        );
                      })
                }
                {isLoadingMore && <p className="text-center py-2 text-sm text-zinc-400">Loading...</p>}
              </div>
            )
        )}

        {view === "cluster" && (
          <div className="grid grid-cols-2 gap-6 items-start">
            {clusters.filter(c => c.name?.toLowerCase()?.includes(search.toLowerCase())).length === 0
              ? <p className="text-sm text-zinc-400 text-center py-6 col-span-2">No clusters found</p>
              : clusters.filter(c => c.name?.toLowerCase()?.includes(search.toLowerCase())).map(c => <CardSectorPerf key={c.name} {...c} />)
            }
          </div>
        )}

        {view === "sector" && (
          <div className="grid grid-cols-2 gap-6 items-start">
            {sectors.filter(c => c.name?.toLowerCase()?.startsWith(search.toLowerCase())).length === 0
              ? <p className="text-sm text-zinc-400 text-center py-6 col-span-2">No sectors found</p>
              : sectors.filter(c => c.name?.toLowerCase()?.startsWith(search.toLowerCase())).map(s => <CardSectorPerf key={s.name} {...s} />)
            }
          </div>
        )}

        {view === "countries" && (
          <div className="grid grid-cols-2 gap-6 items-start">
            {countries.filter(c => c.name?.toLowerCase()?.startsWith(search.toLowerCase())).length === 0
              ? <p className="text-sm text-zinc-400 text-center py-6 col-span-2">No countries found</p>
              : countries.filter(c => c.name?.toLowerCase()?.startsWith(search.toLowerCase())).map(c => <CardSectorPerf key={c.name} {...c} />)
            }
          </div>
        )}
      </>
    );
  };

export default Analysis