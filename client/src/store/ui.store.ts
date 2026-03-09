import { create } from "zustand";
import type { WatchlistItem } from "@/shared/types";

type Notification = { id: number; msg: string; kind: "success" | "error" | "info" };
let notifId = 0;

type UIState = {
  watchlist: WatchlistItem[];
  sidebarOpen: boolean;
  notifications: Notification[];
  activeTab: "dashboard" | "portfolio" | "orderbook" | "watchlist";

  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setSidebarOpen: (v: boolean) => void;
  setActiveTab: (tab: UIState["activeTab"]) => void;
  pushNotification: (msg: string, kind?: Notification["kind"]) => void;
  dismissNotification: (id: number) => void;
};

export const useUIStore = create<UIState>((set) => ({
  watchlist: [
    { symbol: "TCS" },
    { symbol: "RELIANCE" },
    { symbol: "HDFCBANK" },
    { symbol: "INFY" },
    { symbol: "BAJFINANCE" },
  ],
  sidebarOpen: true,
  notifications: [],
  activeTab: "dashboard",

  addToWatchlist: (symbol) =>
    set((state) => ({
      watchlist: state.watchlist.find((w) => w.symbol === symbol)
        ? state.watchlist
        : [...state.watchlist, { symbol }],
    })),

  removeFromWatchlist: (symbol) =>
    set((state) => ({ watchlist: state.watchlist.filter((w) => w.symbol !== symbol) })),

  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  pushNotification: (msg, kind = "info") =>
    set((state) => ({
      notifications: [
        { id: ++notifId, msg, kind },
        ...state.notifications,
      ].slice(0, 5),
    })),

  dismissNotification: (id) =>
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
}));
