"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { AdVouchSection } from "@/components/AdVouchSection";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  const [waitlistTab, setWaitlistTab] = useState<"join" | "check">("join");

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] selection:bg-[#ECFDF5] selection:text-[#16A34A] flex flex-col justify-between">
      {/* Section 1: Minimal Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Section 2: 2-Column Hero + Interactive Waitlist Form & Mobile App Preview */}
        <HeroSection
          activeTab={waitlistTab}
          onTabChange={(tab) => setWaitlistTab(tab)}
        />

        {/* Section 3: How It Works (3 Clean Steps with Visual Badges) */}
        <HowItWorks />

        {/* Section 4: AdVouch 135 ETB Promoter Campaign */}
        <AdVouchSection />
      </main>

      {/* Section 5: Simple Trust Strip & Footer */}
      <Footer />
    </div>
  );
}
