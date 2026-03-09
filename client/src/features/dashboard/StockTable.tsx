import { memo } from "react";
import type { Stock } from "@/shared/types";
import { StockRow } from "./StockRow";
import { useMarketStore } from "@/store";

type Props = {
  stocks: Stock[];
  priceHistory: Record<string, number[]>;
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (col: string) => void;
};

const COLS = [
  { key: "symbol",        label: "SYMBOL",  align: "left"   as const },
  { key: "sector",        label: "SECTOR",  align: "left"   as const, noSort: true },
  { key: "price",         label: "PRICE",   align: "right"  as const },
  { key: "changePercent", label: "CHG %",   align: "right"  as const },
  { key: "change",        label: "CHG",     align: "right"  as const },
  { key: "volume",        label: "VOLUME",  align: "right"  as const },
  { key: "trend",         label: "TREND",   align: "center" as const, noSort: true },
];

export const StockTable = memo(function StockTable({ stocks, priceHistory, sortBy, sortDir, onSort }: Props) {
  const selectedSymbol = useMarketStore((s) => s.selectedSymbol);
  const setSelected    = useMarketStore((s) => s.setSelected);

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "var(--bg-panel)",
          borderBottom: "1px solid var(--border)",
        }}>
          <tr>
            {COLS.map((col) => (
              <th key={col.key}
                onClick={() => !col.noSort && onSort(col.key)}
                style={{
                  padding: "8px 16px",
                  textAlign: col.align,
                  fontSize: "9px", letterSpacing: "1.5px",
                  fontWeight: "700",
                  fontFamily: "var(--font-mono)",
                  color: sortBy === col.key ? "var(--gold)" : "var(--text-muted)",
                  cursor: col.noSort ? "default" : "pointer",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                }}
              >
                {col.label}
                {sortBy === col.key && (
                  <span style={{ marginLeft: "4px" }}>
                    {sortDir === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <StockRow
              key={stock.symbol}
              stock={stock}
              history={priceHistory[stock.symbol] ?? []}
              isSelected={selectedSymbol === stock.symbol}
              onClick={() => setSelected(selectedSymbol === stock.symbol ? null : stock.symbol)}
            />
          ))}
          {stocks.length === 0 && (
            <tr>
              <td colSpan={7} style={{
                textAlign: "center", padding: "60px",
                color: "var(--text-muted)", fontFamily: "var(--font-mono)",
              }}>
                No stocks found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});
