import React, { useEffect, useState } from "react"
import { HiOutlineArrowLeft, HiOutlineXCircle } from "react-icons/hi2";
import { useNavigate, useParams, useSearchParams, type NavigateFunction } from "react-router-dom";
import AnalysisService from "../services/Analysis";
import SearchBar from "../components/SearchBar";
import Loading from "../components/Loading";
import ErrorCardInApp from "../components/ErrorCardInApp";
import type { AssetRankingResponse, RankedAsset } from "../responses/AssetAnalysisResponse";

interface RankedProps {
  length: number;
  position: number;
  rankAsset: RankedAsset;
}

const StocksDetail = (rankAssetProps: RankedProps) => {
  const rankAsset = rankAssetProps.rankAsset;
  const perf = rankAsset?.perf ?? 0;
  const isPositive = perf >= 0;
  const pct = Math.round((rankAssetProps.position / rankAssetProps.length) * 100);
  const topOrBottom = isPositive ? `Top ${pct}%` : `Bottom ${100 - pct}%`;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b ${isPositive ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>

      {/* Position badge */}
      <div className={`flex flex-col items-center justify-center min-w-[36px] h-9 rounded-lg flex-shrink-0 ${isPositive ? "bg-green-200" : "bg-red-200"}`}>
        <span className={`text-[13px] font-medium leading-none ${isPositive ? "text-green-900" : "text-red-900"}`}>
          {rankAssetProps.position}
        </span>
      </div>

      {/* Name + percentile */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{rankAsset.asset.display_name ? rankAsset.asset.display_name.length > 40 ? rankAsset.asset.display_name.slice(0, 40) + "…" : rankAsset.asset.display_name : ""}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{topOrBottom} in {rankAsset.asset.sector.sector_name}</p>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs px-2.5 py-1 rounded border border-zinc-200 text-zinc-500 bg-white">
          {rankAsset?.asset?.country?.country_name ?? "Unknow"}
        </span>
        <span className="text-xs px-2.5 py-1 rounded border border-zinc-200 text-zinc-500 bg-white">
          {rankAsset?.asset?.sector?.sector_name ?? "Unknow"}
        </span>
      </div>

      {/* Perf */}
      <span className={`text-sm font-medium tabular-nums flex-shrink-0 ${isPositive ? "text-green-800" : "text-red-800"}`}>
        {isPositive ? "+" : ""}{perf.toFixed(1)}%
      </span>

    </div>
  );
};

const AnalysisDetail: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();
  const analysisService = AnalysisService.getInstance();
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [sectorMetaData, setSectorMetaData] = useState<AssetRankingResponse | null>(null)
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  useEffect(()=>{
    const fetch = async () => {
      setLoading(true)
      try{
        if(type == null || !uuid) {
          throw Error()
        }
        const response = await analysisService.getWholeSectorsDetailMetaData(type,uuid)
        setSectorMetaData(response)
      } catch(e) {
        setHasError(true)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  },[])

  if ( loading ) {
    return <Loading />
  }
  else if ( hasError || sectorMetaData == null ) {
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
            <p className="text-gray-500 text-sm mt-0.5">See each stocks performances for the last year.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SearchBar
            value={search}
            onChange={(v) => setSearch(v)}
            placeholder="Search stocks…"
          />
        </div>
      </div>
      <div className="mt-6 bg-white border border-zinc-200 rounded-xl">
        {sectorMetaData.sectorsData.filter(p => p.asset.display_name?.toLowerCase()?.includes(search.toLowerCase())).map((p, index) => (
          <StocksDetail
            key={p.asset.uuid}
            length={sectorMetaData.sectorsData.length} position={index + 1} rankAsset={p}
          />
        ))}
      </div>
    </>
  );
};

export default AnalysisDetail;
