import { useEffect, useState } from "react";
import { useUIStore } from "@/store/ui.store";
import { preAuthHandshake } from "@/services/apis/prehandshake";

// Hooks & Services
import { useWebSocket } from "@/shared/hooks/useWebSocket";
import { useLiveMarketWs } from "@/shared/hooks/useLiveMarketWs"; // ★ NEW
import { wsManager } from "@/services/websocket"; // ★ NEW

// Components
import { Header } from "@/shared/components/Header";
import { NotificationStack } from "@/shared/components/NotificationStack";
import { DashboardPage } from "@/pages/DashboardPage";
import { PortfolioPage } from "@/features/portfolio-overview/PortfolioPage";
import { OrderBookPage } from "@/features/order-book/OrderBookPage";
import { AllWatchList } from "./features/dashboard/AllWatchList";
import { AuthContainer } from "./features/auth/AuthContainer";
import { DashboardHeader } from "./shared/components/DashboardHeader";
import { WsStatusBadge } from "@/shared/components/WsStatusBadge"; 
import { Indices } from "./features/Indices/Indices";

// Helper to extract clientCode for the Live WS
function getClientCodeFromToken(token: string | null): string {
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (payload.clientCode ?? payload.sub ?? "") as string;
  } catch {
    return localStorage.getItem("client_code") ?? "";
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [clientCode, setClientCode] = useState(""); 
  
  const activeTab = useUIStore((s) => s.activeTab);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await preAuthHandshake();
        const token = localStorage.getItem('bearer_token');
        if (token) {
          setIsAuthenticated(true);
          setClientCode(getClientCodeFromToken(token)); // ★ Extract code on mount
        }
      } catch (error) {
        console.error("Critical Session Error...");
        localStorage.clear(); 
        sessionStorage.clear();
        setIsAuthenticated(false);
      } finally {
        setIsReady(true);
      }
    };
    initializeApp();
  }, []);

  // useWebSocket();

  useLiveMarketWs({
    clientCode,
    extraSubscriptions: [
      { exchange: "NSE_CM", tokens: ["11377"] }, // HDFC Bank example
    ],
  });

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":  return <DashboardPage />;
      case "portfolio":  return <PortfolioPage />;
      case "orderbook":  return <OrderBookPage />;
      case "watchlist":  return <AllWatchList />;
      case "indices": return <Indices/>
      default:           return <DashboardPage />;
    }
  };

  if (!isReady) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0a0e12] font-mono">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00c076]/20 border-t-[#00c076]" />
        <div className="mt-6 flex flex-col items-center space-y-2">
          <span className="text-[11px] tracking-[0.2em] text-[#00c076] animate-pulse">[ INITIALIZING SECURE SESSION ]</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthContainer onLoginSuccess={() => {
      const token = localStorage.getItem('bearer_token');
      setClientCode(getClientCodeFromToken(token)); 
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden",
      background: "var(--bg-void)",
    }}>
      <DashboardHeader />
      <Header/>
      
      <main style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {renderTab()}
      </main>

      <footer style={{
        padding: "4px 20px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-panel)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "9px", color: "var(--text-muted)",
        fontFamily: "var(--font-mono)", letterSpacing: "0.5px",
        flexShrink: 0,
      }}>
        {/* Left: simulated server info */}
        <span>ws://localhost:8080 · Simulated</span>

        {/* Right: ★ NEW Live WebSocket status */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>wss://preprodapisix.omnenest.com · Live</span>
          <WsStatusBadge
            showRetry
            onRetry={() => wsManager.connect(clientCode)}
          />
        </div>
      </footer>

      <NotificationStack />
    </div>
  );
}
