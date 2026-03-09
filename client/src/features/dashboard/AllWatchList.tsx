import { useEffect, useState } from "react";
import { getWatchList } from "@/services/apis/watchlist";
import { WatchListScriptTable } from "./WatchListScriptTable";

export const AllWatchList = () => {
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const[confirmID,setConfirmId]= useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initWatchlist = async () => {
      try {
        const data = await getWatchList();
        const allLists = [...data.userDefinedWatchlists, ...data.predefinedWatchlists];
        setWatchlists(allLists);
        setSelectedId(data.defaultWatchlistId);
      } catch (err) {
        console.error("Failed to load watchlists", err);
      } finally {
        setLoading(false);
      }
    };
    initWatchlist();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-(--text-muted) animate-pulse">
        [ SYNCING WATCHLISTS... ]
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-(--bg-void) p-6">
      {/* Centered Card Container */}
      <div className="flex w-full max-w-200 flex-col border border-(--border) bg-(--bg-panel) shadow-2xl rounded-lg overflow-hidden">
        
        {/* Header of the Box */}
        <div className="border-b border-(--border) bg-(--bg-elevated) px-5 py-4">
          <h2 className="font-display text-sm font-bold text-(--text-primary) tracking-tight">
            Select Watchlist
          </h2>
          <p className="font-mono text-[9px] text-(--text-muted) uppercase tracking-widest mt-1">
            {watchlists.length} available lists
          </p>
        </div>

        {/* List of Watchlists */}
        <div className="flex flex-col p-2 max-h-100 overflow-y-auto no-scrollbar">
          {watchlists.map((wl) => (
            <button
              key={wl.watchlistId}
              onClick={() => setSelectedId(wl.watchlistId)}
              className={`flex items-center justify-between px-4 py-3 m-1 rounded font-mono text-[11px] transition-all cursor-pointer group ${
                selectedId === wl.watchlistId
                  ? "bg-[#007dd0]/10 text-[#007dd0] border border-[#007dd0]/30"
                  : "text-(--text-muted) hover:bg-(--bg-elevated) hover:text-(--text-primary) border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`h-1.5 w-1.5 rounded-full ${selectedId === wl.watchlistId ? "bg-[#007dd0] animate-pulse" : "bg-gray-600"}`} />
                {wl.watchlistName.toUpperCase()}
              </div>
              
              <span className="text-[9px] opacity-50 font-light group-hover:opacity-100">
                ID: {wl.watchlistId}
              </span>
            </button>
          ))}
        </div>

        {/* Footer Action */}
        <div className="border-t border-(--border) p-4 bg-(--bg-panel)">
          <button 
            className="w-full bg-[#007dd0] hover:bg-[#006bb3] text-white font-mono text-[10px] py-2.5 rounded font-bold transition-colors cursor-pointer uppercase tracking-widest"
            onClick={() => setConfirmId(selectedId)}
          >
            Load Selected List
          </button>
        </div>
        
        {confirmID && <WatchListScriptTable watchlistId={confirmID} />}
        {!confirmID && <h3>No List Selected</h3>}
      </div>
    </div>
  );
};
