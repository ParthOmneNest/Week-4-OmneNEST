import { getWatchlistScripts } from "@/services/apis/watchlist";
import { useEffect, useState } from "react";

export const WatchListScriptTable = ({ watchlistId }: { watchlistId: number }) => {

    const [scripts, setScripts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadScripts = async () => {
            setLoading(true);

            try {
                const data = await getWatchlistScripts(watchlistId);

                // console.log("API Data", data);
                setScripts(data.scrips || []);
            } catch (err) {
                console.error("Failed to load watchlists scripts", err);
            } finally {
                setLoading(false);
            }
        }

        if (watchlistId) loadScripts();
    }, [watchlistId]);
    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-(--text-muted) animate-pulse">
                [ LOADING SCRIPTS... ]
            </div>
        );
    }
    return (
        <div className="w-full overflow-hidden rounded-lg border border-(--border) bg-(--bg-panel) mt-4">
            <table className="w-full text-left border-collapse font-mono text-[11px]">
                <thead>
                    <tr className="bg-(--bg-elevated) text-(--text-muted) uppercase tracking-tighter border-b border-(--border)">
                        <th className="px-4 py-3 font-bold">Company</th>
                        <th className="px-4 py-3 text-right">Open</th>
                        <th className="px-4 py-3 text-right">Prev Close</th>
                        <th className="px-4 py-3 text-right">Volume</th>
                        <th className="px-4 py-3 text-right">Lot</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                    {scripts.length > 0 ?
                        (scripts.map((s) => (
                            <tr key={s.scripToken} className="hover:bg-(--bg-elevated)/50 transition-colors">
                                <td className="px-4 py-3 text-(--text-primary) font-semibold">
                                    {s.companyName}
                                    <div className="text-[9px] text-(--text-muted)">{s.exchange}</div>
                                </td>
                                <td className="px-4 py-3 text-right">₹{s.openPrice?.toFixed(2) || "0.00"}</td>
                                <td className="px-4 py-3 text-right text-(--text-muted)">₹{s.previousClosePrice?.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right">{s.volumeTradedToday?.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-bold text-blue-500">{s.lotSize}</td>
                            </tr>
                        ))) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center font-mono text-[10px]  uppercase tracking-widest">
                                    No scripts present in this watchlist
                                </td>
                            </tr>
                        )}
                </tbody>
            </table>
        </div>
    )
}