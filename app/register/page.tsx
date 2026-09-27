"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Field from "@/components/Field";
import Logo from "@/components/Logo";
import SetupNotice from "@/components/SetupNotice";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

function RegisterContent() {
  const router = useRouter();
  const params = useSearchParams();
  const inviteFromUrl = params.get("invitation_code") ?? "";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    country: "Ghana",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    invite: inviteFromUrl,
    agree: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.firstName || !form.lastName) return setError("First and last name are required.");
    if (!form.email || !form.password) return setError("Email and password are required.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords don't match.");
    if (!form.agree) return setError("Please accept the terms to continue.");
    if (form.phone && !/^[25]\d{8}$/.test(form.phone)) {
      return setError("Phone must start with 2 or 5 and be 9 digits.");
    }

    setBusy(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone ? `+233${form.phone}` : null,
          country: form.country,
          referred_by: form.invite || null,
        },
      },
    });

    if (signUpError) {
      setBusy(false);
      setError(signUpError.message);
      return;
    }

    router.push("/dashboard");
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
            <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-ink-900">Create your account</h1>
            <p className="mt-2 text-ink-600">Backend setup required.</p>
            <div className="mt-6"><SetupNotice /></div>
          </div>
        ) : (
          <div className="mt-10 max-w-md w-full">
            <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-ink-900">
              Create your account
            </h1>
            <p className="mt-2 text-ink-600">
              Start investing in real mining machinery with as little as <span className="font-semibold text-ink-900">GH₵ 50</span>.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="First name"
                  name="firstName"
                  type="text"
                  placeholder=""
                  value={form.firstName}
                  onChange={onChange}
                  required
                  autoComplete="given-name"
                />
                <Field
                  label="Last name"
                  name="lastName"
                  type="text"
                  placeholder=""
                  value={form.lastName}
                  onChange={onChange}
                  required
                  autoComplete="family-name"
                />
              </div>

              <label className="block">
                <span className="block text-sm font-medium text-ink-800">Country</span>
                <div className="mt-1.5 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                    </svg>
                  </span>
                  <select
                    name="country"
                    value={form.country}
                    onChange={onChange}
                    className="w-full rounded-xl border border-cream-200 bg-white pl-11 pr-4 py-3 outline-none focus:border-gold-300 focus:ring-4 focus:ring-gold-100 appearance-none"
                  >
                    <option value="Ghana">Ghana</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-ink-800">Phone number</span>
                <div className="mt-1.5 flex rounded-xl border border-cream-200 bg-white overflow-hidden focus-within:border-gold-300 focus-within:ring-4 focus-within:ring-gold-100">
                  <span className="px-4 py-3 bg-cream-50 border-r border-cream-200 text-ink-700 text-sm font-medium">+233</span>
                  <input
                    type="tel"
                    name="phone"
                    inputMode="tel"
                    placeholder="54 123 4567"
                    value={form.phone}
                    onChange={onChange}
                    autoComplete="tel-national"
                    className="flex-1 px-4 py-3 outline-none bg-transparent"
                  />
                </div>
                <span className="mt-1.5 block text-xs text-ink-500">
                  Do not include 0 or 233. Must start with 2 or 5 (9 digits total).
                </span>
              </label>

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

              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                  required
                  autoComplete="new-password"
                />
                <Field
                  label="Confirm"
                  name="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={onChange}
                  required
                  autoComplete="new-password"
                />
              </div>

              <Field
                label="Invitation code"
                name="invite"
                type="text"
                placeholder="Optional"
                value={form.invite}
                onChange={onChange}
              />

              <label className="flex items-start gap-3 text-sm text-ink-700">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={onChange}
                  className="mt-1 w-4 h-4 rounded border-cream-300 text-gold-500 focus:ring-gold-200"
                />
                <span>
                  I agree to the <a href="#" className="text-gold-600 hover:underline">terms of service</a> and{" "}
                  <a href="#" className="text-gold-600 hover:underline">risk disclosure</a>.
                </span>
              </label>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
                {busy ? "Creating account…" : "Create account"}
              </button>

              <p className="text-center text-sm text-ink-600">
                Already a member?{" "}
                <Link href="/login" className="text-gold-700 hover:underline font-medium">Sign in</Link>
              </p>
            </form>
          </div>
        )}
      </div>

      {/* RIGHT — decorative panel */}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
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
