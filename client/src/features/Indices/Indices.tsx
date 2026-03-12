import { getIndices } from "@/services/apis/indices";
import { useEffect, useState } from "react";

export const Indices=()=>{
    const [exchange, setExchange] = useState<string>("NSE");
    const [indices, setIndices] = useState<any[]>([]); // Using any[] to match your style
    const [loading, setLoading] = useState(true);

useEffect(() => {
    const loadIndices = async () => {
        setLoading(true);
        try {
            const data = await getIndices(exchange);
            // Based on your JSON, data contains "IndexDetails" array
            setIndices(data); 
        } catch (err) {
            console.error("Failed to load indices", err);
            setIndices([]);
        } finally {
            setLoading(false);
        }
    };
    loadIndices();
}, [exchange]);
 return (
        <div className="flex flex-col h-full w-full">
            {/* 2. Simple Tab Switcher to change the 'exchange' variable */}
            <div className="flex gap-2 border-b border-(--border) pb-2 mb-4">
                {["NSE", "BSE", "MCX"].map((ex) => (
                    <button
                        key={ex}
                        onClick={() => setExchange(ex)}
                        className={`text-[10px] font-mono tracking-widest px-3 py-1 rounded transition-colors ${
                            exchange === ex 
                            ? "bg-[#00c076] text-black font-bold" 
                            : "text-(--text-muted) hover:text-(--text-primary)"
                        }`}
                    >
                        {ex}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex h-40 items-center justify-center font-mono text-[10px] text-(--text-muted) animate-pulse">
                    [ FETCHING {exchange} INDICES... ]
                </div>
            ) : (
                <div className="w-full overflow-hidden rounded border border-(--border) bg-(--bg-panel)">
                    <table className="w-full text-left border-collapse font-mono text-[11px]">
                        <thead>
                            <tr className="bg-(--bg-elevated) text-(--text-muted) uppercase border-b border-(--border)">
                                <th className="px-4 py-2">Index Name</th>
                                <th className="px-4 py-2">Token</th>
                                <th className="px-4 py-2 text-right">Precision</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--border)">
                            {indices.length > 0 ? (
                                indices.map((idx, i) => (
                                    <tr key={idx.indexToken + i} className="hover:bg-(--bg-elevated)/50 transition-colors">
                                        <td className="px-4 py-3 text-(--text-primary) font-semibold uppercase">
                                            {idx.indexName}
                                        </td>
                                        <td className="px-4 py-3 text-(--text-muted)">{idx.indexToken}</td>
                                        <td className="px-4 py-3 text-right text-[#3b82f6]">{idx.decimalPrecision}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-10 text-center text-(--text-muted)">
                                        No indices found for {exchange}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}