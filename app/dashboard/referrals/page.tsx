"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ReferralsPage() {
  const [code, setCode] = useState("GG-USR-9341");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      if (!email) return;
      const slug = email.split("@")[0].toUpperCase().slice(0, 6);
      setCode(`GG-${slug}-${Math.floor(1000 + Math.random() * 8999)}`);
    });
  }, []);

  const link = typeof window !== "undefined"
    ? `${window.location.origin}/register?invitation_code=${code}`
    : `/register?invitation_code=${code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl tracking-tight text-ink-900">Referrals</h1>
        <p className="text-ink-600 text-xs mt-0.5">Earn up to 10% on partner deposits across three tiers.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total partners" },
          { label: "Total earned" },
          { label: "This month" },
        ].map((s) => (
          <div key={s.label} className="card p-3 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-ink-500 truncate">{s.label}</div>
            <div className="mt-1 font-serif text-base text-ink-400">—</div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <div className="text-[10px] uppercase tracking-wider text-ink-500">Your invitation link</div>
        <div className="mt-2 flex flex-col gap-2">
          <input
            readOnly
            value={link}
            className="rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 font-mono text-xs text-ink-700"
          />
          <button onClick={copy} className="btn btn-primary text-sm py-2">
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          {[
            { tier: "Tier 1", rate: "5%", note: "Direct" },
            { tier: "Tier 2", rate: "2%", note: "Their partners" },
            { tier: "Tier 3", rate: "1%", note: "Two degrees" },
          ].map((t) => (
            <div key={t.tier} className="rounded-xl bg-cream-50 border border-cream-200 p-2.5 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-gold-600 truncate">{t.tier}</div>
              <div className="font-serif text-lg mt-0.5">{t.rate}</div>
              <div className="text-[10px] text-ink-500 mt-0.5 truncate">{t.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-cream-200">
          <h2 className="font-serif text-base text-ink-900">Partners</h2>
        </div>
        <div className="px-4 py-10 text-center">
          <div className="text-sm text-ink-700">No partners yet</div>
          <div className="text-[11px] text-ink-500 mt-1">
            Share your invitation link — partners and earnings will appear here.
          </div>
        </div>
      </div>
    </div>
  );
}
