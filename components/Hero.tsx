import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-grain">
      {/* Decorative gold blobs */}
      <div className="pointer-events-none absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full blur-3xl opacity-50"
           style={{ background: "radial-gradient(circle at 30% 30%, #F0D773, transparent 60%)" }} />
      <div className="pointer-events-none absolute -bottom-40 -left-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
           style={{ background: "radial-gradient(circle at 50% 50%, #EAD075, transparent 60%)" }} />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-16 md:pt-24 pb-20 md:pb-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-cream-200 text-xs tracking-wider uppercase text-ink-600 shadow-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              New cycle now open
            </span>

            <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink-900">
              Build wealth on
              <br />
              <span className="text-gold-gradient">solid ground.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-ink-600 leading-relaxed">
              GoldGround Capital is a digital asset platform for patient investors.
              Choose a plan, track your returns daily, and grow your network through
              a transparent referral programme.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/register" className="btn btn-primary">
                Open an account
                <span aria-hidden>→</span>
              </Link>
              <a href="#plans" className="btn btn-ghost">
                Explore plans
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { k: "GH₵ 1.5B+", v: "Assets under stewardship" },
                { k: "38,000", v: "Active members" },
                { k: "99.98%", v: "Payout uptime" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="text-2xl font-serif font-semibold text-ink-900">{s.k}</dt>
                  <dd className="text-xs uppercase tracking-wider text-ink-500 mt-1">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Floating card mock */}
          <div className="lg:col-span-5">
            <div className="relative max-w-md mx-auto">
              <div className="card ring-gold rounded-3xl p-6 animate-floatY">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-ink-500">Portfolio value</div>
                    <div className="mt-1 text-3xl font-serif font-semibold">GH₵ 626,761.20</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-gold-50 text-gold-700 border border-gold-100">+12.4%</div>
                </div>

                {/* Sparkline */}
                <svg viewBox="0 0 320 90" className="mt-5 w-full h-24">
                  <defs>
                    <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DDB94A" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#DDB94A" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 70 L30 60 L60 64 L95 48 L130 52 L165 36 L200 42 L235 26 L270 30 L320 14"
                    fill="none"
                    stroke="#C9A227"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M0 70 L30 60 L60 64 L95 48 L130 52 L165 36 L200 42 L235 26 L270 30 L320 14 L320 90 L0 90 Z"
                    fill="url(#sparkFill)"
                  />
                </svg>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    { l: "Daily", v: "+0.84%" },
                    { l: "Weekly", v: "+4.12%" },
                    { l: "Monthly", v: "+18.6%" },
                  ].map((m) => (
                    <div key={m.l} className="rounded-xl bg-cream-50 border border-cream-200 py-3">
                      <div className="text-[10px] uppercase tracking-wider text-ink-500">{m.l}</div>
                      <div className="text-sm font-semibold text-ink-900 mt-0.5">{m.v}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button className="flex-1 btn btn-primary">Deposit</button>
                  <button className="flex-1 btn btn-ghost">Withdraw</button>
                </div>
              </div>

              {/* Floating tag */}
              <div className="absolute -left-6 -bottom-6 card px-4 py-3 flex items-center gap-3 shadow-gold">
                <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-white text-sm font-semibold">G</div>
                <div>
                  <div className="text-xs text-ink-500">Just credited</div>
                  <div className="text-sm font-semibold">+GH₵ 2,782.91 daily yield</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
