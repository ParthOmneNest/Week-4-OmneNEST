import { memo } from "react";
import type { Stock } from "@/shared/types";
import { Sparkline } from "@/widgets/ChartContainer/Sparkline";
import { formatPrice, formatPercent, formatChange, formatVolume, formatMarketCap, getColor, getBgColor } from "@/shared/utils";
import { useUIStore } from "@/store";

type Props = {
  stock: Stock | null;
  history: number[];
  onClose: () => void;
};

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "7px 0", borderBottom: "1px solid var(--border-subtle)",
    }}>
      <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "1px", fontWeight: "500" }}>
        {label}
      </span>
      <span style={{ fontSize: "12px", fontWeight: "600", color: color ?? "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
        {value}
      </span>
    </div>
  );
}

export const StockDetail = memo(function StockDetail({ stock, history, onClose }: Props) {
  const addToWatchlist = useUIStore((s) => s.addToWatchlist);
  const pushNotification = useUIStore((s) => s.pushNotification);

  if (!stock) {
    return (
      <div style={{
        width: "270px", borderLeft: "1px solid var(--border)",
        background: "var(--bg-panel)", display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <p style={{
          color: "var(--text-muted)", fontFamily: "var(--font-mono)",
          fontSize: "11px", textAlign: "center", lineHeight: "1.8",
        }}>
          Click any stock<br />to see details
        </p>
      </div>
    );
  }

  const isPos = stock.changePercent >= 0;

  return (
    <div style={{
      width: "270px", borderLeft: "1px solid var(--border)",
      background: "var(--bg-panel)", overflowY: "auto", flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: "16px", borderBottom: "1px solid var(--border)",
        position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "12px", right: "12px",
          background: "none", border: "none", color: "var(--text-muted)",
          fontSize: "18px", cursor: "pointer", lineHeight: 1,
          padding: "2px 6px", borderRadius: "4px",
          transition: "color 0.15s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >×</button>

        <div style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "1.5px", marginBottom: "4px" }}>
          {stock.sector}
        </div>
        <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--gold)", fontFamily: "var(--font-display)" }}>
          {stock.symbol}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>
          {stock.name}
        </div>

        <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
          {formatPrice(stock.price)}
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "6px", alignItems: "center" }}>
          <span className={`badge ${isPos ? "badge-green" : "badge-red"}`}>
            {formatPercent(stock.changePercent)}
          </span>
          <span style={{ fontSize: "12px", color: getColor(stock.change), fontFamily: "var(--font-mono)", fontWeight: "600" }}>
            {formatChange(stock.change)}
          </span>
        </div>

        {/* Sparkline */}
        <div style={{ marginTop: "14px" }}>
          <Sparkline prices={history} isGreen={isPos} width={238} height={56} />
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
          <button onClick={() => { addToWatchlist(stock.symbol); pushNotification(`${stock.symbol} added to watchlist`, "success"); }}
            style={{
              flex: 1, padding: "7px",
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", borderRadius: "var(--radius)",
              fontFamily: "var(--font-mono)", fontSize: "10px", cursor: "pointer",
              letterSpacing: "0.5px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
          >
            + WATCHLIST
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ padding: "12px 16px" }}>
        <StatRow label="OPEN"     value={formatPrice(stock.open)} />
        <StatRow label="PREV"     value={formatPrice(stock.prevClose)} />
        <StatRow label="HIGH"     value={formatPrice(stock.high)}     color="var(--green)" />
        <StatRow label="LOW"      value={formatPrice(stock.low)}      color="var(--red)" />
        <StatRow label="VOLUME"   value={formatVolume(stock.volume)} />
        <StatRow label="MKT CAP"  value={formatMarketCap(stock.marketCap)} />
        <StatRow label="DAY RANGE" value={`${formatPrice(stock.low)} – ${formatPrice(stock.high)}`} />
      </div>
    </div>
  );
});
