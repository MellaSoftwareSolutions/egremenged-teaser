"use client";

import React from "react";
import { ExternalLink, Sparkles, CheckCircle2, ArrowRight, DollarSign, Share2 } from "lucide-react";

export function AdVouchSection() {
  const steps = [
    {
      step: 1,
      title: "Go to AdVouch",
      desc: "Sign up or log in to your account.",
      actionLabel: "Open AdVouch",
      actionUrl: "https://advouch.com",
    },
    {
      step: 2,
      title: "Switch to Promoter mode",
      desc: "Use the mode button at the top right corner of the dashboard.",
    },
    {
      step: 3,
      title: "Find Egre Menged campaign",
      desc: "Open 'Browse Campaigns' in the sidebar and select Egre Menged.",
    },
    {
      step: 4,
      title: "Apply to the campaign",
      desc: "Send your promoter application in one click.",
    },
    {
      step: 5,
      title: "Finish the task & submit proof",
      desc: "Repost our teaser on TikTok, then submit your proof of completion.",
    },
  ];

  return (
    <section id="advouch" className="py-12 sm:py-16 scroll-mt-16 bg-[#FAF7F2]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Main Card Container */}
        <div className="relative rounded-3xl bg-white border border-[#EFECE6] p-6 sm:p-10 shadow-[0_4px_24px_rgba(15,23,42,0.04)] overflow-hidden">
          {/* Subtle decorative background glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#ECFDF5] rounded-full blur-3xl pointer-events-none opacity-80" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#EFF6FF] rounded-full blur-3xl pointer-events-none opacity-70" />

          {/* Header Row */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10 pb-6 border-b border-[#EFECE6]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#86EFAC] text-[#16A34A] text-xs font-bold mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AdVouch Promoter Campaign</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Earn 135 ETB with Egre Menged
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] mt-1 max-w-xl">
                Get rewarded just by reposting one TikTok. Follow the steps on AdVouch and withdraw straight to your earnings.
              </p>
            </div>

            {/* Reward badges */}
            <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-sm font-bold shadow-2xs">
                <DollarSign className="w-4 h-4" />
                135 ETB Reward
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ECFDF5] border border-[#86EFAC] text-[#16A34A] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                Campaign Open
              </span>
            </div>
          </div>

          {/* Step List Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
            {steps.map((item) => (
              <div
                key={item.step}
                className="group relative bg-[#FAF7F2] hover:bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E1D8] hover:border-[#86EFAC] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-lg bg-white border border-[#E5E1D8] text-[#0F172A] text-xs font-black flex items-center justify-center shadow-xs">
                      {item.step}
                    </span>
                    {item.step === 5 && (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A] mb-1 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {item.actionUrl && (
                  <div className="mt-4 pt-3 border-t border-[#EFECE6]">
                    <a
                      href={item.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#16A34A] hover:text-[#15803D] transition-colors"
                    >
                      <span>{item.actionLabel}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Card: Payout Callout & Actions */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] text-[#7C3AED] flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-[#64748B] tracking-wider">
                  Next Step: Get Paid
                </p>
                <p className="text-sm font-semibold text-[#0F172A]">
                  Withdraw your 135 ETB anytime from Earnings &amp; Payouts on AdVouch.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <a
                href="/advouch.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] text-xs sm:text-sm font-bold hover:bg-[#F1F5F9] transition-all shadow-xs"
              >
                <span>Interactive Guide</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://advouch.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#16A34A] text-white text-xs sm:text-sm font-bold hover:bg-[#15803D] transition-all shadow-xs hover:shadow-sm"
              >
                <span>Go to Campaign</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
