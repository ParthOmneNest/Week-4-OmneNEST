import { useWebSocket } from "@/shared/hooks/useWebSocket";
import { Header } from "@/shared/components/Header";
import { NotificationStack } from "@/shared/components/NotificationStack";
import { DashboardPage } from "@/pages/DashboardPage";
import { PortfolioPage } from "@/features/portfolio-overview/PortfolioPage";
import { OrderBookPage } from "@/features/order-book/OrderBookPage";
import { WatchlistPage } from "@/features/dashboard/WatchlistPage";
import { useUIStore } from "@/store/ui.store";
import { useEffect, useState } from "react";
import { preAuthHandshake } from "./services/apis/preHandshake";
import { AuthContainer } from "./features/auth/AuthContainer";
import { DashboardHeader } from "./shared/components/DashboardHeader";
import { AllWatchList } from "./features/dashboard/AllWatchList";

export default function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const activeTab = useUIStore((s) => s.activeTab);

  useEffect(() => {
  const initializeApp = async () => {
    try {
      await preAuthHandshake();
      const token = localStorage.getItem('bearer_token');
      if (token) setIsAuthenticated(true);
    } catch (error) {
      console.error("Critical Session Error. Force-cleaning browser state...");
      localStorage.clear(); 
      sessionStorage.clear();
      if (!window.location.search.includes('reset=true')) {
        window.location.href = window.location.pathname + '?reset=true';
      }
      setIsAuthenticated(false);
    } finally {
      setIsReady(true);
    }
  };
  initializeApp();
}, []);

  // Starts WebSocket connection — runs once on mount
  useWebSocket();
  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":  return <DashboardPage />;
      case "portfolio":  return <PortfolioPage />;
      case "orderbook":  return <OrderBookPage />;
      case "watchlist":  return <AllWatchList />;
      default:           return <DashboardPage />;
    }
  };

if (!isReady) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0a0e12] font-mono">
      {/* Animated Spinner */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00c076]/20 border-t-[#00c076]" />
      
      {/* Loading Text with glowing effect */}
      <div className="mt-6 flex flex-col items-center space-y-2">
        <span className="text-[11px] tracking-[0.2em] text-[#00c076] animate-pulse">
          [ INITIALIZING SECURE SESSION ]
        </span>
        <span className="text-[9px] text-gray-500 uppercase tracking-widest">
          Establishing Handshake...
        </span>
      </div>
    </div>
  );
}


    if (!isAuthenticated) {
    return <AuthContainer onLoginSuccess={() => setIsAuthenticated(true)} />;
  }



  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden",
      background: "var(--bg-void)",
    }}>
      <DashboardHeader />

      {/* Tab content */}
      <main style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {renderTab()}
      </main>

      {/* Footer */}
      <footer style={{
        padding: "4px 20px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-panel)",
        display: "flex", justifyContent: "space-between",
        fontSize: "9px", color: "var(--text-muted)",
        fontFamily: "var(--font-mono)", letterSpacing: "0.5px",
        flexShrink: 0,
      }} >
        <span>ws://localhost:8080</span>
        <span>OmneNest · Simulated data — for learning only</span>
      </footer>

      <NotificationStack />
    </div>
  );
}
