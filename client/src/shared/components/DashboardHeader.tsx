import { memo, useEffect, useState } from "react";
import { useUIStore } from "@/store";
import { getDashboardConfig } from "@/services/apis/dashboard";
import { BASE_URL, getAuthHeaders } from "@/services/apis/config";
import axios from "axios";

export const DashboardHeader = memo(function DashboardHeader() {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  // Local state for features and market status
  const [features, setFeatures] = useState<{ name: string }[]>([]);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  // Manual connection state (Set to true by default for now, or link to your WS hook)
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("bearer_token") || "";

      try {
        // 1. Fetch Dashboard Config
        const configData = await getDashboardConfig();
        const featuresList = configData?.dashboard?.features || configData?.data?.features || [];
        setFeatures(featuresList);
        setErrorStatus(null);

        // 2. Fetch Market Status
        const statusRes = await axios.post(
          `${BASE_URL}/v2/api/stocks/market-status`,
          {},
          { headers: getAuthHeaders(token) }
        );


        const marketData = statusRes.data?.market_status;
        const status = (Array.isArray(marketData) ? marketData[0]?.marketStatus : marketData?.marketStatus) || "";
        setIsMarketOpen(status.toLowerCase().includes("open"));
      } catch (err: any) {
        console.error("Sync Error:", err);
        setErrorStatus(err.response?.status || 500);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const getErrorMessage = () => {
    if (errorStatus === 412) return "SESSION AUTH REQUIRED";
    if (errorStatus === 404) return "CONFIG NOT FOUND";
    return "SYNCING ERROR";
  };

  // Logic for the live indicator
  const isLive = isConnected && isMarketOpen;
  const statusColor = isLive ? "bg-green-500" : "bg-red-500";
  const statusText = !isConnected ? "OFFLINE" : isMarketOpen ? "LIVE" : "CLOSED";

  return (
    <header className="flex h-10 shrink-0 items-center border-b border-(--border) bg-(--bg-panel) px-6">

      <div className="flex items-center gap-3 pr-6 border-r border-(--border) h-full mr-6">
        <span className="font-display text-sm font-extrabold tracking-tight text-[#007dd0]">
          OmneNest
        </span>
        <span className="font-mono text-[9px] tracking-widest text-(--text-muted) uppercase whitespace-nowrap">
          INSIGHTS:
        </span>
      </div>

      <nav className="no-scrollbar flex flex-1 items-center gap-6 overflow-x-auto whitespace-nowrap">
        {features.length > 0 ? (
          features.map((f, index) => {
            const id = f.name.toLowerCase().replace(/\s+/g, "-");
            const isWatchlist = id.includes("watchlist");
            const isIndices = id.includes("indices");

            // Determine if this tab is active
            const isActive = (isWatchlist && activeTab === "watchlist") ||
              (isIndices && activeTab === "indices") ||
              activeTab === id;

            return (
              <button
                key={index}
                onClick={() => {
                  if (isWatchlist) setActiveTab("watchlist");
                  else if (isIndices) setActiveTab("indices");
                  else setActiveTab(id as any);
                }}
                className={`flex items-center gap-2 font-mono text-[10px] font-medium transition-all cursor-pointer ${isActive ? "text-(--text-primary)" : "text-(--text-muted) hover:text-(--text-primary)"
                  }`}
              >
                <span className="text-green-500">•</span>
                {f.name.toUpperCase()}
              </button>
            );
          })
        ) : (
          <span className={`font-mono text-[9px] ${errorStatus ? "text-red-500" : "text-green-500"} animate-pulse`}>
            {errorStatus ? getErrorMessage() : "[ INITIALIZING MARKET DATA ]"}
          </span>
        )}
      </nav>

      {/* LIVE STATUS AREA */}
      <div className="flex shrink-0 items-center gap-2 ml-4 pl-4 border-l border-(--border) h-full">
        <div className={`h-1.5 w-1.5 rounded-full ${statusColor} ${isLive ? 'shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse' : ''}`} />
        <span className={`font-mono text-[9px] font-bold tracking-tighter ${isLive ? 'text-green-500' : 'text-red-500'}`}>
          {statusText}
        </span>
      </div>
    </header>
  );
});
