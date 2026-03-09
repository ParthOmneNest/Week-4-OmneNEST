import { create } from "zustand";
import type { Holding } from "@/shared/types";

type PortfolioState = {
  holdings: Holding[];
  addHolding: (h: Holding) => void;
  removeHolding: (symbol: string) => void;
  updateHolding: (symbol: string, qty: number, avgBuyPrice: number) => void;
};

// Seed with demo holdings
const SEED_HOLDINGS: Holding[] = [
  { symbol: "TCS",        qty: 10,  avgBuyPrice: 3700.00 },
  { symbol: "INFY",       qty: 25,  avgBuyPrice: 1450.00 },
  { symbol: "HDFCBANK",   qty: 15,  avgBuyPrice: 1580.00 },
  { symbol: "RELIANCE",   qty: 8,   avgBuyPrice: 2800.00 },
  { symbol: "BAJFINANCE", qty: 5,   avgBuyPrice: 6400.00 },
];

export const usePortfolioStore = create<PortfolioState>((set) => ({
  holdings: SEED_HOLDINGS,

  addHolding: (h) =>
    set((state) => {
      const existing = state.holdings.find((x) => x.symbol === h.symbol);
      if (existing) {
        const totalQty   = existing.qty + h.qty;
        const totalCost  = existing.qty * existing.avgBuyPrice + h.qty * h.avgBuyPrice;
        return {
          holdings: state.holdings.map((x) =>
            x.symbol === h.symbol
              ? { ...x, qty: totalQty, avgBuyPrice: totalCost / totalQty }
              : x
          ),
        };
      }
      return { holdings: [...state.holdings, h] };
    }),

  removeHolding: (symbol) =>
    set((state) => ({ holdings: state.holdings.filter((h) => h.symbol !== symbol) })),

  updateHolding: (symbol, qty, avgBuyPrice) =>
    set((state) => ({
      holdings: state.holdings.map((h) =>
        h.symbol === symbol ? { ...h, qty, avgBuyPrice } : h
      ),
    })),
}));
