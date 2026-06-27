import { useNavigate, type NavigateFunction } from "react-router-dom";
import CardSectorPerf, { type SectorCardDataProps } from "../components/CardSectorPerf";
import AnalysisService from "../services/Analysis"
import React, { useEffect, useState } from "react"
import ErrorCardInApp from "../components/ErrorCardInApp";
import { HiOutlineXCircle } from "react-icons/hi2";
import Loading from "../components/Loading";
import SearchBar from "../components/SearchBar";
import { clusterName } from "../utils/ClusterNaming";
import { useSelectedPortfolio } from "../providers/SelectedPortfolioProvider";
import NoPortfolioSelected from '../components/Error/NoPortfolioSelected';
import type { AssetRankingResponse } from "../responses/AssetAnalysisResponse";
import { StocksDetail } from "./AnalysisDetail";
import { RankingType } from "../enums/RankType";

const Analysis: React.FC = () => {
  const analysisService = AnalysisService.getInstance();
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

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try{
        const [sectorsMetaData, clusterMetaData, countriesMetaData, userStocksMetaData] = await Promise.all([
          analysisService.getSectorsMetaData(),
          analysisService.getClustersMetaData(),
          analysisService.getCountriesMetaData(),
          selectedPortfolioId ? analysisService.getUserStocksMetaData(selectedPortfolioId) : Promise.resolve(null)
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
      }
    }
    fetchAll()
  }, []);

  useEffect(() => {
    if (!selectedPortfolioId) return;
    setLoading(true);
    setHasError(false);
    analysisService.getUserStocksMetaData(selectedPortfolioId) 
      .then(setUserStocks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedPortfolioId]);

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
            <p className="text-gray-500 text-sm mt-0.5">See each assets ranking compared to peers in the past year.</p>
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
              <div className="mt-6 bg-white border border-zinc-200 rounded-xl">
                {userStocks == null || (userStocks.sectorsData ?? []).filter(p => p.asset.display_name?.toLowerCase()?.includes(search.toLowerCase())).length === 0
                  ? <p className="text-sm text-zinc-400 text-center py-6">No stocks found</p>
                  : (userStocks.sectorsData ?? [])
                      .filter(p => p.asset.display_name?.toLowerCase()?.includes(search.toLowerCase()))
                      .map(p => {
                        return (
                          <div key={p.asset.uuid}>
                            <StocksDetail rankAsset={p} mainRank={"sectors"} />
                          </div>
                        );
                      })
                }
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