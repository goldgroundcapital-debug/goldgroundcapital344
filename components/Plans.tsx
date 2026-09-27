import Link from "next/link";
import Image from "next/image";
import { PLANS, formatCurrency } from "@/lib/plans";

export default function Plans() {
  return (
    <section id="plans" className="section-pad bg-cream-50">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.22em] text-gold-600">Machine-backed plans</span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink-900">
            Pick a machine. Earn from the ground it moves.
          </h2>
          <p className="mt-4 text-ink-600">
            Every plan funds a real piece of mining hardware — from conveyor sections to
            bucket-wheel excavators. Returns are paid daily; principal is released at the
            end of the term.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`card ${p.highlighted ? "ring-gold" : ""} overflow-hidden flex flex-col`}
            >
              <div className="relative h-44 bg-cream-100">
                <Image
                  src={p.image}
                  alt={p.machine}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                {p.highlighted && (
                  <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-gradient text-ink-900 font-semibold shadow">
                    Popular
                  </span>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-gold-600">{p.tier}</span>
                  <span className="text-xs text-ink-500">{p.machine}</span>
                </div>
                <h3 className="mt-2 font-serif text-2xl text-ink-900">{p.name}</h3>
                <p className="mt-2 text-sm text-ink-600">{p.summary}</p>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center border-y border-cream-200 py-4">
                  <div>
                    <div className="text-xs text-ink-500">Min</div>
                    <div className="mt-0.5 text-sm font-semibold text-ink-900">{formatCurrency(p.min)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-500">Daily</div>
                    <div className="mt-0.5 text-sm font-semibold text-gold-700">{p.dailyRate}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-500">Term</div>
                    <div className="mt-0.5 text-sm font-semibold text-ink-900">{p.durationDays}d</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-ink-500">
                  Range {formatCurrency(p.min)} – {formatCurrency(p.max)} · total yield{" "}
                  <span className="text-ink-700 font-medium">
                    {(p.dailyRate * p.durationDays).toFixed(0)}%
                  </span>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-ink-700 flex-1">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex gap-2">
                      <Check />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`mt-6 ${p.highlighted ? "btn btn-primary" : "btn btn-ghost"} w-full`}
                >
                  Invest in {p.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0">
      <circle cx="8" cy="8" r="8" fill="#FBF4DC" />
      <path
        d="M4.5 8.2 L7 10.5 L11.5 5.8"
        fill="none"
        stroke="#B08C1E"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
