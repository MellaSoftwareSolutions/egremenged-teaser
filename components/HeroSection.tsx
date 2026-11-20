"use client";

import React from "react";
import { WaitlistCard } from "@/components/WaitlistCard";

interface HeroSectionProps {
  activeTab?: "join" | "check";
  onTabChange?: (tab: "join" | "check") => void;
}

export function HeroSection({ activeTab = "join", onTabChange }: HeroSectionProps) {
  return (
    <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Centered Headline & Subheadline */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.18] mb-3 sm:mb-4">
            Turn your daily walk into extra income.
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl mx-auto">
            Deliver small packages along the routes you already take — or send items across
            campus and Addis Ababa in minutes.
          </p>
        </div>

        {/* Centered Waitlist Card */}
        <div className="max-w-xl mx-auto">
          <WaitlistCard activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      </div>
    </section>
  );
}
