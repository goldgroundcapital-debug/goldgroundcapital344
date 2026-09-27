"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

type Props = {
  children: React.ReactNode;
  showBottomNav?: boolean;
};

export default function MobileShell({ children, showBottomNav = true }: Props) {
  return (
    <div className="min-h-screen bg-[#F4F6FB] pb-24">
      <div className="mx-auto w-full max-w-md">
        <TopBar />
        <main className="px-4 pt-3 space-y-4">{children}</main>
      </div>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

function TopBar() {
  return (
    <header className="bg-white px-3 py-2 flex items-center justify-between gap-2">
      <Link href="/" className="flex items-center gap-2 shrink min-w-0">
        <Image
          src="/logo.jpg"
          alt="GoldGround Capital"
          width={320}
          height={180}
          priority
          className="h-10 w-auto rounded-md object-contain shrink-0"
        />
        <Logo size={28} />
      </Link>
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gold-gradient shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 2l2.39 7.36H22l-6.18 4.49L18.21 22 12 17.27 5.79 22l2.39-8.15L2 9.36h7.61z" />
        </svg>
      </span>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const tabs = [
    { label: "Home", href: "/", icon: <HomeIcon /> },
    { label: "Invest", href: "/dashboard/plans", icon: <InvestIcon /> },
    { label: "Notice", href: "/dashboard", raised: true },
    { label: "Forum", href: "/dashboard", icon: <ForumIcon /> },
    { label: "Account", href: "/dashboard/settings", icon: <AccountIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-cream-200 z-40">
      <div className="grid grid-cols-5 items-end h-16 px-2">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return t.raised ? (
            <Link key={t.label} href={t.href} className="flex flex-col items-center -mt-6">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#5BB0FF] to-[#3F7CFF] shadow-lg">
                <span className="text-2xl" aria-hidden>🎁</span>
              </span>
              <span className="text-[11px] text-ink-600 mt-0.5">{t.label}</span>
            </Link>
          ) : (
            <Link
              key={t.label}
              href={t.href}
              className={`flex flex-col items-center gap-0.5 py-2 ${
                active ? "text-[#2F6BE5]" : "text-ink-500"
              }`}
            >
              {t.icon}
              <span className="text-[11px]">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3 3 11h2v9h5v-5h4v5h5v-9h2z" />
    </svg>
  );
}
function InvestIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 9.5c0-1.4 1.3-2 3-2s3 .8 3 2-1.5 1.8-3 2-3 .6-3 2 1.3 2 3 2 3-.6 3-2" />
    </svg>
  );
}
function ForumIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  );
}
function AccountIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="3.5" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  );
}
