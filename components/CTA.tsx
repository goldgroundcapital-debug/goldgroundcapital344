import Link from "next/link";

export default function CTA() {
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
              <span className="text-xs uppercase tracking-[0.22em] text-gold-200">Open an account</span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight">
                Start with GH₵ 500.<br />Grow it on solid ground.
              </h2>
              <p className="mt-5 max-w-md text-cream-200">
                Two minutes to register. No paperwork, no salespeople — just a clean
                ledger and daily yield.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Link href="/register" className="btn btn-primary">Create my account</Link>
              <Link
                href="/login"
                className="btn"
                style={{ background: "rgba(255,255,255,0.06)", color: "#FAF6EA", border: "1px solid rgba(245,231,176,0.25)" }}
              >
                I already have one
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
