import React, { useState } from "react";
import { validateOtp } from "@/services/apis/otp";

interface OtpProps {
  username: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const OtpForm = ({ username, onSuccess, onBack }:OtpProps) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await validateOtp(username, otp);
      const token = response?.jwtTokens?.accessToken;
      if (token) {
        localStorage.setItem('bearer_token', token);
        onSuccess(); // App.tsx will now show the Market UI
      } else {
        alert("OTP Verified but no token received. Check API response structure.");
      }
    } catch (err) {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="flex min-h-screen items-center justify-center bg-[#000000] px-4 font-sans text-white">
      <div className="w-full max-w-[440px] rounded-[24px] bg-[#121212] p-10 shadow-2xl border border-white/5">
        
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00d09c]/10 mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d09c;" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Verify Identity</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter the 4-digit code sent to <span className="text-[#00d09c] font-medium">{username}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Input Field */}
          <div className="flex justify-center">
            <input
              type="text"
              required
              maxLength={4}
              autoFocus
              className="w-full max-w-[200px] text-center text-3xl font-bold tracking-[0.5em] rounded-xl border border-[#2c2c2c] bg-[#1a1a1a] p-4 text-[#00d09c] placeholder-gray-700 outline-none transition-all focus:border-[#00d09c] hover:border-gray-600"
              placeholder="0000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Only allows numbers
            />
          </div>

          <div className="space-y-3 pt-4">
            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="flex w-full items-center justify-center rounded-xl bg-[#00d09c] py-4 text-base font-bold text-black transition-all hover:scale-[1.01] hover:bg-[#00e2aa] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "VERIFY & LOGIN"
              )}
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={onBack}
              className="w-full py-2 text-sm font-medium text-gray-500 transition-colors hover:text-white"
            >
              Change Username
            </button>
          </div>
        </form>

        {/* Security Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-medium text-gray-600 uppercase tracking-widest">
          <div className="h-1.5 w-1.5 rounded-full bg-[#00d09c] animate-pulse" />
          Waiting for verification...
        </div>
      </div>
    </div>
  );
};
