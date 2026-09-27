const QUOTES = [
  {
    name: "Marielle K.",
    role: "Member since 2022",
    body: "What I appreciate most is how unflashy it is. No hype, no fake countdowns. Yields land daily; statements arrive monthly.",
  },
  {
    name: "Dapo O.",
    role: "Ridgeline plan",
    body: "I moved from a much larger platform after one too many delayed withdrawals. Hasn&apos;t happened once here in fourteen months.",
  },
  {
    name: "Saskia V.",
    role: "Summit plan",
    body: "My account manager actually calls me back. That alone is worth the move.",
  },
];

export default function Testimonials() {
  return (
    <section className="section-pad bg-white border-y border-cream-200">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.22em] text-gold-600">Members</span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink-900">
            Steady words from steady hands.
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {QUOTES.map((q) => (
            <figure key={q.name} className="card p-6 flex flex-col">
              <svg width="28" height="28" viewBox="0 0 28 28" className="text-gold-400 opacity-70">
                <path d="M4 18c0-5 3-9 8-10v3c-3 1-5 3-5 7h5v8H4v-8zm12 0c0-5 3-9 8-10v3c-3 1-5 3-5 7h5v8h-8v-8z" fill="currentColor" />
              </svg>
              <blockquote
                className="mt-3 text-ink-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: q.body }}
              />
              <figcaption className="mt-5 pt-4 border-t border-cream-200">
                <div className="font-semibold text-ink-900">{q.name}</div>
                <div className="text-xs uppercase tracking-wider text-ink-500 mt-0.5">{q.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
