"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DepositForm from "@/components/DepositForm";
import WithdrawForm from "@/components/WithdrawForm";

type Tab = "deposit" | "withdraw";

type Txn = {
  id: string;
  kind: string;
  amount: number;
  status: string;
  created_at: string;
};

export default function WalletPage() {
  const [tab, setTab] = useState<Tab>("deposit");
  const [balance, setBalance] = useState<number | null>(null);
  const [txns, setTxns] = useState<Txn[] | null>(null);

  const refresh = async () => {
    try {
      const [w, t] = await Promise.all([
        fetch("/api/wallet").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/transactions?limit=6").then((r) => (r.ok ? r.json() : null)),
      ]);
      if (w) setBalance(Number(w.balance ?? 0));
      if (t) setTxns(t.transactions ?? []);
    } catch { /* signed out or network blip */ }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="space-y-5">
      {/* Balance banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1f3a8a] via-[#2247bd] to-[#3257d0] p-6 sm:p-8 text-white">
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          <div>
            <div className="flex items-center gap-2 text-cream-100 text-xs uppercase tracking-[0.18em]">
              <WalletGlyph /> Available balance
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif text-2xl text-cream-100 opacity-90">GH₵</span>
              <span className="font-serif text-4xl sm:text-5xl font-semibold">
                {balance === null ? "—" : balance.toFixed(2)}
              </span>
            </div>
          </div>

          <Link
            href="/dashboard/plans"
            className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-[#1f3a8a] font-semibold text-sm shadow hover:bg-white/95"
          >
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#1f3a8a]/10">
              <BrowseGlyph />
            </span>
            <span className="text-left">
              <span className="block text-[10px] uppercase tracking-wider text-[#1f3a8a]/70 font-medium">Ready to invest?</span>
              <span className="block">Browse Plans →</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* Tabs + form */}
        <div className="card overflow-hidden">
          <div className="grid grid-cols-2 border-b border-cream-200">
            {(["deposit", "withdraw"] as Tab[]).map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center justify-center gap-2 py-4 text-sm font-medium border-b-2 transition ${
                    active
                      ? "border-[#1f3a8a] text-[#1f3a8a] bg-[#1f3a8a]/5"
                      : "border-transparent text-ink-500 hover:text-ink-800"
                  }`}
                >
                  {t === "deposit" ? <ArrowDownIcon /> : <ArrowUpIcon />}
                  {t === "deposit" ? "Deposit" : "Withdraw"}
                </button>
              );
            })}
          </div>

          <div className="p-5 sm:p-6">
            {tab === "deposit"
              ? <DepositForm onSubmitted={refresh} />
              : <WithdrawForm onSubmitted={refresh} />}
          </div>
        </div>

        {/* Recent activity sidebar */}
        <div className="card overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
            <h2 className="font-semibold text-base text-ink-900">Recent Activity</h2>
            <Link href="/dashboard/transactions" className="text-[11px] font-semibold text-[#1f3a8a] hover:underline tracking-wider">
              VIEW ALL
            </Link>
          </div>

          {txns === null ? (
            <div className="px-5 py-8 text-center text-xs text-ink-400">Loading…</div>
          ) : txns.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="text-sm text-ink-600">No activity yet</div>
              <div className="text-[11px] text-ink-400 mt-1">Deposits and withdrawals will show up here.</div>
            </div>
          ) : (
            <ul className="divide-y divide-cream-100">
              {txns.map((t) => {
                const negative = Number(t.amount) < 0;
                return (
                  <li key={t.id} className="px-5 py-3 flex items-center gap-3">
                    <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${negative ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
                      {negative ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-ink-800 capitalize truncate">{t.kind.replace("_", " ")}</div>
                      <div className="text-[10px] uppercase tracking-wider text-ink-400">
                        {new Date(t.created_at).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold whitespace-nowrap ${negative ? "text-ink-700" : "text-emerald-700"}`}>
                      {negative ? "−" : "+"}GH₵ {Math.abs(Number(t.amount)).toFixed(0)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function WalletGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M16 13h2" />
    </svg>
  );
}
function BrowseGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
    </svg>
  );
}
function ArrowDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}
function ArrowUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}
