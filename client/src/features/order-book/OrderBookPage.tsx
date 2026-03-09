import { useState, useMemo } from "react";
import { useMarketStore } from "@/store";
import { OrderBookWidget } from "@/widgets/MarketDepth/OrderBook";
import { formatPrice, getColor, getBgColor } from "@/shared/utils";
import { Sparkline } from "@/widgets/ChartContainer/Sparkline";

export function OrderBookPage() {
  const stocks      = useMarketStore((s) => s.stocks);
  const priceHistory = useMarketStore((s) => s.priceHistory);
  const orderBook   = useMarketStore((s) => s.orderBook);
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

  const stockList = useMemo(() => Object.values(stocks), [stocks]);
  const selected  = activeSymbol ? stocks[activeSymbol] : stockList[0];

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Stock selector */}
      <div style={{
        width: "220px", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        <div style={{
          padding: "10px 16px", borderBottom: "1px solid var(--border)",
          fontSize: "9px", letterSpacing: "1.5px", color: "var(--text-muted)",
        }}>
          SELECT STOCK
        </div>
        <div className="scroll-y" style={{ flex: 1 }}>
          {stockList.map((s) => {
            const isActive = (activeSymbol ?? stockList[0]?.symbol) === s.symbol;
            return (
              <div key={s.symbol} onClick={() => setActiveSymbol(s.symbol)} style={{
                padding: "10px 16px",
                background: isActive ? "var(--bg-elevated)" : "transparent",
                borderBottom: "1px solid var(--border-subtle)",
                cursor: "pointer",
                borderLeft: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                transition: "all 0.15s",
              }}>
                <div style={{ fontWeight: "700", fontSize: "12px", color: "var(--text-primary)" }}>{s.symbol}</div>
                <div style={{ fontSize: "11px", color: getColor(s.changePercent), fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                  {formatPrice(s.price)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order book + chart */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selected && (
          <>
            {/* Stock header */}
            <div style={{
              padding: "16px 24px", borderBottom: "1px solid var(--border)",
              display: "flex", gap: "24px", alignItems: "center",
            }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "var(--gold)" }}>
                  {selected.symbol}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{selected.name}</div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>
                {formatPrice(selected.price)}
              </div>
              <span className={`badge ${selected.changePercent >= 0 ? "badge-green" : "badge-red"}`}>
                {selected.changePercent >= 0 ? "+" : ""}{selected.changePercent.toFixed(2)}%
              </span>
              <div style={{ marginLeft: "auto" }}>
                <Sparkline
                  prices={priceHistory[selected.symbol] ?? []}
                  isGreen={selected.changePercent >= 0}
                  width={140} height={40}
                />
              </div>
            </div>

            {/* Two-column: order book + depth visual */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              <div style={{ flex: 1, overflowY: "auto", borderRight: "1px solid var(--border)" }}>
                <OrderBookWidget orderBook={orderBook?.symbol === selected.symbol ? orderBook : null} />
              </div>
              {/* Depth visualisation */}
              <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
                {orderBook && (
                  <DepthChart bids={orderBook.bids} asks={orderBook.asks} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Simple depth chart bars
function DepthChart({ bids, asks }: { bids: {price:number;qty:number}[]; asks: {price:number;qty:number}[] }) {
  const maxQty = Math.max(...bids.map(b=>b.qty), ...asks.map(a=>a.qty));
  return (
    <div>
      <div style={{ fontSize: "9px", letterSpacing: "1.5px", color: "var(--text-muted)", marginBottom: "16px" }}>
        MARKET DEPTH
      </div>
      <div style={{ display: "flex", gap: "32px" }}>
        {/* Bids */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "9px", color: "var(--green)", letterSpacing: "1px", marginBottom: "8px" }}>BID DEPTH</div>
          {bids.map((b,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div style={{ fontSize: "11px", color: "var(--green)", fontFamily: "var(--font-mono)", width: "80px" }}>
                {formatPrice(b.price)}
              </div>
              <div style={{
                flex: 1, height: "14px", background: "var(--bg-elevated)",
                borderRadius: "2px", overflow: "hidden",
              }}>
                <div style={{
                  width: `${(b.qty / maxQty) * 100}%`, height: "100%",
                  background: "var(--green-bg)", borderRight: "2px solid var(--green)",
                  transition: "width 0.3s ease",
                }} />
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", width: "50px", textAlign: "right" }}>
                {b.qty}
              </div>
            </div>
          ))}
        </div>
        {/* Asks */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "9px", color: "var(--red)", letterSpacing: "1px", marginBottom: "8px" }}>ASK DEPTH</div>
          {asks.map((a,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div style={{ fontSize: "11px", color: "var(--red)", fontFamily: "var(--font-mono)", width: "80px" }}>
                {formatPrice(a.price)}
              </div>
              <div style={{
                flex: 1, height: "14px", background: "var(--bg-elevated)",
                borderRadius: "2px", overflow: "hidden",
              }}>
                <div style={{
                  width: `${(a.qty / maxQty) * 100}%`, height: "100%",
                  background: "var(--red-bg)", borderRight: "2px solid var(--red)",
                  transition: "width 0.3s ease",
                }} />
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", width: "50px", textAlign: "right" }}>
                {a.qty}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
