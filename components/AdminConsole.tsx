"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  balance: number;
  locked: number;
  created_at: string;
};

type AdminTransaction = {
  id: string;
  user_id: string;
  kind: string;
  amount: number;
  status: string;
  reference: string | null;
  created_at: string;
};

type Overview = {
  page: number;
  pageSize: number;
  totalUsers: number;
  totalTransactions: number;
  pendingTransactions: number;
  users: AdminUser[];
  transactions: AdminTransaction[];
};

const currency = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 2 }).format(amount);

export default function AdminConsole() {
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/admin/overview?page=${page}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load admin data.");
        if (active) setOverview(data as Overview);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load admin data.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [page, refreshKey]);

  const filteredUsers = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return overview?.users ?? [];
    return (overview?.users ?? []).filter((entry) =>
      [entry.name, entry.email, entry.phone, entry.id].some((value) => value.toLowerCase().includes(query)),
    );
  }, [filter, overview]);

  async function submitAdjustment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) return;

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setActionError("Enter an amount greater than zero.");
      return;
    }
    const adjustment = direction === "credit" ? value : -value;
    const operation = direction === "credit" ? "Credit" : "Debit";
    if (!window.confirm(`${operation} ${currency(value)} ${direction === "credit" ? "to" : "from"} ${selectedUser.email || selectedUser.id}?`)) return;

    setSaving(true);
    setActionError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/update-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, amount: adjustment, reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Balance adjustment failed.");
      setNotice(`${operation} recorded for ${selectedUser.email || selectedUser.id}.`);
      setSelectedUser(null);
      setAmount("");
      setReason("");
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Balance adjustment failed.");
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil((overview?.totalUsers ?? 0) / (overview?.pageSize ?? 25)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-gold-700 font-semibold">Operations</p>
          <h2 className="mt-1 font-serif text-2xl text-ink-900">Admin control center</h2>
        </div>
        <div className="text-xs text-ink-500">Privileged access · Actions are recorded in the ledger</div>
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      <div className="grid sm:grid-cols-3 gap-3">
        <Metric label="Registered users" value={loading && !overview ? "—" : String(overview?.totalUsers ?? 0)} />
        <Metric label="Pending transactions" value={loading && !overview ? "—" : String(overview?.pendingTransactions ?? 0)} tone="amber" />
        <Metric label="Ledger entries" value={loading && !overview ? "—" : String(overview?.totalTransactions ?? 0)} tone="green" />
      </div>

      <section className="card overflow-hidden" aria-labelledby="users-heading">
        <div className="px-5 py-4 border-b border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 id="users-heading" className="font-semibold text-ink-900">Users and wallets</h3>
            <p className="text-xs text-ink-500 mt-1">Review wallet balances and apply audited adjustments.</p>
          </div>
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Filter users on this page</span>
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter by name, email, phone, or ID"
              className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500"
            />
          </label>
        </div>

        {selectedUser && (
          <form onSubmit={submitAdjustment} className="border-b border-gold-200 bg-gold-50/60 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <h4 className="font-semibold text-ink-900">Adjust wallet</h4>
                <p className="text-xs text-ink-600 mt-1">{selectedUser.name || "Account"} · {selectedUser.email || selectedUser.id}</p>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} className="text-sm text-ink-600 hover:text-ink-900 self-start">Cancel</button>
            </div>
            <div className="grid sm:grid-cols-[auto_1fr_1fr_auto] gap-3 items-end">
              <fieldset>
                <legend className="text-xs font-medium text-ink-600 mb-1.5">Action</legend>
                <div className="flex rounded-lg border border-cream-300 bg-white p-1">
                  {(["credit", "debit"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={direction === option}
                      onClick={() => setDirection(option)}
                      className={`px-3 py-1.5 rounded-md text-sm capitalize ${direction === option ? (option === "credit" ? "bg-emerald-700 text-white" : "bg-red-700 text-white") : "text-ink-600"}`}
                    >{option}</button>
                  ))}
                </div>
              </fieldset>
              <label className="block text-xs font-medium text-ink-600">
                Amount (GH₵)
                <input required min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1.5 w-full rounded-lg border border-cream-300 bg-white px-3 py-2.5 text-sm text-ink-900" />
              </label>
              <label className="block text-xs font-medium text-ink-600">
                Reason for audit log
                <input required minLength={3} maxLength={300} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1.5 w-full rounded-lg border border-cream-300 bg-white px-3 py-2.5 text-sm text-ink-900" />
              </label>
              <button disabled={saving} type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-50">
                {saving ? "Recording…" : "Record adjustment"}
              </button>
            </div>
            {actionError && <p role="alert" className="text-sm text-red-700">{actionError}</p>}
          </form>
        )}

        {loading && !overview ? (
          <div className="px-5 py-12 text-center text-sm text-ink-500">Loading account data…</div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-ink-500">{error ? "Account data is unavailable." : "No users match this filter."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-cream-50 text-[10px] uppercase text-ink-500">
                <tr>
                  <th className="text-left px-5 py-3">Account</th>
                  <th className="text-right px-5 py-3">Available</th>
                  <th className="text-right px-5 py-3">Locked</th>
                  <th className="text-left px-5 py-3">Joined</th>
                  <th className="text-right px-5 py-3">Control</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((entry) => (
                  <tr key={entry.id} className="border-t border-cream-100">
                    <td className="px-5 py-3 min-w-56">
                      <div className="font-medium text-ink-900">{entry.name || "Unnamed user"}</div>
                      <div className="text-xs text-ink-500">{entry.email || entry.phone || entry.id}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-medium whitespace-nowrap">{currency(entry.balance)}</td>
                    <td className="px-5 py-3 text-right text-ink-600 whitespace-nowrap">{currency(entry.locked)}</td>
                    <td className="px-5 py-3 text-ink-600 whitespace-nowrap">{new Date(entry.created_at).toLocaleDateString("en-GH")}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => { setSelectedUser(entry); setActionError(""); }} className="rounded-md border border-cream-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-gold-400 hover:text-ink-900">Adjust</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-cream-200 px-5 py-3">
          <span className="text-xs text-ink-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-md border border-cream-300 px-3 py-1.5 text-xs disabled:opacity-40">Previous</button>
            <button disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-md border border-cream-300 px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden" aria-labelledby="activity-heading">
        <div className="px-5 py-4 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h3 id="activity-heading" className="font-semibold text-ink-900">Recent platform activity</h3>
            <p className="text-xs text-ink-500 mt-1">Latest entries across all user ledgers.</p>
          </div>
          <span className="text-xs text-ink-500">10 latest</span>
        </div>
        {!overview?.transactions.length ? (
          <div className="px-5 py-10 text-center text-sm text-ink-500">No transactions recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-cream-50 text-[10px] uppercase text-ink-500">
                <tr>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Account</th>
                  <th className="text-left px-5 py-3">Type</th>
                  <th className="text-right px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {overview.transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-cream-100">
                    <td className="px-5 py-3 text-ink-600 whitespace-nowrap">{new Date(transaction.created_at).toLocaleString("en-GH")}</td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-600">{transaction.user_id.slice(0, 8)}…</td>
                    <td className="px-5 py-3 capitalize">{transaction.kind.replaceAll("_", " ")}</td>
                    <td className="px-5 py-3 text-right font-medium whitespace-nowrap">{currency(Number(transaction.amount))}</td>
                    <td className="px-5 py-3 capitalize text-ink-600">{transaction.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value, tone = "gold" }: { label: string; value: string; tone?: "gold" | "amber" | "green" }) {
  const accents = {
    gold: "border-t-gold-500",
    amber: "border-t-amber-500",
    green: "border-t-emerald-600",
  };
  return (
    <div className={`card border-t-2 ${accents[tone]} px-5 py-4`}>
      <div className="text-xs text-ink-500">{label}</div>
      <div className="mt-1 font-serif text-2xl text-ink-900">{value}</div>
    </div>
  );
}