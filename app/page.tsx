"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PLANS, formatCurrency } from "@/lib/plans";

/* Mock funding + investor counts per plan — lower-tier plans get more investors,
   higher-tier plans are partially funded. Looks realistic on a marketing page. */
const META: Record<string, { funded: number; investors: number; raised: number }> = {
  conveyor:     { funded: 96, investors: 1847, raised: 4_792 },
  bulldozer:    { funded: 78, investors:  942, raised: 11_700 },
  drill:        { funded: 62, investors:  518, raised: 31_000 },
  haul:         { funded: 41, investors:  263, raised: 61_500 },
  shovel:       { funded: 28, investors:   84, raised: 140_000 },
  "bucket-wheel": { funded: 14, investors: 21, raised: 280_000 },
};

type Filters = {
  cls: "all" | "light" | "medium" | "heavy";
  ret: "all" | "low" | "mid" | "high";
  min: "all" | "u5k" | "5k50k" | "o50k";
};

export default function Home() {
  const [filters, setFilters] = useState<Filters>({ cls: "all", ret: "all", min: "all" });

  const opportunities = useMemo(() => {
    return PLANS.filter((p) => {
      const cls =
        p.min < 5000 ? "light" : p.min < 50000 ? "medium" : "heavy";
      const ret = p.dailyRate < 2 ? "low" : p.dailyRate < 3 ? "mid" : "high";
      const min = p.min < 5000 ? "u5k" : p.min < 50000 ? "5k50k" : "o50k";
      return (
        (filters.cls === "all" || filters.cls === cls) &&
        (filters.ret === "all" || filters.ret === ret) &&
        (filters.min === "all" || filters.min === min)
      );
    });
  }, [filters]);

  return (
    <>
      <Navbar />
      <main className="page-enter">
        <Hero />
        <FilterBar filters={filters} onChange={setFilters} count={opportunities.length} />
        <Opportunities plans={opportunities} />
        <HowItWorks />
        <WhyInvest />
        <SocialProof />
      </main>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/machines/bucket-wheel.webp"
          alt="Mining machinery in operation"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900/85 via-ink-900/70 to-ink-900/60" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs tracking-wider uppercase text-cream-100 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
            New investment cycle open
          </span>

          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white">
            Fractional Mining Investment.
            <br />
            <span className="text-gold-gradient">Own the Machine. Earn Daily.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-cream-100 leading-relaxed">
            Stake from <span className="text-white font-semibold">GH₵ 50</span> in real
            mining hardware — conveyors, drills, haul trucks, bucket-wheel excavators.
            Returns paid every 24 hours; principal released at the end of the term.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/register" className="btn btn-primary">
              Start earning now
              <span aria-hidden>→</span>
            </Link>
            <a href="#opportunities"
               className="btn bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur">
              View live plans
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 max-w-xl text-white">
            {[
              { k: "GH₵ 50", v: "Minimum stake" },
              { k: "1.5–4%", v: "Daily yield" },
              { k: "50,000+", v: "Active investors" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="text-2xl sm:text-3xl font-serif font-semibold">{s.k}</dt>
                <dd className="text-xs uppercase tracking-wider text-cream-200 mt-1">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function FilterBar({
  filters, onChange, count,
}: { filters: Filters; onChange: (f: Filters) => void; count: number }) {
  return (
    <section className="relative -mt-8 z-10 px-5 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="card p-5 sm:p-6 grid lg:grid-cols-12 gap-4 items-end">
          <FilterGroup
            label="Machine class"
            value={filters.cls}
            onChange={(v) => onChange({ ...filters, cls: v as Filters["cls"] })}
            options={[
              { v: "all", label: "All" },
              { v: "light", label: "Light" },
              { v: "medium", label: "Medium" },
              { v: "heavy", label: "Heavy" },
            ]}
            className="lg:col-span-4"
          />
          <FilterGroup
            label="Daily return"
            value={filters.ret}
            onChange={(v) => onChange({ ...filters, ret: v as Filters["ret"] })}
            options={[
              { v: "all", label: "All" },
              { v: "low", label: "1–2%" },
              { v: "mid", label: "2–3%" },
              { v: "high", label: "3%+" },
            ]}
            className="lg:col-span-4"
          />
          <FilterGroup
            label="Minimum stake"
            value={filters.min}
            onChange={(v) => onChange({ ...filters, min: v as Filters["min"] })}
            options={[
              { v: "all", label: "All" },
              { v: "u5k", label: "< GH₵ 5k" },
              { v: "5k50k", label: "GH₵ 5k–50k" },
              { v: "o50k", label: "GH₵ 50k+" },
            ]}
            className="lg:col-span-4"
          />
        </div>
        <div className="mt-3 text-xs text-ink-500 px-1">
          Showing {count} of {PLANS.length} active machines
        </div>
      </div>
    </section>
  );
}

function FilterGroup({
  label, value, onChange, options, className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs uppercase tracking-wider text-ink-500 mb-2">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              value === o.v
                ? "bg-gold-gradient text-ink-900 border-transparent font-semibold"
                : "bg-white border-cream-200 text-ink-700 hover:border-gold-200"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Opportunities({ plans }: { plans: typeof PLANS }) {
  return (
    <section id="opportunities" className="section-pad bg-cream-50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.22em] text-gold-600">Live opportunities</span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight text-ink-900">
              Real machines accepting capital now.
            </h2>
          </div>
          <Link href="/register" className="text-sm text-gold-700 hover:underline">
            See all plans →
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="mt-10 card p-10 text-center text-ink-500">
            No machines match those filters. Loosen one to see more.
          </div>
        ) : (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((p) => {
              const meta = META[p.id] ?? { funded: 50, investors: 100, raised: p.min };
              return (
                <article key={p.id} className="card overflow-hidden flex flex-col group">
                  <div className="relative h-48 bg-cream-100 overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.machine}
                      fill
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/95 backdrop-blur text-ink-900 font-semibold">
                      {p.tier}
                    </span>
                    {p.highlighted && (
                      <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-gold-gradient text-ink-900 font-semibold shadow">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-xl text-ink-900">{p.name}</h3>
                        <div className="text-xs text-ink-500 mt-0.5">{p.machine}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-xl text-gold-700">{p.dailyRate}%</div>
                        <div className="text-[10px] uppercase tracking-wider text-ink-500">Daily</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-ink-600 mb-1.5">
                        <span>{meta.funded}% funded</span>
                        <span>{meta.investors.toLocaleString()} investors</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-cream-100 overflow-hidden">
                        <div className="h-full bg-gold-gradient" style={{ width: `${meta.funded}%` }} />
                      </div>
                    </div>

                    <dl className="mt-4 grid grid-cols-3 gap-2 text-center border-y border-cream-200 py-3">
                      <div>
                        <dt className="text-[10px] uppercase tracking-wider text-ink-500">Min</dt>
                        <dd className="text-sm font-semibold text-ink-900 mt-0.5">{formatCurrency(p.min)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-wider text-ink-500">Term</dt>
                        <dd className="text-sm font-semibold text-ink-900 mt-0.5">{p.durationDays}d</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-wider text-ink-500">Total</dt>
                        <dd className="text-sm font-semibold text-gold-700 mt-0.5">
                          {(p.dailyRate * p.durationDays).toFixed(0)}%
                        </dd>
                      </div>
                    </dl>

                    <Link
                      href="/register"
                      className={`mt-5 ${p.highlighted ? "btn btn-primary" : "btn btn-ghost"} w-full`}
                    >
                      Invest now
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Open an account",
      body: "Sign up with your email and phone in under two minutes. No paperwork, no waitlist.",
    },
    {
      n: "02",
      title: "Pick a machine",
      body: "Browse live opportunities — stakes starting from GH₵ 50, all the way up to industrial-class machines.",
    },
    {
      n: "03",
      title: "Fund via MoMo or bank",
      body: "Pay with MTN MoMo, Telecel Cash, or direct bank transfer. Settles in minutes.",
    },
    {
      n: "04",
      title: "Earn daily, exit at term",
      body: "Yield credits every 24 hours. Withdraw anytime. Principal returned at maturity.",
    },
  ];

  return (
    <section id="how" className="section-pad bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.22em] text-gold-600">How it works</span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight text-ink-900">
            From sign-up to daily yield in four steps.
          </h2>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="card p-6">
              <div className="font-serif text-3xl text-gold-gradient">{s.n}</div>
              <div className="mt-3 font-semibold text-ink-900">{s.title}</div>
              <p className="mt-2 text-sm text-ink-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyInvest() {
  const items = [
    {
      title: "Real Machinery Ownership",
      body: "Every plan funds a tangible piece of mining hardware. You own a share of the asset — not a token, not a derivative.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" />
        </svg>
      ),
    },
    {
      title: "Daily Cash Yield",
      body: "Returns credit to your balance every 24 hours. Withdraw to MTN, Telecel, or your bank — anytime, no lock-up on earnings.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M9 9.5c0-1.4 1.3-2 3-2s3 .8 3 2-1.5 1.8-3 2-3 .6-3 2 1.3 2 3 2 3-.6 3-2" />
        </svg>
      ),
    },
    {
      title: "Principal Returned at Term",
      body: "At the end of your plan, your full stake is released back to your wallet. Transparent ledger, no surprises.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 4v5h-5" />
        </svg>
      ),
    },
  ];

  return (
    <section id="why" className="section-pad bg-cream-50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.22em] text-gold-600">Why GoldGround</span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight text-ink-900">
            Built for patient capital, not gamblers.
          </h2>
          <p className="mt-4 text-ink-600">
            Mining-machinery investment, made transparent and accessible — democratising
            an asset class once reserved for institutional balance sheets.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {items.map((it) => (
            <div key={it.title} className="card p-6">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold-50 text-gold-700">
                {it.icon}
              </span>
              <h3 className="mt-4 font-serif text-xl text-ink-900">{it.title}</h3>
              <p className="mt-2 text-sm text-ink-600 leading-relaxed">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 text-cream-50 px-8 sm:px-14 py-14 sm:py-20">
          <div className="pointer-events-none absolute -top-20 -right-16 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
               style={{ background: "radial-gradient(circle at 30% 30%, #DDB94A, transparent 60%)" }} />
          <div className="pointer-events-none absolute -bottom-24 -left-16 w-[360px] h-[360px] rounded-full blur-3xl opacity-30"
               style={{ background: "radial-gradient(circle at 50% 50%, #C9A227, transparent 60%)" }} />

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.22em] text-gold-200">Join the movement</span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight">
                50,000+ investors earning passive income from mining machinery.
              </h2>
              <p className="mt-5 max-w-md text-cream-200">
                Two minutes to open an account. No paperwork, no salespeople — just a clean
                ledger and daily yield.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Link href="/register" className="btn btn-primary">Create free account</Link>
              <Link href="/login" className="btn"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#FAF6EA", border: "1px solid rgba(245,231,176,0.25)" }}>
                I already have one
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
