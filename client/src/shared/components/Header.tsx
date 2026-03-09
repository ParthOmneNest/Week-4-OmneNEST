import { memo, useEffect, useState } from "react";
import { useMarketStore } from "@/store";
import { useUIStore } from "@/store";
import { BASE_URL, getAuthHeaders } from "@/services/apis/config";
import axios from "axios";

export const Header = memo(function Header() {
  const isConnected = useMarketStore((s) => s.isConnected);
  const tickCount   = useMarketStore((s) => s.tickCount);
  const activeTab   = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

 const [isMarketOpen, setIsMarketOpen] = useState(false);

  useEffect(() => {
    // Header.tsx
const fetchMarketStatus = async () => {
  try {
    const token = localStorage.getItem('bearer_token');
    
    // FIX 1: Correct URL Path (Matching your Postman screenshot)
    // FIX 2: Correct Axios POST syntax -> axios.post(url, data, config)
    const response = await axios.post(
      `${BASE_URL}/v2/api/stocks/market-status`, 
      {}, // Empty body is required as the 2nd argument for POST
      { headers: getAuthHeaders(token || "") } // Headers must be the 3rd argument
    );

    console.log("MARKET STATUS DATA:", response.data);
    
    // FIX 3: Robust status check
    const marketArray = response.data?.market_status;
    if (Array.isArray(marketArray) && marketArray.length > 0) {
      const status = marketArray[0].marketStatus || "";
      setIsMarketOpen(status.toLowerCase().includes("open"));
    }
  } catch (err) {
    console.error("Market API Error", err);
  }
};

    fetchMarketStatus();
    const interval = setInterval(fetchMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const statusLabel = !isConnected ? "OFFLINE" : isMarketOpen ? "LIVE" : "CLOSED";
  const statusColor = (isConnected && isMarketOpen) ? "var(--green)" : "var(--red)";

  const tabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: "dashboard",  label: "Market" },
    { id: "portfolio",  label: "Portfolio" },
    { id: "orderbook",  label: "Order Book" },
    { id: "watchlist",  label: "Watchlist" },
  ];

  return (
    <header  style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: "52px",
      background: "var(--bg-panel)",
      borderBottom: "1px solid var(--border)",
      flexShrink: 0,
      gap: "24px",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <span className="text-[#007dd0]" style={{
          fontFamily: "var(--font-display)", fontSize: "20px",
          fontWeight: "800", letterSpacing: "-0.5px",
        }}>
          OmneNest
        </span>
        <span style={{
          fontSize: "9px", color: "var(--text-muted)",
          letterSpacing: "2px", fontFamily: "var(--font-mono)",
        }}>
          915
        </span>
      </div>

      {/* Nav tabs */}
      <nav style={{ display: "flex", gap: "4px", flex: 1 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? "var(--bg-elevated)" : "none",
            border: activeTab === t.id ? "1px solid var(--border)" : "1px solid transparent",
            color: activeTab === t.id ? "var(--text-primary)" : "var(--text-muted)",
            borderRadius: "var(--radius)",
            padding: "5px 14px",
            fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "500",
            cursor: "pointer", letterSpacing: "0.5px",
            transition: "all 0.15s ease",
          }}>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
        {tickCount > 0 && (
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {tickCount.toLocaleString()} ticks
          </span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div className={(isConnected && isMarketOpen) ? "pulse" : ""} style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: statusColor,
            boxShadow: isConnected && isMarketOpen ? `0 0 6px ${statusColor}` : "none",
          }} />
          <span style={{
            fontSize: "10px", fontWeight: "600", letterSpacing: "1px",
            color: statusColor,
            fontFamily: "var(--font-mono)",
          }}>
            {statusLabel}
          </span>
        </div>
      </div>
    </header>
  );
});
