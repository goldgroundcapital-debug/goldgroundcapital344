"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PLANS } from "@/lib/plans";

type Txn = {
  id: string;
  kind: string;
  amount: number;
  status: string;
  reference: string | null;
  created_at: string;
};

export default function DashboardHome() {
  const [balance, setBalance] = useState<number | null>(null);
  const [locked, setLocked] = useState<number | null>(null);
  const [txns, setTxns] = useState<Txn[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [w, t] = await Promise.all([
          fetch("/api/wallet").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/transactions?limit=20").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (w) { setBalance(Number(w.balance ?? 0)); setLocked(Number(w.locked ?? 0)); }
        if (t) setTxns(t.transactions ?? []);
      } catch { /* not signed in or network blip */ }
    })();
  }, []);

  const totalEarnings = useMemo(() => {
    if (!txns) return null;
    return txns
      .filter((t) => (t.kind === "yield" || t.kind === "referral") && t.status === "confirmed")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [txns]);

  const fmt = (n: number | null) => (n === null ? "—" : `GH₵ ${n.toFixed(2)}`);

  const featured = PLANS.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 4 Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Active Investment"
          value={fmt(locked)}
          tone="purple"
          icon={<BriefcaseIcon />}
        />
        <StatCard
          label="Available Cash"
          value={fmt(balance)}
          tone="green"
          icon={<WalletIcon />}
        />
        <StatCard
          label="Total Earnings"
          value={fmt(totalEarnings)}
          tone="pink"
          icon={<EarningsIcon />}
        />
        <StatCard
          label="Average ROI"
          value="0.00%"
          tone="orange"
          icon={<ChartIcon />}
        />
      </div>

      {/* CTA banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1f3a8a] via-[#2247bd] to-[#3257d0] p-6 sm:p-8 text-white">
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight">Ready to grow your portfolio?</h2>
            <p className="mt-2 text-sm sm:text-base text-white/85 max-w-xl">
              Deposit funds to your wallet and explore real mining-machinery plans paying daily yield.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/wallet"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#1f3a8a] font-semibold text-sm shadow hover:bg-white/95"
            >
              <PlusIcon /> Add Funds
            </Link>
            <Link
              href="/dashboard/plans"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#3257d0]/30 text-white font-semibold text-sm border border-white/30 hover:bg-[#3257d0]/50"
            >
              <PlayIcon /> Start Investing
            </Link>
          </div>
        </div>
      </div>

      {/* Featured plans */}
      <div className="card overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink-900 flex items-center gap-2">
            <SparkIcon /> Featured Plans
          </h2>
          <Link href="/dashboard/plans" className="text-xs text-gold-700 hover:underline">View all →</Link>
        </div>
        <div className="p-5 sm:p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((p) => (
            <Link
              key={p.id}
              href="/dashboard/plans"
              className="group rounded-xl border border-cream-200 hover:border-gold-200 transition overflow-hidden bg-white"
            >
              <div className="relative h-32 bg-cream-100">
                {p.image && (
                  <Image
                    src={p.image}
                    alt={p.machine}
                    fill
                    sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-4">
                <div className="text-xs uppercase tracking-wider text-gold-600">{p.tier}</div>
                <div className="mt-1 font-serif text-lg text-ink-900">{p.name}</div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs text-ink-500">From GH₵ {p.min}</span>
                  <span className="text-sm font-semibold text-gold-700">{p.dailyRate}% / day</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink-900">Recent activity</h2>
          <span className="text-xs text-ink-500">
            {txns?.length ? `${txns.length} entr${txns.length === 1 ? "y" : "ies"}` : ""}
          </span>
        </div>
        {txns === null ? (
          <div className="px-5 py-10 text-center text-xs text-ink-400">Loading…</div>
        ) : txns.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="text-sm text-ink-700">No activity yet</div>
            <div className="text-xs text-ink-500 mt-1">
              Your deposits, yields, and withdrawals will show up here.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-ink-500 bg-cream-50">
                <tr>
                  <th className="text-left px-5 py-2.5">Date</th>
                  <th className="text-left px-5 py-2.5">Type</th>
                  <th className="text-right px-5 py-2.5">Amount</th>
                  <th className="text-left px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t.id} className="border-t border-cream-100">
                    <td className="px-5 py-2.5 text-ink-600">{new Date(t.created_at).toLocaleDateString("en-GH")}</td>
                    <td className="px-5 py-2.5 capitalize">{t.kind.replace("_", " ")}</td>
                    <td className={`px-5 py-2.5 text-right font-semibold ${Number(t.amount) < 0 ? "text-ink-700" : "text-gold-700"}`}>
                      {Number(t.amount) < 0 ? "−" : "+"}GH₵ {Math.abs(Number(t.amount)).toFixed(2)}
                    </td>
                    <td className="px-5 py-2.5">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label, value, tone, icon,
}: {
  label: string;
  value: string;
  tone: "purple" | "green" | "pink" | "orange";
  icon: React.ReactNode;
}) {
  const tones: Record<typeof tone, string> = {
    purple: "bg-[#EDE9FE] text-[#6D28D9]",
    green:  "bg-[#DCFCE7] text-[#15803D]",
    pink:   "bg-[#FCE7F3] text-[#BE185D]",
    orange: "bg-[#FFEDD5] text-[#C2410C]",
  };
  return (
    <div className="card p-5 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-40" style={{ background: "radial-gradient(circle, currentColor 0%, transparent 70%)" }} />
      <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${tones[tone]}`}>
        {icon}
      </span>
      <div className="mt-4 text-sm text-ink-600">{label}</div>
      <div className="mt-1 font-serif text-2xl text-ink-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "confirmed" ? "bg-gold-50 border-gold-200 text-gold-700" :
    status === "failed" || status === "cancelled" ? "bg-red-50 border-red-200 text-red-700" :
    "bg-cream-50 border-cream-200 text-ink-600";
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${color}`}>
      {status}
    </span>
  );
}

/* ───────── icons ───────── */

function BriefcaseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M16 13h2" />
    </svg>
  );
}
function EarningsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <circle cx="12" cy="12.5" r="2.5" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l5-5 4 4 8-9" />
      <path d="M14 7h6v6" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9l5 3-5 3z" fill="currentColor" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2" />
    </svg>
  );
}
