import { useState, useMemo, useCallback, memo } from "react";
import { useMarketStore } from "@/store";
import { StockTable } from "@/features/dashboard/StockTable";
import { StockDetail } from "@/features/stock-details/StockDetail";
import { EventFeed } from "@/widgets/LiveTicker/EventFeed";
import type { Stock } from "@/shared/types";

export const DashboardPage = memo(function DashboardPage() {
  const stocks        = useMarketStore((s) => s.stocks);
  const priceHistory  = useMarketStore((s) => s.priceHistory);
  const selectedSymbol = useMarketStore((s) => s.selectedSymbol);
  const setSelected   = useMarketStore((s) => s.setSelected);

  const [searchText, setSearchText] = useState("");
  const [sortBy,  setSortBy]  = useState<keyof Stock>("symbol");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filteredStocks = useMemo(() => {
    const q = searchText.toUpperCase().trim();
    const all = Object.values(stocks);
    if (!q) return all;
    return all.filter((s) => s.symbol.includes(q) || s.name.toUpperCase().includes(q) || s.sector.toUpperCase().includes(q));
  }, [stocks, searchText]);

  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      const va = a[sortBy], vb = b[sortBy];
      const cmp = typeof va === "string" ? (va as string).localeCompare(vb as string) : (va as number) - (vb as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredStocks, sortBy, sortDir]);

  const handleSort = useCallback((col: string) => {
    if (sortBy === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortBy(col as keyof Stock); setSortDir("asc"); }
  }, [sortBy]);

  const selectedStock   = selectedSymbol ? stocks[selectedSymbol] : null;
  const selectedHistory = selectedSymbol ? (priceHistory[selectedSymbol] ?? []) : [];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Search bar */}
      <div style={{
        padding: "10px 20px", borderBottom: "1px solid var(--border)",
        background: "var(--bg-panel)",
        display: "flex", alignItems: "center", gap: "12px",
        flexShrink: 0,
      }}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
            color: "var(--text-muted)", fontSize: "12px", pointerEvents: "none",
          }}>⌕</span>
          <input
            type="text"
            placeholder="Search by symbol, name or sector…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              paddingLeft: "28px", paddingRight: "12px", paddingTop: "7px", paddingBottom: "7px",
              width: "300px",
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", color: "var(--text-primary)",
              fontFamily: "var(--font-mono)", fontSize: "12px",
            }}
          />
        </div>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {sortedStocks.length} stocks
        </span>

        {/* Sector pills */}
        <div style={{ display: "flex", gap: "6px", marginLeft: "8px" }}>
          {["IT", "Bank", "Energy", "Auto", "Pharma"].map((sec) => (
            <button key={sec} onClick={() => setSearchText(sec === searchText ? "" : sec)}
              style={{
                background: searchText === sec ? "var(--bg-elevated)" : "none",
                border: searchText === sec ? "1px solid var(--border)" : "1px solid transparent",
                color: searchText === sec ? "var(--text-primary)" : "var(--text-muted)",
                borderRadius: "10px", padding: "3px 10px",
                fontFamily: "var(--font-mono)", fontSize: "10px", cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <StockTable
          stocks={sortedStocks}
          priceHistory={priceHistory}
          sortBy={sortBy as string}
          sortDir={sortDir}
          onSort={handleSort}
        />
        <StockDetail
          stock={selectedStock ?? null}
          history={selectedHistory}
          onClose={() => setSelected(null)}
        />
        <EventFeed />
      </div>
    </div>
  );
});
