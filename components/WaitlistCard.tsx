"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  Loader2,
  ArrowRight,
  Search,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { WaitlistRole } from "@/types";
import {
  maskIdentifier,
  normalizeIdentifier,
  isValidIdentifier,
  INVALID_IDENTIFIER_MESSAGE,
} from "@/lib/identifier";

interface WaitlistCardProps {
  activeTab?: "join" | "check";
  onTabChange?: (tab: "join" | "check") => void;
}

export function WaitlistCard({ activeTab: externalTab, onTabChange }: WaitlistCardProps) {
  const [internalTab, setInternalTab] = useState<"join" | "check">("join");

  // Controlled or uncontrolled current tab
  const currentTab = externalTab !== undefined ? externalTab : internalTab;

  const setTab = useCallback(
    (tab: "join" | "check") => {
      if (externalTab === undefined) {
        setInternalTab(tab);
      }
      onTabChange?.(tab);
    },
    [externalTab, onTabChange]
  );

  // Form State: Join Waitlist
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState<WaitlistRole>("earn");
  const [area, setArea] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccessData, setJoinSuccessData] = useState<{
    position: number;
    name: string;
    role: WaitlistRole;
    alreadyRegistered?: boolean;
    maskedIdentifier: string;
  } | null>(null);

  // Form State: Check Status
  const [checkIdentifier, setCheckIdentifier] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<{
    found: boolean;
    position?: number;
    name?: string;
    role?: WaitlistRole;
    maskedIdentifier?: string;
    area?: string;
  } | null>(null);

  // Copy Link State
  const [copied, setCopied] = useState(false);

  // Listen to hash changes (e.g. #check-status)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#check-status") {
        setTab("check");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [setTab]);

  // Handle Join Submit
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    const trimmedName = name.trim();
    const trimmedId = identifier.trim();

    if (!trimmedName) {
      setJoinError("Please enter your full name.");
      return;
    }
    if (!trimmedId) {
      setJoinError("Please enter your phone number or email.");
      return;
    }

    const normalized = normalizeIdentifier(trimmedId);
    if (!isValidIdentifier(normalized)) {
      setJoinError(INVALID_IDENTIFIER_MESSAGE);
      return;
    }

    setIsJoining(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          identifier: trimmedId,
          role,
          area: area.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok && !data.alreadyRegistered) {
        setJoinError(
          data.error || "We're having trouble saving your request right now. Please try again in a moment."
        );
        setIsJoining(false);
        return;
      }

      setJoinSuccessData({
        position: data.spot || data.position || 1,
        name: data.name || trimmedName,
        role: data.role || role,
        alreadyRegistered: data.alreadyRegistered,
        maskedIdentifier: maskIdentifier(data.identifier || trimmedId),
      });
    } catch {
      setJoinError("Network error. Please check your connection and try again.");
    } finally {
      setIsJoining(false);
    }
  };

  // Handle Check Status Submit
  const handleCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckError(null);
    setStatusResult(null);

    const trimmedId = checkIdentifier.trim();
    if (!trimmedId) {
      setCheckError("Please enter your phone number or email.");
      return;
    }

    const normalized = normalizeIdentifier(trimmedId);
    if (!isValidIdentifier(normalized)) {
      setCheckError(INVALID_IDENTIFIER_MESSAGE);
      return;
    }

    setIsChecking(true);

    try {
      const res = await fetch(
        `/api/waitlist?identifier=${encodeURIComponent(trimmedId)}`
      );
      const data = await res.json();

      // Handle 404 Not Found cleanly
      if (res.status === 404 || data.found === false) {
        setStatusResult({
          found: false,
        });
        setIsChecking(false);
        return;
      }

      // Handle other validation (400) or server (500/503) errors
      if (!res.ok) {
        setCheckError(
          data.error || "Unable to check your status right now. Please try again shortly."
        );
        setIsChecking(false);
        return;
      }

      if (data.found) {
        setStatusResult({
          found: true,
          position: data.spot || data.position,
          name: data.name,
          role: data.role,
          maskedIdentifier: maskIdentifier(data.identifier || trimmedId),
          area: data.area,
        });
      } else {
        setStatusResult({
          found: false,
        });
      }
    } catch {
      setCheckError("Network error. Please check your connection and try again.");
    } finally {
      setIsChecking(false);
    }
  };

  // Switch to Join Tab with prefilled identifier from Check Status
  const handleSwitchToJoinWithPrefill = () => {
    setIdentifier(checkIdentifier);
    setTab("join");
    setStatusResult(null);
    setCheckError(null);
  };

  // Copy invite link handler
  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.origin : "https://egremenged.com";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Reset join form for another submission
  const handleResetJoin = () => {
    setJoinSuccessData(null);
    setName("");
    setIdentifier("");
    setArea("");
    setRole("earn");
    setJoinError(null);
  };

  const getRoleLabel = (r: WaitlistRole) => {
    switch (r) {
      case "earn":
        return "Earn on my route";
      case "send":
        return "Send packages";
      case "both":
        return "Earn & Send";
      default:
        return "Commuter";
    }
  };

  return (
    <div
      id="waitlist-card"
      className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.06)] border border-[#EFECE6] text-left transition-all"
    >
      {/* 2-Tab Segmented Toggle - Starts directly at the top of the card */}
      <div className="flex p-1 bg-[#FAF7F2] rounded-2xl border border-[#EFECE6] mb-5">
        <button
          type="button"
          onClick={() => setTab("join")}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 text-center cursor-pointer ${
            currentTab === "join"
              ? "bg-white text-[#0F172A] shadow-xs border border-[#EFECE6]"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          Join Waitlist
        </button>
        <button
          type="button"
          onClick={() => setTab("check")}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 text-center cursor-pointer ${
            currentTab === "check"
              ? "bg-white text-[#16A34A] shadow-xs border border-[#EFECE6]"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          Check Status
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ================================================================= */}
        {/* TAB 1: JOIN WAITLIST                                              */}
        {/* ================================================================= */}
        {currentTab === "join" && (
          <motion.div
            key="join-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            {joinSuccessData ? (
              /* Success / Confirmation State (Deep Slate Navy #1E293B Card) */
              <div className="bg-[#1E293B] text-white rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-md">
                <div className="mb-2 text-slate-300 text-xs sm:text-sm">
                  {joinSuccessData.alreadyRegistered
                    ? `Welcome back, ${joinSuccessData.name}!`
                    : `You're all set, ${joinSuccessData.name}!`}
                </div>

                {/* Queue Spot Display */}
                <div className="mb-4">
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                    #{joinSuccessData.position}{" "}
                    <span className="text-base sm:text-lg font-semibold text-emerald-400 font-sans">
                      on the list
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-5 text-xs text-slate-300 flex items-center justify-between">
                  <span className="text-slate-400">Role:</span>
                  <span className="font-semibold text-emerald-300">
                    {getRoleLabel(joinSuccessData.role)}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  We are rolling out invite batches across campus routes and major Addis Ababa
                  corridors. We’ll notify you when your route opens.
                </p>

                {/* Copy Invite Link */}
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-white text-[#0F172A] hover:bg-slate-100 active:scale-[0.99] transition-all shadow-xs cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-[#16A34A]" />
                        <span>Link copied to clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[#64748B]" />
                        <span>Copy invite link to share</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetJoin}
                    className="w-full py-2 text-center text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Sign up another contact
                  </button>
                </div>
              </div>
            ) : (
              /* Join Waitlist Form - Compact fields for above-the-fold visibility */
              <form onSubmit={handleJoinSubmit} className="space-y-3.5">
                {/* Full Name & Phone Number / Email side-by-side on sm screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Abebe Kebede"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1D8] bg-white text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/40 focus:border-[#FF6B6B] transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="identifier"
                      className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                    >
                      Phone Number or Email
                    </label>
                    <input
                      id="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="0911... or name@email.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1D8] bg-white text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/40 focus:border-[#FF6B6B] transition-all"
                    />
                  </div>
                </div>

                {/* Role Selector 3-Option Segmented Buttons */}
                <div>
                  <span className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    How will you use Egre Menged?
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF7F2] rounded-xl border border-[#E5E1D8]">
                    <button
                      type="button"
                      onClick={() => setRole("earn")}
                      className={`py-2 px-1 text-center text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        role === "earn"
                          ? "bg-white text-[#16A34A] font-semibold shadow-xs border border-[#86EFAC]"
                          : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      Earn on my route
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("send")}
                      className={`py-2 px-1 text-center text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        role === "send"
                          ? "bg-white text-[#16A34A] font-semibold shadow-xs border border-[#86EFAC]"
                          : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      Send packages
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("both")}
                      className={`py-2 px-1 text-center text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        role === "both"
                          ? "bg-white text-[#16A34A] font-semibold shadow-xs border border-[#86EFAC]"
                          : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      Both
                    </button>
                  </div>
                </div>

                {/* Optional Area / Campus Dropdown */}
                <div>
                  <label
                    htmlFor="areaCampus"
                    className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                  >
                    Your Area or Campus{" "}
                    <span className="text-[#94A3B8] font-normal">(Optional)</span>
                  </label>
                  <select
                    id="areaCampus"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1D8] bg-white text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/40 focus:border-[#FF6B6B] transition-all cursor-pointer"
                  >
                    <option value="">Select your typical route area...</option>
                    <option value="AASTU (Kilinto / Akaki)">AASTU Campus (Kilinto / Akaki)</option>
                    <option value="AAU 4 Kilo / 6 Kilo">AAU (4 Kilo / 6 Kilo / Sidist Kilo)</option>
                    <option value="AAU FBE / Commerce">AAU (FBE / Commerce)</option>
                    <option value="Bole / Medhanialem / Atlas">Bole (Medhanialem / Atlas / Rwanda)</option>
                    <option value="Ayat / CMC / Summit">Ayat / CMC / Summit</option>
                    <option value="Megenagna / Signal">Megenagna / Signal / Lem Hotel</option>
                    <option value="Piassa / Arat Kilo / Mexico">Piassa / Arat Kilo / Mexico</option>
                    <option value="Sarbet / Tor Hailoch">Sarbet / Tor Hailoch / Bisrate Gabriel</option>
                    <option value="Kality / Stadium Line">Kality / Stadium Line</option>
                    <option value="Other Area in Addis">Other Area in Addis Ababa</option>
                  </select>
                </div>

                {/* Error Banner */}
                {joinError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 overflow-hidden break-words"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="break-words min-w-0">{joinError}</span>
                  </div>
                )}

                {/* Solid Coral Red CTA Button (#FF6B6B) with Bold Pure White Text */}
                <button
                  type="submit"
                  disabled={isJoining}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#FF6B6B] hover:bg-[#F25A5A] active:scale-[0.99] disabled:opacity-85 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(255,107,107,0.25)] cursor-pointer"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Reserving your spot...</span>
                    </>
                  ) : (
                    <>
                      <span>Join the Waitlist</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>

                <div className="pt-1 text-center">
                  <span className="text-[11px] text-[#64748B]">
                    Free to join · No spam · Instant notifications
                  </span>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: CHECK STATUS                                               */}
        {/* ================================================================= */}
        {currentTab === "check" && (
          <motion.div
            key="check-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            {statusResult ? (
              statusResult.found ? (
                /* Found Result Card (Deep Slate Navy #1E293B) */
                <div className="bg-[#1E293B] text-white rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-md">
                  <div className="text-slate-300 text-xs sm:text-sm mb-1">
                    You’re on the list, {statusResult.name}!
                  </div>

                  <div className="mb-4">
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                      #{statusResult.position}{" "}
                      <span className="text-base sm:text-lg font-semibold text-emerald-400 font-sans">
                        in queue
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-5 text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Role:</span>
                      <span className="font-semibold text-emerald-300">
                        {getRoleLabel(statusResult.role || "earn")}
                      </span>
                    </div>
                    {statusResult.area && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Route area:</span>
                        <span className="font-medium text-slate-200">
                          {statusResult.area}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Verified Contact:</span>
                      <span className="font-mono text-slate-300">
                        {statusResult.maskedIdentifier}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStatusResult(null)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Check another number or email</span>
                  </button>
                </div>
              ) : (
                /* Not Found Result Card (404) with 1-click option to join with info prefilled */
                <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E5E1D8] text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0F172A] mb-1">
                    Not on the list yet
                  </h4>
                  <p className="text-xs text-[#64748B] mb-5 leading-relaxed">
                    We couldn’t find an entry matching{" "}
                    <span className="font-medium text-[#0F172A] font-mono">
                      {checkIdentifier}
                    </span>
                    . Grab your early access spot now!
                  </p>
                  <button
                    type="button"
                    onClick={handleSwitchToJoinWithPrefill}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#FF6B6B] hover:bg-[#F25A5A] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>Join Waitlist with this info</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusResult(null)}
                    className="mt-3 text-xs text-[#64748B] hover:text-[#0F172A] underline underline-offset-2 cursor-pointer"
                  >
                    Try searching a different phone or email
                  </button>
                </div>
              )
            ) : (
              /* Check Status Input Form */
              <form onSubmit={handleCheckSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="checkIdInput"
                    className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                  >
                    Enter your phone number or email
                  </label>
                  <input
                    id="checkIdInput"
                    type="text"
                    required
                    value={checkIdentifier}
                    onChange={(e) => setCheckIdentifier(e.target.value)}
                    placeholder="e.g. 0911... or name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1D8] bg-white text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/40 focus:border-[#16A34A] transition-all"
                  />
                  <p className="mt-1 text-[11px] text-[#64748B]">
                    Check your spot in line and view early access status.
                  </p>
                </div>

                {checkError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 overflow-hidden break-words"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="break-words min-w-0">{checkError}</span>
                  </div>
                )}

                {/* Solid Emerald Green CTA Button (#16A34A) with Bold Pure White Text */}
                <button
                  type="submit"
                  disabled={isChecking}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.99] disabled:opacity-85 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(22,163,74,0.25)] cursor-pointer"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Checking queue...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 stroke-[2.5]" />
                      <span>Check My Spot</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
