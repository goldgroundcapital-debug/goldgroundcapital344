const ITEMS = [
  {
    title: "Daily, on the dot.",
    body: "Yields are credited to your account every 24 hours — no batching, no surprises.",
    icon: (
      <path d="M4 12 L10 18 L20 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Audited custody.",
    body: "Funds are held in segregated custody with quarterly third-party attestation.",
    icon: (
      <path d="M12 3 L20 7 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V7 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    ),
  },
  {
    title: "Referral that compounds.",
    body: "Earn up to 10% on partner deposits across three tiers. Paid the same day.",
    icon: (
      <path d="M5 17 L9 13 L13 15 L19 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Withdraw on your terms.",
    body: "Cash out matured principal and accrued yield to your wallet in minutes.",
    icon: (
      <path d="M5 12 H19 M13 6 L19 12 L13 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: "Plain-language reports.",
    body: "Monthly statements written for humans — not auditors. Always one click away.",
    icon: (
      <path d="M6 4 H16 L20 8 V20 H6 Z M14 4 V8 H20 M8 13 H16 M8 17 H14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    ),
  },
  {
    title: "Disciplined risk.",
    body: "Position sizing, drawdown caps, and weekly committee reviews keep us honest.",
    icon: (
      <path d="M4 18 L10 10 L14 14 L20 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

export default function Features() {
  return (
    <section id="how" className="section-pad bg-white border-y border-cream-200">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <span className="text-xs uppercase tracking-[0.22em] text-gold-600">Why GoldGround</span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink-900">
              Disciplined returns, told plainly.
            </h2>
            <p className="mt-5 text-ink-600 max-w-md">
              We don&apos;t promise the moon. We promise transparency, daily payouts,
              and a team that treats your capital the way it would treat its own.
            </p>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {ITEMS.map((it) => (
              <div key={it.title} className="card p-5">
                <div className="w-10 h-10 rounded-xl bg-cream-100 text-gold-600 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24">{it.icon}</svg>
                </div>
                <h3 className="mt-4 font-serif text-lg text-ink-900">{it.title}</h3>
                <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
