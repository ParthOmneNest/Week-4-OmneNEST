import { memo } from "react";
import type { OrderBook as OrderBookType } from "@/shared/types";
import { formatPrice } from "@/shared/utils";

type Props = { orderBook: OrderBookType | null };

function DepthBar({ pct, side }: { pct: number; side: "bid" | "ask" }) {
  return (
    <div style={{
      position: "absolute",
      [side === "bid" ? "right" : "left"]: 0,
      top: 0, bottom: 0,
      width: `${pct}%`,
      background: side === "bid" ? "rgba(0,200,124,0.10)" : "rgba(255,77,77,0.10)",
      transition: "width 0.3s ease",
    }} />
  );
}

export const OrderBookWidget = memo(function OrderBookWidget({ orderBook }: Props) {
  if (!orderBook) {
    return (
      <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "11px" }}>
        Waiting for order book…
      </div>
    );
  }

  const maxQty = Math.max(
    ...orderBook.bids.map((b) => b.qty),
    ...orderBook.asks.map((a) => a.qty),
  );

  return (
    <div style={{ fontFamily: "var(--font-mono)" }}>
      {/* Symbol header */}
      <div style={{
        padding: "8px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between",
        fontSize: "10px", color: "var(--text-muted)", letterSpacing: "1px",
      }}>
        <span>{orderBook.symbol}</span>
        <span>ORDER BOOK</span>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        padding: "6px 16px", fontSize: "9px", letterSpacing: "1px",
        color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)",
      }}>
        <span>BID QTY</span>
        <span style={{ textAlign: "center" }}>PRICE</span>
        <span style={{ textAlign: "right" }}>ASK QTY</span>
      </div>

      {/* Rows */}
      {orderBook.bids.map((bid, i) => {
        const ask = orderBook.asks[i];
        const bidPct = (bid.qty / maxQty) * 100;
        const askPct = ask ? (ask.qty / maxQty) * 100 : 0;
        const midPrice = ask ? ((bid.price + ask.price) / 2) : bid.price;

        return (
          <div key={i}>
            {/* Bid + Ask row */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              padding: "5px 16px", fontSize: "11px",
              borderBottom: "1px solid var(--border-subtle)",
              position: "relative", overflow: "hidden",
            }}>
              {/* Bid depth bar behind */}
              <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", pointerEvents: "none" }}>
                <div style={{ position: "relative" }}>
                  <DepthBar pct={bidPct} side="bid" />
                </div>
                <div />
                <div style={{ position: "relative" }}>
                  <DepthBar pct={askPct} side="ask" />
                </div>
              </div>

              <span style={{ color: "var(--green)", fontWeight: "600", zIndex: 1, position: "relative" }}>
                {bid.qty.toLocaleString()}
              </span>
              <span style={{ textAlign: "center", color: "var(--text-secondary)", fontWeight: "500", zIndex: 1, position: "relative", fontSize: "10px" }}>
                {formatPrice(midPrice)}
              </span>
              <span style={{ textAlign: "right", color: "var(--red)", fontWeight: "600", zIndex: 1, position: "relative" }}>
                {ask ? ask.qty.toLocaleString() : "—"}
              </span>
            </div>
          </div>
        );
      })}

      {/* Spread */}
      {orderBook.bids[0] && orderBook.asks[0] && (
        <div style={{
          padding: "6px 16px", textAlign: "center",
          fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.5px",
          borderTop: "1px solid var(--border)",
        }}>
          Spread: {formatPrice(orderBook.asks[0].price - orderBook.bids[0].price)}
        </div>
      )}
    </div>
  );
});
