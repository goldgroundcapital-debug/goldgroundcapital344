"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const NAV = [
  { href: "#opportunities", label: "Invest" },
  { href: "#how", label: "How it works" },
  { href: "#why", label: "Why us" },
  { href: "/dashboard", label: "Portfolio" },
];

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setSignedIn(false); return; }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSignOut = async () => {
    if (!isSupabaseConfigured()) return;
    await createClient().auth.signOut();
    setSignedIn(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-cream-50/85 border-b border-cream-200">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="GoldGround Capital home">
          <Logo size={34} />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[0.92rem] text-ink-700">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-ink-900 transition-colors">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {signedIn === null ? (
            <div className="w-32 h-9" aria-hidden /> // reserve space, avoid flicker
          ) : signedIn ? (
            <>
              <Link href="/dashboard" className="text-[0.92rem] text-ink-700 hover:text-ink-900 px-3 py-2">
                Dashboard
              </Link>
              <button onClick={onSignOut} className="btn btn-primary">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[0.92rem] text-ink-700 hover:text-ink-900 px-3 py-2">
                Sign in
              </Link>
              <Link href="/register" className="btn btn-primary">
                Start earning
                <span aria-hidden>→</span>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-cream-200 bg-white"
          aria-label="Toggle menu"
          onClick={() => setOpen((s) => !s)}
        >
          <span className="block w-4 h-[2px] bg-ink-800 relative before:absolute before:-top-1.5 before:w-4 before:h-[2px] before:bg-ink-800 after:absolute after:top-1.5 after:w-4 after:h-[2px] after:bg-ink-800" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-cream-200 bg-cream-50">
          <div className="px-5 py-4 flex flex-col gap-3">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-2 text-ink-700">
                {n.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              {signedIn ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="btn btn-ghost flex-1">Dashboard</Link>
                  <button onClick={() => { setOpen(false); onSignOut(); }} className="btn btn-primary flex-1">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="btn btn-ghost flex-1">Sign in</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn btn-primary flex-1">Start earning</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
