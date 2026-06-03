import CardSectorPerf, { type ClusterCardData } from "../components/CardSectorPerf";
import AnalysisService from "../services/Analysis"
import React, { useEffect, useState } from "react"

const Analysis: React.FC = () => {
  const analysisService = AnalysisService.getInstance();
  const [clusters, setClusters] = useState<ClusterCardData[]>([]);
  const [view, setView] = useState<"cluster" | "sector">("sector");

  useEffect(() => {
   setClusters(
    [
      {
        clusterName : "Utilities",
        perf52w : 50,
        top : [
          {
            name : "NVIDIA corp",
            perf : -50
          },
          {
            name : "NVIDIA",
            perf : 30
          },
                    {
            name : "NVIDIA",
            perf : -30
          }
        ],
        worst : [
                    {
            name : "NVIDIA",
            perf : -50
          },
                    {
            name : "NVIDIA",
            perf : -10
          },
                    {
            name : "NVIDIA",
            perf : 10
          },
        ]
      },
      {
        clusterName : "Communication Services",
        perf52w : -50,
        top : [
          {
            name : "NVIDIA",
            perf : 50
          },
          {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          }
        ],
        worst : [
                    {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          },
        ]
      },
      {
        clusterName : "Alpha",
        perf52w : 50,
        top : [
          {
            name : "NVIDIA",
            perf : 50
          },
          {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          }
        ],
        worst : [
                    {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          },
        ]
      },
      {
        clusterName : "Test",
        perf52w : 50,
        top : [
          {
            name : "NVIDIA",
            perf : 50
          },
          {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          }
        ],
        worst : [
                    {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          },
                    {
            name : "NVIDIA",
            perf : 50
          },
        ]
      },
    ]
   )
  }, []);

return (
    <>
      <div className="flex items-center bg-zinc-100 rounded-xl p-1 w-fit mb-6">
        <button
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${view === "sector" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
          onClick={() => setView("sector")}
        >
          Sector
        </button>
        <button
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${view === "cluster" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
          onClick={() => setView("cluster")}
        >
          Cluster
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 items-start">
        {view === "cluster"
          ? clusters.map(c => <CardSectorPerf key={c.clusterName} {...c} />)
          : clusters.map(s => <CardSectorPerf key={s.clusterName} {...s} />)
        }
      </div>
    </>
  );
};

export default Analysis