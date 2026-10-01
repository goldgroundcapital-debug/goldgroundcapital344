"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PLANS } from "@/lib/plans";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

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
  proofUrl: string | null;
  created_at: string;
};

type MonthlyActivity = { label: string; key: string; deposits: number; withdrawals: number };
type Overview = {
  page: number;
  pageSize: number;
  totalUsers: number;
  totalTransactions: number;
  pendingTransactions: number;
  pendingWithdrawals: number;
  pendingDeposits: number;
  users: AdminUser[];
  transactions: AdminTransaction[];
  monthlyActivity: MonthlyActivity[];
};

const NAV_GROUPS = [
  { title: "Manage", items: [{ label: "Clients", target: "users" }, { label: "Accounts", target: "users" }, { label: "Deposits", target: "transactions" }, { label: "Withdrawals", target: "transactions" }, { label: "Investment plans", target: "plans" }] },
  { title: "Compliance", items: [{ label: "Reports", target: "activity-chart" }, { label: "Audit log", target: "transactions" }] },
  { title: "System", items: [{ label: "Settings", target: "admin-info" }] },
];

const currency = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 2 }).format(amount);

export default function AdminDashboard() {
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("Overview");
  const [theme, setTheme] = useState<"light" | "dark">("light");
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
    const query = search.trim().toLowerCase();
    if (!query) return overview?.users ?? [];
    return (overview?.users ?? []).filter((entry) =>
      [entry.name, entry.email, entry.phone, entry.id].some((value) => value.toLowerCase().includes(query)),
    );
  }, [search, overview]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return overview?.transactions ?? [];
    return (overview?.transactions ?? []).filter((entry) =>
      [entry.user_id, entry.kind, entry.status, entry.reference ?? ""].some((value) => value.toLowerCase().includes(query)),
    );
  }, [search, overview]);

  const monthlyActivity = overview?.monthlyActivity ?? [];
  const maxActivity = Math.max(1, ...monthlyActivity.flatMap((entry) => [entry.deposits, entry.withdrawals]));
  const chartPoints = (key: "deposits" | "withdrawals") => monthlyActivity
    .map((entry, index) => `${55 + index * (490 / Math.max(1, monthlyActivity.length - 1))},${182 - (entry[key] / maxActivity) * 142}`)
    .join(" ");
  const currentMonthDeposits = monthlyActivity.at(-1)?.deposits ?? 0;
  const totalPages = Math.max(1, Math.ceil((overview?.totalUsers ?? 0) / (overview?.pageSize ?? 25)));

  function navigate(label: string, target: string) {
    setActiveNav(label);
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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

  async function signOut() {
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    window.location.assign("/login");
  }

  return (
    <div className="admin-workspace" data-theme={theme}>
      <aside className="admin-sidebar">
        <a href="/dashboard/admin" className="admin-brand" onClick={() => setActiveNav("Overview")}>
          <span className="admin-brand-mark"><AdminIcon /></span>
          <span>Gold Ground Capital<small>ADMIN CONSOLE</small></span>
        </a>
        <nav aria-label="Admin navigation" className="admin-navigation">
          <a href="#overview" className={`admin-nav-link ${activeNav === "Overview" ? "is-active" : ""}`} onClick={() => setActiveNav("Overview")}>
            <GridIcon /> Overview
          </a>
          {NAV_GROUPS.map((group) => (
            <div className="admin-nav-group" key={group.title}>
              <h2>{group.title}</h2>
              {group.items.map((item) => (
                <a href={`#${item.target}`} key={`${item.label}-${item.target}`} className={`admin-nav-link ${activeNav === item.label ? "is-active" : ""}`} onClick={() => navigate(item.label, item.target)}>
                  <NavIcon label={item.label} />{item.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-bottom" id="admin-info">
          <span className="admin-status-dot" /> Admin access enabled
          <button onClick={signOut} className="admin-signout">Sign out</button>
        </div>
      </aside>

      <main className="admin-main" id="overview">
        <header className="admin-topbar">
          <div>
            <div className="admin-eyebrow">OPERATIONS / OVERVIEW</div>
            <h1>Overview</h1>
          </div>
          <div className="admin-tools">
            <label className="admin-search">
              <SearchIcon />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients or transactions" aria-label="Search clients or transactions" />
              {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button>}
            </label>
            <button className="admin-icon-button" onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title="Toggle theme"><ThemeIcon dark={theme === "dark"} /></button>
            <button className="admin-user-chip" aria-label="Administrator account"><span className="admin-avatar">A</span><span>Administrator</span></button>
          </div>
        </header>

        {error && <div role="alert" className="admin-alert">{error}</div>}
        {notice && <div role="status" className="admin-notice">{notice}</div>}

        <section className="admin-kpis" aria-label="Platform summary">
          <Metric label="Registered clients" value={overview?.totalUsers} detail="All client profiles" icon="clients" loading={loading} />
          <Metric label="Pending withdrawals" value={overview?.pendingWithdrawals} detail="Awaiting processing" icon="withdrawals" loading={loading} />
          <Metric label="Pending deposits" value={overview?.pendingDeposits} detail="Awaiting confirmation" icon="deposits" loading={loading} />
          <Metric label="Deposits this month" value={currency(currentMonthDeposits)} detail="Current month volume" icon="volume" loading={loading} />
        </section>

        <section className="admin-overview-grid">
          <article className="admin-panel admin-chart-panel" id="activity-chart">
            <div className="admin-panel-heading">
              <div><h2>Deposits vs withdrawals</h2><p>Monthly transaction volume · Last six months</p></div>
              <span className="admin-panel-kicker">GHS</span>
            </div>
            {loading && !overview ? <div className="admin-loading">Loading activity…</div> : (
              <div className="admin-chart-scroll">
                <svg className="admin-chart" viewBox="0 0 590 228" role="img" aria-label="Monthly deposits and withdrawals for the last six months">
                  <g className="admin-chart-grid">
                    <line x1="48" y1="34" x2="570" y2="34" /><line x1="48" y1="82" x2="570" y2="82" /><line x1="48" y1="130" x2="570" y2="130" /><line x1="48" y1="178" x2="570" y2="178" />
                  </g>
                  <polyline className="admin-chart-deposits" points={chartPoints("deposits")} />
                  <polyline className="admin-chart-withdrawals" points={chartPoints("withdrawals")} />
                  {monthlyActivity.map((entry, index) => <text className="admin-chart-label" key={entry.key} x={55 + index * (490 / Math.max(1, monthlyActivity.length - 1))} y="210" textAnchor="middle">{entry.label}</text>)}
                </svg>
              </div>
            )}
            <div className="admin-chart-legend"><span><i className="legend-deposit" /> Deposits</span><span><i className="legend-withdrawal" /> Withdrawals</span></div>
          </article>

          <article className="admin-panel admin-attention-panel">
            <div className="admin-panel-heading"><div><h2>Needs attention</h2><p>Open payment items</p></div><span className="admin-attention-icon"><AttentionIcon /></span></div>
            <a href="#transactions" className="admin-attention-row" onClick={() => setActiveNav("Withdrawals")}><span><b>{overview?.pendingWithdrawals ?? 0}</b> withdrawals awaiting review</span><span aria-hidden="true">›</span></a>
            <a href="#transactions" className="admin-attention-row" onClick={() => setActiveNav("Deposits")}><span><b>{overview?.pendingDeposits ?? 0}</b> deposits awaiting confirmation</span><span aria-hidden="true">›</span></a>
            <div className="admin-attention-foot"><span className="admin-status-dot" /> {overview?.pendingTransactions ? "Review pending items" : "No pending payments"}</div>
          </article>
        </section>

        <section className="admin-overview-grid admin-lower-grid">
          <article className="admin-panel" id="transactions">
            <div className="admin-panel-heading"><div><h2>Recent transactions</h2><p>Latest entries across client accounts</p></div><a className="admin-text-link" href="#users" onClick={() => setActiveNav("Clients")}>Client accounts <span aria-hidden="true">→</span></a></div>
            {filteredTransactions.length === 0 ? <div className="admin-empty">{loading ? "Loading transactions…" : "No matching transactions."}</div> : (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead><tr><th>Client</th><th>Type</th><th>Amount</th><th>Date</th><th>Proof</th><th>Status</th></tr></thead>
                  <tbody>{filteredTransactions.map((transaction) => {
                    const client = overview?.users.find((entry) => entry.id === transaction.user_id);
                    return <tr key={transaction.id}>
                      <td><span className="admin-client-name">{client?.name || client?.email || `${transaction.user_id.slice(0, 8)}…`}</span><small>{client?.email && client?.name ? client.email : transaction.user_id.slice(0, 8)}</small></td>
                      <td className="admin-capitalize">{transaction.kind.replaceAll("_", " ")}</td>
                      <td className={Number(transaction.amount) < 0 ? "admin-amount-negative" : "admin-amount-positive"}>{currency(Number(transaction.amount))}</td>
                      <td>{new Date(transaction.created_at).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}</td>
                      <td>{transaction.proofUrl ? <a className="admin-text-link" href={transaction.proofUrl} target="_blank" rel="noreferrer">View screenshot</a> : "—"}</td>
                      <td><span className={`admin-badge ${transaction.status === "confirmed" ? "is-ok" : transaction.status === "failed" || transaction.status === "cancelled" ? "is-bad" : "is-wait"}`}>{transaction.status}</span></td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
            )}
          </article>

          <article className="admin-panel admin-plans-panel" id="plans">
            <div className="admin-panel-heading"><div><h2>Investment plans</h2><p>{PLANS.length} currently published</p></div><span className="admin-panel-kicker">CATALOGUE</span></div>
            <div className="admin-plan-list">{PLANS.slice(0, 5).map((plan) => (
              <div className="admin-plan-row" key={plan.id}>
                <span className="admin-plan-symbol">{plan.tier.slice(0, 1)}</span>
                <span className="admin-plan-info"><b>{plan.name}</b><small>{plan.tier} · {plan.durationDays} days</small></span>
                <span className="admin-plan-rate">{plan.dailyRate}%<small>/ day</small></span>
              </div>
            ))}</div>
            <p className="admin-plan-note">Plan terms are configured in the application catalogue.</p>
          </article>
        </section>

        <section className="admin-panel admin-users-panel" id="users">
          <div className="admin-panel-heading">
            <div><h2>Clients and accounts</h2><p>Review wallet balances and apply audited adjustments.</p></div>
            <span className="admin-page-label">Page {page} of {totalPages}</span>
          </div>
          {selectedUser && <form onSubmit={submitAdjustment} className="admin-adjust-form">
            <div className="admin-adjust-heading"><div><h3>Adjust wallet</h3><p>{selectedUser.name || "Account"} · {selectedUser.email || selectedUser.id}</p></div><button type="button" className="admin-close-button" onClick={() => setSelectedUser(null)}>Cancel</button></div>
            <div className="admin-adjust-fields">
              <fieldset className="admin-direction"><legend>Action</legend><div>{(["credit", "debit"] as const).map((option) => <button key={option} type="button" aria-pressed={direction === option} onClick={() => setDirection(option)} className={direction === option ? `is-${option}` : ""}>{option}</button>)}</div></fieldset>
              <label>Amount (GH₵)<input required min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
              <label>Reason for audit log<input required minLength={3} maxLength={300} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
              <button className="admin-primary-button" disabled={saving}>{saving ? "Recording…" : "Record adjustment"}</button>
            </div>
            {actionError && <p role="alert" className="admin-form-error">{actionError}</p>}
          </form>}
          {filteredUsers.length === 0 ? <div className="admin-empty">{loading ? "Loading client accounts…" : "No matching clients on this page."}</div> : (
            <div className="admin-table-scroll">
              <table className="admin-table admin-client-table">
                <thead><tr><th>Client</th><th>Available balance</th><th>Locked</th><th>Joined</th><th></th></tr></thead>
                <tbody>{filteredUsers.map((entry) => <tr key={entry.id}>
                  <td><span className="admin-client-name">{entry.name || "Unnamed client"}</span><small>{entry.email || entry.phone || entry.id}</small></td>
                  <td>{currency(entry.balance)}</td><td>{currency(entry.locked)}</td>
                  <td>{new Date(entry.created_at).toLocaleDateString("en-GH")}</td>
                  <td><button className="admin-small-button" onClick={() => { setSelectedUser(entry); setActionError(""); }}>Adjust</button></td>
                </tr>)}</tbody>
              </table>
            </div>
          )}
          <div className="admin-pagination"><span>{overview?.totalUsers ?? 0} clients</span><div><button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</button><button disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>Next</button></div></div>
        </section>

        <footer className="admin-footer">Gold Ground Capital <span>·</span> Administrative workspace <span>·</span> Balance actions are written to the ledger</footer>
      </main>
    </div>
  );
}

function Metric({ label, value, detail, icon, loading }: { label: string; value?: number | string; detail: string; icon: string; loading: boolean }) {
  return <article className="admin-metric"><div className="admin-metric-top"><span>{label}</span><i><MetricIcon name={icon} /></i></div><strong>{loading && value === undefined ? "—" : typeof value === "number" ? value.toLocaleString("en-GH") : value ?? "0"}</strong><small>{detail}</small></article>;
}

function AdminIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 21 6v5.1c0 5.3-3.7 8.8-9 10.9-5.3-2.1-9-5.6-9-10.9V6l9-3.5Z" /><path d="m8.5 12 2.3 2.3 4.8-4.8" /></svg>; }
function GridIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>; }
function ThemeIcon({ dark }: { dark: boolean }) { return dark ? <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.4A8.7 8.7 0 0 1 8.6 3.5 8.8 8.8 0 1 0 20.5 15.4Z" /></svg>; }
function AttentionIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v5m0 3h.01" /></svg>; }
function NavIcon({ label }: { label: string }) { return <svg viewBox="0 0 24 24" aria-hidden="true">{label.includes("Deposit") || label.includes("Withdrawal") ? <><path d="M12 3v13m-5-5 5 5 5-5" /><path d="M4 19h16" /></> : label.includes("plan") ? <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M8 5V3h8v2m-13 5h18" /></> : label === "Reports" || label === "Audit log" ? <><path d="M5 20V10m7 10V4m7 16v-7" /></> : label === "Settings" ? <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.4-2.8 2.8-1.4-1.4-.1-.1a2 2 0 0 1-1.4.6H13v2h-4v-2H7.6a2 2 0 0 1-1.4-.6l-.1.1-1.4 1.4-2.8-2.8 1.4-1.4.1-.1a2 2 0 0 1-.6-1.4V12H1v-4h2V6.6a2 2 0 0 1 .6-1.4l-.1-.1-1.4-1.4 2.8-2.8 1.4 1.4.1.1A2 2 0 0 1 7.8 2H9V0h4v2h1.2a2 2 0 0 1 1.4.6l.1-.1 1.4-1.4 2.8 2.8-1.4 1.4-.1.1a2 2 0 0 1 .6 1.4V8h2v4h-2v1.2a2 2 0 0 1-.6 1.8Z" transform="translate(2 2) scale(.83)" /></> : <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.4 2.5-5.5 6-5.5s6 2.1 6 5.5m2-10a2.5 2.5 0 1 0 0-5m1 9c2.2.5 3.5 2.2 3.5 4.5" /></>}</svg>; }
function MetricIcon({ name }: { name: string }) { return <svg viewBox="0 0 24 24" aria-hidden="true">{name === "clients" ? <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.2 2.4-5 6-5s6 1.8 6 5m2-9a2.5 2.5 0 1 0 0-5m1 9c2.4.5 3.5 2.2 3.5 5" /></> : name === "withdrawals" || name === "deposits" ? <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 10h18m-7 5h3" /></> : <><path d="M4 18V9m6 9V5m6 13v-6m5 6H2" /></>}</svg>; }
