import { login } from "@/services/apis/login";
import { preAuthHandshake } from "@/services/apis/prehandshake";
import { useState } from "react";

interface AuthProps {
    username: string;
    setUsername: (value: string) => void;
    onNext: () => void;
}

export const LoginForm = ({ username, setUsername, onNext }: AuthProps) => {
    const [password, setPassword] = useState('Abc@12345');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            await preAuthHandshake();
            await login(username, password);
            onNext();
        } catch (err: any) {
            console.error("Full Login Error:", err.response?.data || err.message);
            alert(`Login failed: ${err.response?.data?.message || "Check Console"}`);
        } finally {
            setLoading(false);
        }
    };

   return (
        <div className="flex min-h-screen items-center justify-center bg-[#000000] px-4 font-sans">
            {/* Main Card Container */}
            <div className="w-full max-w-110 rounded-3xl bg-[#121212] p-10 shadow-2xl border border-white/5">
                
                {/* Groww-style Logo/Icon area */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00d09c]/10 mb-4">
                        <div className="h-8 w-8 rounded-full bg-[#007dd0]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Login to OmneNest</h2>
                    <p className="mt-2 text-sm text-gray-400">Securely access your trading account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                        {/* User ID Field */}
                        <div className="relative group">
                            <label className="mb-2 block text-xs font-medium text-gray-400 group-focus-within:text-[#00d09c] transition-colors">
                                User ID
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-xl border border-[#2c2c2c] bg-[#1a1a1a] p-4 text-base text-white placeholder-gray-600 outline-none transition-all focus:border-[#00d09c] focus:bg-[#1a1a1a] hover:border-gray-600"
                                placeholder="Enter your ID"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="relative group">
                            <label className="mb-2 block text-xs font-medium text-gray-400 group-focus-within:text-[#00d09c] transition-colors">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full rounded-xl border border-[#2c2c2c] bg-[#1a1a1a] p-4 text-base text-white placeholder-gray-600 outline-none transition-all focus:border-[#00d09c] focus:bg-[#1a1a1a] hover:border-gray-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="relative mt-8 flex w-full items-center justify-center rounded-xl bg-[#00d09c] py-4 text-base font-bold text-black transition-all hover:scale-[1.01] hover:bg-[#00e2aa] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            "CONTINUE"
                        )}
                    </button>
                </form>

                {/* Footer Security Note */}
                <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-medium text-gray-500 uppercase tracking-widest">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    256-Bit SSL Encryption
                </div>
            </div>
        </div>
    );
};
