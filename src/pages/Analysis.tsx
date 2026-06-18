import { useNavigate, type NavigateFunction } from "react-router-dom";
import CardSectorPerf, { CardUserStocksPerf, type SectorCardDataProps, type UserStocksRankingProps } from "../components/CardSectorPerf";
import AnalysisService from "../services/Analysis"
import React, { useEffect, useState } from "react"
import ErrorCardInApp from "../components/ErrorCardInApp";
import { HiOutlineXCircle } from "react-icons/hi2";
import Loading from "../components/Loading";
import SearchBar from "../components/SearchBar";
import { clusterName } from "../utils/ClusterNaming";

const Analysis: React.FC = () => {
  const analysisService = AnalysisService.getInstance();
  const [clusters, setClusters] = useState<SectorCardDataProps[]>([]);
  const [sectors, setSectors] = useState<SectorCardDataProps[]>([]);
  const [countries, setCountries] = useState<SectorCardDataProps[]>([]);
  const [userStocks, setUserStocks] = useState<UserStocksRankingProps[]>([]);
  const navigate: NavigateFunction = useNavigate();
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [view, setView] = useState<"cluster" | "sector" | "my_stocks" | "countries">("my_stocks");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try{
        const [sectorsMetaData, clusterMetaData, userStocksMetaData] = await Promise.all([
          analysisService.getSectorsMetaData(),
          analysisService.getClustersMetaData(),
          analysisService.getUserStocksMetaData()
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
            onClick : () => {navigate("/home/analysis/"+ sector.sector?.uuid + "?type=sector")}
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
            onClick : () => {navigate("/home/analysis/"+ cluster.unique_key + "?type=cluster")}
          }
          return mapped
        })
        setClusters(mappingClusters)
        const userStocksMapped = userStocksMetaData.sectorsData.map((userStock) =>{
          const mapped : UserStocksRankingProps = {
            onClick : () => { navigate("/home/analysis/" + userStock.asset.sector_uuid + `?type=sector&offset=${userStock.rank_position}`)},
            ranking : userStock.rank,
            sector_name : userStock.asset.sector.sector_name,
            country_name : userStock.asset.country.country_name,
            perf52w : userStock.perf,
            display_name : userStock.asset.display_name
          }
          return mapped
        })
        setUserStocks(userStocksMapped)
      }
      catch(error : any) {
        setHasError(true)
      } finally {
         setLoading(false)
      }
    }
    fetchAll()
  }, []);

  if ( loading ) {
    return <Loading />
  }
  else if ( hasError || userStocks == null || sectors == null || clusters == null ) {
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
            <p className="text-gray-500 text-sm mt-0.5">See each assets ranking compared to peers in the past year.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SearchBar
              value={search}
              onChange={(v) => setSearch(v)}
              placeholder="Search groups…"
            />
          </div>
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
            AI regrouping
          </button>
        </div>
        {view === "my_stocks" && (
          <div className="grid grid-cols-1 gap-3 items-start">
            {userStocks.filter(c => c.display_name?.toLowerCase()?.startsWith(search.toLowerCase())).length === 0
              ? <p className="text-sm text-zinc-400 text-center py-6">No stocks found</p>
              : userStocks.filter(c => c.display_name?.toLowerCase()?.startsWith(search.toLowerCase())).map((s) => <CardUserStocksPerf key={s.display_name} {...s} />)
            }
          </div>
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