import { memo } from "react";
import { useLiveMarketStore } from "@/store/liveMarket.store";
import { formatPrice } from "@/shared/utils";
 
export const LiveMarketFeed = memo(function LiveMarketFeed() {
  const ticks = useLiveMarketStore((s) => s.ticks);
 
  const tickList = Object.values(ticks).sort((a, b) =>
    b.timestamp - a.timestamp
  );
 
  return (
    <div style={{
      width: "240px",
      borderLeft: "1px solid var(--border)",
      background: "var(--bg-panel)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: "8px 12px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{
          fontSize: "9px", letterSpacing: "1.5px",
          color: "var(--text-muted)", fontFamily: "var(--font-mono)",
        }}>
          LIVE TICKS
        </span>
        <span style={{
          fontSize: "10px", color: "var(--green)",
          background: "var(--green-bg)",
          padding: "1px 7px", borderRadius: "10px",
          fontFamily: "var(--font-mono)", fontWeight: "600",
        }}>
          {tickList.length}
        </span>
      </div>
 
      {/* Tick list */}
      <div className="scroll-y" style={{ flex: 1 }}>
        {tickList.length === 0 ? (
          <p style={{
            color: "var(--text-muted)", fontSize: "10px",
            textAlign: "center", padding: "40px 12px",
            fontFamily: "var(--font-mono)",
          }}>
            Waiting for ticks…
          </p>
        ) : (
          tickList.map((tick) => {
            const isPos = tick.changePercent >= 0;
            return (
              <div key={tick.token} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 12px",
                borderBottom: "1px solid var(--border-subtle)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
              }}>
                {/* Token & exchange */}
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: "600" }}>
                    {tick.token}
                  </div>
                  <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>
                    {tick.exchange}
                  </div>
                </div>
 
                {/* Price & change */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "var(--text-primary)", fontWeight: "700" }}>
                    {formatPrice(tick.ltp)}
                  </div>
                  <div style={{
                    fontSize: "10px",
                    color: isPos ? "var(--green)" : "var(--red)",
                  }}>
                    {isPos ? "+" : ""}{tick.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
 
