export default function About() {
  return (
    <section id="about" className="section-pad bg-cream-50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.22em] text-gold-600">About</span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink-900">
            Built by people who&apos;ve managed money for a living.
          </h2>
          <p className="mt-5 text-ink-600 leading-relaxed">
            GoldGround Capital was founded by a small team of portfolio managers,
            risk analysts, and engineers who got tired of opaque platforms that
            treat investors like product. We started over with three rules:
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "If we can&apos;t explain it in a paragraph, we won&apos;t offer it.",
              "If we wouldn&apos;t put our own families in it, you won&apos;t see it.",
              "Every cedi in, every cedi out — on a ledger you can read.",
            ].map((rule) => (
              <li key={rule} className="flex gap-3 text-ink-800">
                <span className="mt-1 w-2 h-2 rounded-full bg-gold-gradient shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: rule }} />
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          {/* Decorative layered ridges */}
          <div className="card p-8 rounded-3xl">
            <svg viewBox="0 0 400 280" className="w-full">
              <defs>
                <linearGradient id="ridge1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F0D773" />
                  <stop offset="100%" stopColor="#C9A227" />
                </linearGradient>
                <linearGradient id="ridge2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DDB94A" />
                  <stop offset="100%" stopColor="#8C6E17" />
                </linearGradient>
              </defs>
              <circle cx="320" cy="70" r="32" fill="url(#ridge1)" />
              <path d="M0 230 L80 130 L150 190 L220 110 L300 200 L400 130 L400 280 L0 280 Z" fill="url(#ridge1)" opacity="0.5" />
              <path d="M0 250 L60 180 L130 230 L200 160 L280 220 L360 180 L400 220 L400 280 L0 280 Z" fill="url(#ridge2)" />
              <rect x="0" y="265" width="400" height="3" fill="#8C6E17" opacity="0.5" />
            </svg>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-serif text-2xl text-ink-900">2018</div>
                <div className="text-xs uppercase tracking-wider text-ink-500 mt-1">Founded</div>
              </div>
              <div>
                <div className="font-serif text-2xl text-ink-900">42</div>
                <div className="text-xs uppercase tracking-wider text-ink-500 mt-1">Team</div>
              </div>
              <div>
                <div className="font-serif text-2xl text-ink-900">Zurich</div>
                <div className="text-xs uppercase tracking-wider text-ink-500 mt-1">Hq</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
