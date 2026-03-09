import { memo } from "react";
import type { Stock } from "@/shared/types";
import { useFlash } from "@/shared/hooks/useFlash";
import { Sparkline } from "@/widgets/ChartContainer/Sparkline";
import { formatPrice, formatPercent, formatChange, formatVolume, getColor, getBgColor } from "@/shared/utils";

type Props = {
  stock: Stock;
  history: number[];
  isSelected: boolean;
  onClick: () => void;
};

export const StockRow = memo(function StockRow({ stock, history, isSelected, onClick }: Props) {
  const flash = useFlash(stock.price);
  const isPos = stock.changePercent >= 0;

  return (
    <tr
      className={flash ? `flash-${flash}` : ""}
      onClick={onClick}
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        cursor: "pointer",
        backgroundColor: isSelected ? "rgba(255,184,0,0.05)" : "transparent",
        transition: "background-color 0.15s ease",
      }}
      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-hover)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = isSelected ? "rgba(255,184,0,0.05)" : "transparent"; }}
    >
      {/* Symbol + name */}
      <td style={{ padding: "10px 16px", minWidth: "140px" }}>
        <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--text-primary)", letterSpacing: "0.3px" }}>
          {stock.symbol}
        </div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>
          {stock.name}
        </div>
      </td>

      {/* Sector */}
      <td style={{ padding: "10px 8px" }}>
        <span style={{
          fontSize: "10px", color: "var(--text-muted)",
          background: "var(--bg-elevated)", padding: "2px 6px",
          borderRadius: "10px", whiteSpace: "nowrap",
        }}>
          {stock.sector}
        </span>
      </td>

      {/* Price */}
      <td style={{ padding: "10px 16px", textAlign: "right" }}>
        <span style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
          {formatPrice(stock.price)}
        </span>
      </td>

      {/* Change % */}
      <td style={{ padding: "10px 16px", textAlign: "right" }}>
        <span className={`badge ${isPos ? "badge-green" : "badge-red"}`}>
          {formatPercent(stock.changePercent)}
        </span>
      </td>

      {/* Abs change */}
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span style={{ fontSize: "12px", color: getColor(stock.change), fontFamily: "var(--font-mono)" }}>
          {formatChange(stock.change)}
        </span>
      </td>

      {/* Volume */}
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {formatVolume(stock.volume)}
        </span>
      </td>

      {/* Sparkline */}
      <td style={{ padding: "8px 16px", textAlign: "center" }}>
        <Sparkline prices={history} isGreen={isPos} width={72} height={28} />
      </td>
    </tr>
  );
});
