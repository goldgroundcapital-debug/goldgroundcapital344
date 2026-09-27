"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Field from "@/components/Field";
import GoogleButton from "@/components/GoogleButton";
import Logo from "@/components/Logo";
import SetupNotice from "@/components/SetupNotice";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const oauthError = params.get("error") === "oauth";

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(oauthError ? "Google sign-in failed — please try again." : null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.password) return setError("Please enter your email and password.");

    setBusy(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      setBusy(false);
      setError(signInError.message);
      return;
    }

    router.push(next);
    router.refresh();
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 page-enter">
      {/* LEFT — form */}
      <div className="flex flex-col px-6 sm:px-10 lg:px-16 py-8 sm:py-12 overflow-y-auto">
        <Link href="/" className="inline-flex" aria-label="GoldGround Capital home">
          <Logo size={36} />
        </Link>

        {!isSupabaseConfigured() ? (
          <div className="mt-12 max-w-md">
            <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-ink-900">Welcome back</h1>
            <p className="mt-2 text-ink-600">Backend setup required.</p>
            <div className="mt-6"><SetupNotice /></div>
          </div>
        ) : (
          <div className="mt-10 max-w-md w-full">
            <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-ink-900">
              Welcome back
            </h1>
            <p className="mt-2 text-ink-600">
              Sign in to keep growing your portfolio.
            </p>

            <div className="mt-8">
              <GoogleButton next={next} />

              <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
                <span className="flex-1 h-px bg-cream-200" />
                <span className="uppercase tracking-wider">or sign in with email</span>
                <span className="flex-1 h-px bg-cream-200" />
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <Field
                label="Email address"
                name="email"
                type="email"
                placeholder="you@domain.com"
                value={form.email}
                onChange={onChange}
                required
                autoComplete="email"
              />

              <Field
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-ink-700">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={onChange}
                    className="w-4 h-4 rounded border-cream-300 text-gold-500 focus:ring-gold-200"
                  />
                  Keep me signed in
                </label>
                <a href="#" className="text-gold-600 hover:underline">Forgot password?</a>
              </div>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
                {busy ? "Signing in…" : "Sign in"}
              </button>

              <p className="text-center text-sm text-ink-600">
                New here?{" "}
                <Link href="/register" className="text-gold-700 hover:underline font-medium">Open an account</Link>
              </p>
            </form>
          </div>
        )}
      </div>

      {/* RIGHT — decorative panel (identical to register) */}
      <div className="hidden lg:block relative overflow-hidden bg-ink-900">
        <Image
          src="/machines/bucket-wheel.webp"
          alt=""
          fill
          sizes="50vw"
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900/80 via-ink-900/60 to-ink-900/40" />

        <div className="relative h-full w-full flex items-center justify-center p-12">
          <div className="max-w-md w-full rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md p-8 text-white shadow-2xl">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold-gradient/30 border border-gold-200/40">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EAD075" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>

            <h2 className="mt-5 font-serif text-3xl leading-tight">
              Build Wealth From the Ground Up
            </h2>

            <ul className="mt-6 space-y-4 text-cream-100">
              {[
                "Access fractional ownership of real mining machinery — conveyors, drills, haul trucks.",
                "Earn daily yield credited straight to your wallet, withdrawable anytime.",
                "Principal returned at plan maturity — transparent ledger, no lockup on earnings.",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <CheckCircle />
                  <span className="text-sm leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 pt-5 border-t border-white/15 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#EAD075", "#C9A227", "#8C6E17"].map((c) => (
                  <span
                    key={c}
                    className="w-7 h-7 rounded-full border-2 border-ink-900"
                    style={{ background: `linear-gradient(135deg, ${c}, #fff2)` }}
                  />
                ))}
              </div>
              <div>
                <div className="text-sm font-semibold">Join 50,000+ investors</div>
                <div className="text-xs text-cream-200">Building portfolios from the ground up.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function CheckCircle() {
  return (
    <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-gradient/40 border border-gold-200/40 mt-0.5">
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#EAD075" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 8.5 L7 12 L13 5" />
      </svg>
    </span>
  );
}
