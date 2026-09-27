"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "How do I open an account?",
    a: "Click 'Open account' at the top of the page, fill in your email and a password, and confirm your address. The whole thing takes about two minutes.",
  },
  {
    q: "What deposit methods do you accept?",
    a: "USDT (TRC-20, ERC-20), USDC, BTC, and ETH. Bank transfers are available for plans of GH₵ 50,000 and above.",
  },
  {
    q: "When are yields paid?",
    a: "Yields are credited to your account balance every 24 hours from the time your deposit is confirmed. You can withdraw them on demand or compound them into the same plan.",
  },
  {
    q: "Can I withdraw before the plan ends?",
    a: "Accrued yield can be withdrawn at any time. Principal is returned at the end of the plan duration. Early principal exit is available on Foothill and Ridgeline plans for a small fee.",
  },
  {
    q: "How does the referral programme work?",
    a: "You get a unique invitation link. When someone you refer activates a plan, you earn a percentage of their deposit — paid the same day, across three tiers of depth.",
  },
  {
    q: "Is GoldGround Capital regulated?",
    a: "We operate under a Swiss financial services framework with custody provided by an attested third-party. Compliance documentation is available on request to verified members.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-pad bg-cream-50">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.22em] text-gold-600">Questions</span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink-900">
            The things people actually ask.
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q} className="card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-ink-900">{it.q}</span>
                  <span
                    className={`w-7 h-7 rounded-full bg-cream-100 flex items-center justify-center text-gold-600 transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <path d="M7 1 V13 M1 7 H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-ink-600 leading-relaxed">{it.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
