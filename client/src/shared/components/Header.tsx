import { memo } from "react";
import { useMarketStore } from "@/store";
import { useUIStore } from "@/store";

export const Header = memo(function Header() {
  const isConnected = useMarketStore((s) => s.isConnected);
  const tickCount   = useMarketStore((s) => s.tickCount);
  const activeTab   = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  const tabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: "dashboard",  label: "Market" },
    { id: "portfolio",  label: "Portfolio" },
    { id: "orderbook",  label: "Order Book" },
    { id: "watchlist",  label: "Watchlist" },
  ];

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: "52px",
      background: "var(--bg-panel)",
      borderBottom: "1px solid var(--border)",
      flexShrink: 0,
      gap: "24px",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <span style={{
          fontFamily: "var(--font-display)", fontSize: "20px",
          fontWeight: "800", color: "var(--green)", letterSpacing: "-0.5px",
        }}>
          groww
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
          <div className={isConnected ? "pulse" : ""} style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: isConnected ? "var(--green)" : "var(--red)",
            boxShadow: isConnected ? "0 0 6px var(--green)" : "none",
          }} />
          <span style={{
            fontSize: "10px", fontWeight: "600", letterSpacing: "1px",
            color: isConnected ? "var(--green)" : "var(--red)",
            fontFamily: "var(--font-mono)",
          }}>
            {isConnected ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>
    </header>
  );
});
