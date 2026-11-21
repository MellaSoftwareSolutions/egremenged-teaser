"use client";

import React from "react";
import Image from "next/image";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EFECE6] transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Wordmark */}
        <a
          href="#"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] rounded-lg p-1 -ml-1"
          aria-label="Egre Menged Home"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.webp"
              alt="Egre Menged Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-[#16A34A]">
                egremenged
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E5E1D8] text-[#64748B] hidden sm:inline-block">
                እግረ መንገድ
              </span>
            </div>
          </div>
        </a>

        {/* Right: Navigation Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="#how-it-works"
            className="text-xs sm:text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            How it works
          </a>
          <a
            href="#advouch"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#86EFAC] text-[#16A34A] text-xs font-bold hover:bg-[#DCFCE7] transition-all shadow-2xs"
          >
            <span>Earn 135 ETB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
          </a>
        </div>
      </div>
    </header>
  );
}
