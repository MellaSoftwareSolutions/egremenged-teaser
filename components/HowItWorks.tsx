"use client";

import React from "react";
import { Footprints, QrCode, Wallet } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Walk or commute as usual",
      description:
        "Turn on your route when heading to class, dorms, or across town.",
      icon: Footprints,
      badgeBg: "bg-[#ECFDF5]",
      badgeBorder: "border-[#86EFAC]",
      badgeText: "text-[#16A34A]",
      highlight: "Everyday routes",
    },
    {
      step: "02",
      title: "Verify with a quick scan or PIN",
      description:
        "Simple handoff at pickup and drop-off keeps every package safe.",
      icon: QrCode,
      badgeBg: "bg-[#FFF1F1]",
      badgeBorder: "border-[#FECDD3]",
      badgeText: "text-[#FF6B6B]",
      highlight: "Simple & safe",
    },
    {
      step: "03",
      title: "Get paid on delivery",
      description:
        "Payment is protected until drop-off and ready to cash out via Telebirr or CBE.",
      icon: Wallet,
      badgeBg: "bg-[#ECFDF5]",
      badgeBorder: "border-[#86EFAC]",
      badgeText: "text-[#16A34A]",
      highlight: "Telebirr & CBE",
    },
  ];

  return (
    <section id="how-it-works" className="pt-2 pb-14 sm:pt-4 sm:pb-20 scroll-mt-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
            How Egre Menged Works
          </h2>
          <p className="text-sm sm:text-base text-[#64748B]">
            Moving packages seamlessly without extra trips or traffic delays.
          </p>
        </div>

        {/* 3-Column Clean Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFECE6] shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl ${item.badgeBg} border ${item.badgeBorder} ${item.badgeText} flex items-center justify-center shadow-2xs`}
                    >
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-[#FAF7F2] text-[#64748B] border border-[#E5E1D8]">
                      Step {item.step}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A] mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EFECE6] flex items-center gap-1.5 text-[11px] font-semibold text-[#16A34A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  <span>{item.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
