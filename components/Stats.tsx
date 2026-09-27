const ITEMS = [
  { k: "8 yrs", v: "Operating history" },
  { k: "62", v: "Countries served" },
  { k: "GH₵ 18.2B", v: "Lifetime payouts" },
  { k: "A+", v: "Custody attestation" },
];

export default function Stats() {
  return (
    <section className="bg-white border-y border-cream-200">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {ITEMS.map((s) => (
          <div key={s.v} className="text-center md:text-left">
            <div className="font-serif text-3xl text-ink-900">{s.k}</div>
            <div className="text-xs uppercase tracking-wider text-ink-500 mt-1">{s.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
