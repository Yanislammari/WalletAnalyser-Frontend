import { toast } from "sonner";
import { RankingType } from "../../enums/RankType";
import { clusterName } from "../../utils/ClusterNaming";
import type { RankedAsset } from "../../responses/AssetAnalysisResponse";
import { useLocation } from "react-router-dom";

interface RankedProps {
  rankAsset: RankedAsset;
  mainRank: RankingType; // you control which one is "main"
}

export function getMainRankPosition(rankAsset: RankedAsset, mainRank: RankingType) {
  const positionStr = (() => {
    switch (mainRank) {
      case RankingType.SECTORS:
        return rankAsset.rank_sector_position;
      case RankingType.COUNTRIES:
        return rankAsset.rank_country_position;
      case RankingType.CLUSTERS:
        return rankAsset.rank_cluster_position;
    }
  })();

  const [value, total] = positionStr?.split("/").map(Number) ?? [ -1, -1];
  return {value, total};
}

function getMainLabel(rankAsset: RankedAsset, mainRank: RankingType): string {
  switch (mainRank) {
    case RankingType.SECTORS:
      return rankAsset.asset?.sector?.sector_name != null
        ? `in ${rankAsset.asset.sector.sector_name}`
        : "";
    case RankingType.COUNTRIES:
      return rankAsset.asset?.country?.country_name != null
        ? `in ${rankAsset.asset.country.country_name}`
        : "";
    default:
      return "compared to peers";
  }
}

export const StocksDetail = (rankAssetProps: RankedProps) => {
  const location = useLocation();
  const rankAsset = rankAssetProps.rankAsset;
  const perf = rankAsset?.perf ?? 0;
  const isPositive = perf >= 0;
  const {value , total} = getMainRankPosition(rankAsset, rankAssetProps.mainRank)
  
  const topOrBottom = value === -1 || total === -1
  ? "Position not found"
  : (() => {
      const pct = Math.round((value / total) * 100);
      return isPositive ? `Top ${pct == 0 ? 1 : pct}%` : `Bottom ${100 - pct}%`;
    })();

  const handleTagClick = (type: RankingType, position: number, id : string | number | undefined) => {
    if(!id && id != 0) {
      toast.info(`We dont have access to this`)
      return
    }
    const params = new URLSearchParams(location.search);
    params.set("type", type);
    params.set("offset", String(position));
    window.location.href = `/home/analysis/${id}?${params.toString()}`;
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b ${isPositive ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>

      {/* Position badge */}
      <div className={`flex flex-col items-center justify-center min-w-9 h-9 rounded-lg shrink-0 ${isPositive ? "bg-green-200" : "bg-red-200"}`}>
        <span className={`text-[13px] font-medium leading-none ${isPositive ? "text-green-900" : "text-red-900"}`}>
          {value == -1 ? "#" : value}
        </span>
      </div>

      {/* Name + percentile */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">
          {rankAsset.asset.display_name
            ? rankAsset.asset.display_name.length > 40
              ? rankAsset.asset.display_name.slice(0, 40) + "…"
              : rankAsset.asset.display_name
            : ""} ({rankAsset.asset.ticker_name ?? ""})
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">{topOrBottom} {getMainLabel(rankAsset, rankAssetProps.mainRank)}</p>
      </div>

      {/* Tags: country / sector / cluster, each with name + rank */}
      <div className="flex items-center gap-3 mr-5">
        {[
          { type : RankingType.COUNTRIES, label: rankAsset?.asset?.country?.country_name ?? "Unknown", rank: rankAsset.rank_country_position, pos : rankAsset.rank_country, id : rankAsset.asset.country_uuid },
          { type : RankingType.SECTORS, label: rankAsset?.asset?.sector?.sector_name ?? "Unknown", rank: rankAsset.rank_sector_position, pos : rankAsset.rank_sector, id : rankAsset.asset.sector_uuid },
          { type: RankingType.CLUSTERS, label : clusterName(rankAsset.asset.cluster?.cluster) ?? "Unknown", rank: rankAsset.rank_cluster_position, pos : rankAsset.rank_cluster, id : rankAsset.asset.cluster?.cluster },
        ].map((tag, i) => (
          <div
            key={i}
            onClick={() => handleTagClick(tag.type as RankingType, tag.pos ?? 0, tag.id)}
            className="flex flex-wrap items-baseline justify-center gap-x-1 px-2.5 py-1 rounded border border-zinc-200 text-black bg-white w-32 text-center cursor-pointer transition-colors hover:bg-zinc-100 hover:border-zinc-300"
          >
            <span className="text-xs truncate max-w-full">
              {tag.label}
            </span>
            <span className="text-[10px] text-zinc-400 shrink-0 whitespace-nowrap">
              #{tag.rank}
            </span>
          </div>
        ))}
      </div>

      {/* Perf */}
      <span className={`text-sm font-medium tabular-nums shrink-0 ${isPositive ? "text-green-800" : "text-red-800"} mr-5`}>
        {isPositive ? "+" : ""}{perf.toFixed(1)}%
      </span>

    </div>
  );
};