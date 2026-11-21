"use client";

import React from "react";
import { Check, Lock, Zap, Send, Mail } from "lucide-react";

export function Footer() {
  const trustPills = [
    {
      icon: Check,
      text: "Verified couriers",
    },
    {
      icon: Lock,
      text: "Payment protected",
    },
    {
      icon: Zap,
      text: "Telebirr & CBE payouts",
    },
  ];

  return (
    <footer className="pt-8 pb-14 border-t border-[#EFECE6] bg-[#FAF7F2]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Simple Trust Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-10">
          {trustPills.map((pill, idx) => {
            const Icon = pill.icon;
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#ECFDF5] border border-[#86EFAC] text-[#16A34A] text-xs sm:text-sm font-semibold shadow-2xs"
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{pill.text}</span>
              </div>
            );
          })}
        </div>

        {/* Minimal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EFECE6] text-xs text-[#64748B]">
          {/* Brand & Location */}
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-[#16A34A]">egremenged</span>
            <span>·</span>
            <span>Addis Ababa, Ethiopia</span>
            <span>·</span>
            <span>© 2026</span>
          </div>

          {/* Social & Contact Links */}
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a
              href="#advouch"
              className="flex items-center gap-1.5 hover:text-[#16A34A] transition-colors font-semibold text-[#16A34A]"
            >
              <span>Earn 135 ETB</span>
            </a>
            <a
              href="https://t.me/egremenged"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#0F172A] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>
            <a
              href="https://instagram.com/egremenged"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#0F172A] transition-colors"
            >
              <svg
                className="w-3.5 h-3.5 stroke-[2]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span>Instagram</span>
            </a>
            <a
              href="mailto:hello@egremenged.com"
              className="flex items-center gap-1.5 hover:text-[#0F172A] transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
