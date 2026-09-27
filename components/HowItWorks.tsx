const STEPS = [
  {
    n: "01",
    title: "Open an account",
    body: "Register in under two minutes. Verify your email and you&apos;re in.",
  },
  {
    n: "02",
    title: "Fund your wallet",
    body: "Deposit in major stablecoins or supported crypto. Most credits clear in minutes.",
  },
  {
    n: "03",
    title: "Choose a plan",
    body: "Pick the tier that suits your horizon — from Foothill to Citadel.",
  },
  {
    n: "04",
    title: "Watch it work",
    body: "Yields land daily. Withdraw on demand, reinvest with one click.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section-pad bg-cream-50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.22em] text-gold-600">How it works</span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink-900">
            Four steps. Then it&apos;s on autopilot.
          </h2>
        </div>

        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative card p-6">
              <div className="font-serif text-4xl text-gold-gradient leading-none">{s.n}</div>
              <h3 className="mt-4 font-semibold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.body }} />
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-cream-200" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
