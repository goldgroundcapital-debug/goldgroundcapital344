"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  { href: "/dashboard",             label: "Dashboard",          icon: <DashboardIcon /> },
  { href: "/dashboard/portfolio",   label: "Active Investments", icon: <PortfolioIcon /> },
  { href: "/dashboard/plans",       label: "Browse Plans",       icon: <BrowseIcon /> },
  { href: "/dashboard/transactions",label: "Transactions",       icon: <TransactionsIcon /> },
  { href: "/dashboard/wallet",      label: "Wallet",             icon: <WalletNavIcon /> },
  { href: "/dashboard/referrals",   label: "Referrals",          icon: <ReferralsIcon /> },
];
const ADMIN_NAV: NavItem = { href: "/dashboard/admin", label: "Admin", icon: <AdminIcon /> };

const TITLES: Record<string, string> = {
  "/dashboard":              "Overview",
  "/dashboard/portfolio":    "Active Investments",
  "/dashboard/plans":        "Browse Plans",
  "/dashboard/transactions": "Transaction History",
  "/dashboard/wallet":       "Wallet",
  "/dashboard/deposit":      "Deposit",
  "/dashboard/withdraw":     "Withdraw",
  "/dashboard/referrals":    "Referrals",
  "/dashboard/settings":     "Settings",
  "/dashboard/admin":        "Administration",
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const title = TITLES[pathname] ?? "Overview";
  const [isAdmin, setIsAdmin] = useState(false);
  const nav = isAdmin ? [...NAV, ADMIN_NAV] : NAV;

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setIsAdmin(user.app_metadata?.role === "admin");
      setEmail(user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      setName(data?.full_name ?? (user.email?.split("@")[0] ?? ""));
    })();
  }, []);

  const onSignOut = async () => {
    if (!isSupabaseConfigured()) { router.push("/login"); return; }
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initial = (name || email || "?").trim().charAt(0).toUpperCase();
  const displayName = name || (email ? email.split("@")[0] : "Investor");

  return (
    <div className="min-h-screen flex bg-cream-50">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-cream-200 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-cream-200">
          <Link href="/dashboard" aria-label="GoldGround Capital">
            <Logo size={32} />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map((n) => {
            const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
            return (
              <Link
                key={n.label}
                href={n.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                  active
                    ? "bg-gold-50 text-gold-700 font-medium"
                    : "text-ink-700 hover:bg-cream-50"
                }`}
              >
                <span className={active ? "text-gold-700" : "text-ink-500"}>{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-cream-200 space-y-1">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
              pathname === "/dashboard/settings" ? "bg-gold-50 text-gold-700 font-medium" : "text-ink-700 hover:bg-cream-50"
            }`}
          >
            <span className={pathname === "/dashboard/settings" ? "text-gold-700" : "text-ink-500"}><SettingsIcon /></span>
            Settings
          </Link>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition"
          >
            <SignOutIcon /> Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-cream-200 sticky top-0 z-10">
          <div className="px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile sidebar trigger — for now just shows logo */}
              <Link href="/dashboard" className="md:hidden" aria-label="Home">
                <Logo size={28} />
              </Link>
              <h1 className="font-serif text-xl sm:text-2xl tracking-tight text-ink-900 truncate">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                aria-label="Notifications"
                className="w-10 h-10 rounded-full border border-cream-200 bg-white hover:border-cream-300 flex items-center justify-center text-ink-500"
              >
                <BellIcon />
              </button>
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-ink-900 font-semibold text-sm">
                  {initial}
                </span>
                <div className="hidden sm:block min-w-0">
                  <div className="text-sm font-semibold text-ink-900 truncate max-w-[10rem]">{displayName}</div>
                  <div className="text-[10px] uppercase tracking-wider text-ink-500">{isAdmin ? "Administrator" : "Investor"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile nav strip */}
          <div className="md:hidden border-t border-cream-200 overflow-x-auto">
            <div className="flex gap-1 px-3 py-2 min-w-max">
              {nav.map((n) => {
                const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
                return (
                  <Link
                    key={n.label}
                    href={n.href}
                    className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                      active ? "bg-gold-50 text-gold-700 font-medium" : "text-ink-600"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        <main key={pathname} className="page-enter flex-1 px-5 sm:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ───────── icons ───────── */

function AdminIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function PortfolioIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M5 8a7 7 0 0 1 14 0M5 16a7 7 0 0 0 14 0" />
    </svg>
  );
}
function BrowseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
    </svg>
  );
}
function WalletNavIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M16 13h2" />
    </svg>
  );
}
function TransactionsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7h13M16 3l4 4-4 4M17 17H4M8 21l-4-4 4-4" />
    </svg>
  );
}
function ReferralsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10" r="2.4" />
      <path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 19c0-2 2-3.5 4-3.5s2 1 2 1" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .3 1.8l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.8-.3 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.8.3l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .3-1.8 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.3 7.2l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.8.3H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.8-.3l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.3 1.8V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function SignOutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}
