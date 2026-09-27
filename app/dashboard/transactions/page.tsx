"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Txn = {
  id: string;
  kind: string;
  amount: number;
  status: string;
  reference: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

type Tab = "all" | "deposit" | "withdrawal" | "dividend";

const TABS: { id: Tab; label: string }[] = [
  { id: "all",        label: "All History" },
  { id: "deposit",    label: "Deposits" },
  { id: "withdrawal", label: "Withdrawals" },
  { id: "dividend",   label: "Dividends" },
];

export default function TransactionsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [txns, setTxns] = useState<Txn[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/transactions?limit=100");
        if (!r.ok) { setTxns([]); return; }
        const json = await r.json();
        setTxns(json.transactions ?? []);
      } catch { setTxns([]); }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!txns) return null;
    if (tab === "all") return txns.filter((t) => t.kind !== "fee"); // hide raw fee debits
    if (tab === "dividend") return txns.filter((t) => t.kind === "yield" || t.kind === "referral");
    return txns.filter((t) => t.kind === tab);
  }, [txns, tab]);

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-[#1f3a8a] text-white shadow"
                    : "bg-white border border-cream-200 text-ink-700 hover:border-cream-300"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <Link
          href="/dashboard/wallet"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-cream-200 bg-white text-sm text-ink-700 hover:border-gold-200 self-start sm:self-auto"
        >
          <WalletIcon /> Manage Wallet
        </Link>
      </div>

      {/* Activity card */}
      <div className="card overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-cream-200">
          <h2 className="font-semibold text-lg text-ink-900">Your Activity</h2>
          <p className="mt-1 text-sm text-ink-500">A complete record of your financial transactions.</p>
        </div>

        {filtered === null ? (
          <div className="px-5 py-16 text-center text-sm text-ink-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-ink-500 bg-cream-50">
                <tr>
                  <th className="text-left px-5 sm:px-6 py-3">Date</th>
                  <th className="text-left px-5 sm:px-6 py-3">Type</th>
                  <th className="text-left px-5 sm:px-6 py-3">Reference</th>
                  <th className="text-right px-5 sm:px-6 py-3">Amount</th>
                  <th className="text-left px-5 sm:px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-t border-cream-100">
                    <td className="px-5 sm:px-6 py-3 text-ink-600 whitespace-nowrap">
                      {new Date(t.created_at).toLocaleString("en-GH", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-5 sm:px-6 py-3 capitalize">{t.kind.replace("_", " ")}</td>
                    <td className="px-5 sm:px-6 py-3 font-mono text-[11px] text-ink-500 truncate max-w-[12rem]">
                      {t.reference ?? "—"}
                    </td>
                    <td className={`px-5 sm:px-6 py-3 text-right font-semibold whitespace-nowrap ${Number(t.amount) < 0 ? "text-ink-700" : "text-gold-700"}`}>
                      {Number(t.amount) < 0 ? "−" : "+"}GH₵ {Math.abs(Number(t.amount)).toFixed(2)}
                    </td>
                    <td className="px-5 sm:px-6 py-3">
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

function EmptyState({ tab }: { tab: Tab }) {
  const labels: Record<Tab, { title: string; body: string }> = {
    all:        { title: "No transaction history",    body: "Your deposits, withdrawals, and dividends will appear here once you start investing." },
    deposit:    { title: "No deposits yet",           body: "Add funds to your wallet to activate a plan." },
    withdrawal: { title: "No withdrawals yet",        body: "Once you cash out earnings, they'll show up here." },
    dividend:   { title: "No dividends yet",          body: "Activate a plan to start earning daily yield credits." },
  };
  const l = labels[tab];

  return (
    <div className="px-5 py-16 text-center">
      <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cream-100 text-ink-400">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      </span>
      <h3 className="mt-5 font-semibold text-lg text-ink-900">{l.title}</h3>
      <p className="mt-1.5 text-sm text-ink-500 max-w-sm mx-auto">{l.body}</p>
      <Link
        href="/dashboard/wallet"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1f3a8a] hover:bg-[#2247bd] text-white font-semibold text-sm shadow"
      >
        <WalletIcon /> Add Funds
      </Link>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "confirmed" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
    status === "failed" || status === "cancelled" ? "bg-red-50 border-red-200 text-red-700" :
    "bg-amber-50 border-amber-200 text-amber-700";
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${color}`}>
      {status}
    </span>
  );
}

function WalletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M16 13h2" />
    </svg>
  );
}
