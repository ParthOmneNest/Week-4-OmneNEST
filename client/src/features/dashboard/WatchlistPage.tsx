import { useMemo } from "react";
import { useUIStore } from "@/store/ui.store";
import { useMarketStore } from "@/store";
import { formatPrice, formatPercent, getColor } from "@/shared/utils";
import { Sparkline } from "@/widgets/ChartContainer/Sparkline";

export function WatchlistPage() {
  const watchlist         = useUIStore((s) => s.watchlist);
  const removeFromWatchlist = useUIStore((s) => s.removeFromWatchlist);
  const stocks            = useMarketStore((s) => s.stocks);
  const priceHistory      = useMarketStore((s) => s.priceHistory);
  const setSelected       = useMarketStore((s) => s.setSelected);
  const setActiveTab      = useUIStore((s) => s.setActiveTab);

  const items = useMemo(() =>
    watchlist.map((w) => ({ ...w, stock: stocks[w.symbol] }))
    .filter((w) => w.stock),
  [watchlist, stocks]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "20px",
      }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>
            Watchlist
          </h2>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            {items.length} stocks being tracked
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: "12px", padding: "80px 0",
          color: "var(--text-muted)", fontFamily: "var(--font-mono)",
        }}>
          <div style={{ fontSize: "32px" }}>◉</div>
          <div style={{ fontSize: "13px" }}>Your watchlist is empty</div>
          <div style={{ fontSize: "11px" }}>Click any stock in the Market tab and add it here</div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "14px",
        }}>
          {items.map(({ symbol, stock }) => {
            if (!stock) return null;
            const isPos = stock.changePercent >= 0;
            return (
              <div key={symbol} style={{
                background: "var(--bg-panel)", border: "1px solid var(--border)",
                borderRadius: "var(--radius)", padding: "16px",
                cursor: "pointer", transition: "border-color 0.15s, transform 0.15s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = isPos ? "var(--green)" : "var(--red)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                onClick={() => {
                  setSelected(symbol);
                  setActiveTab("dashboard");
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-primary)" }}>{symbol}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{stock.name}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromWatchlist(symbol); }}
                    style={{
                      background: "none", border: "none", color: "var(--text-muted)",
                      cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "2px 4px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  >×</button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {formatPrice(stock.price)}
                    </div>
                    <span className={`badge ${isPos ? "badge-green" : "badge-red"}`} style={{ marginTop: "4px" }}>
                      {formatPercent(stock.changePercent)}
                    </span>
                  </div>
                  <Sparkline prices={priceHistory[symbol] ?? []} isGreen={isPos} width={80} height={36} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
