import Link from "next/link";
import Image from "next/image";
import { PLANS, formatCurrency } from "@/lib/plans";

type Meta = { funded: number; investors: number; location: string };

const META: Record<string, Meta> = {
  drill:              { funded:  50, investors:  618, location: "Tarkwa, Ghana" },
  grader:             { funded:  89, investors:  942, location: "Obuasi, Ghana" },
  bulldozer:          { funded:  78, investors:  718, location: "Damang, Ghana" },
  "wheel-loader":     { funded:  64, investors:  519, location: "Bibiani, Ghana" },
  "articulated-truck":{ funded:  52, investors:  343, location: "Iduapriem, Ghana" },
  "haul-truck":       { funded:  41, investors:  226, location: "Chirano, Ghana" },
  excavator:          { funded:  28, investors:  142, location: "Ahafo, Ghana" },
  "ore-hauler":       { funded:  16, investors:   67, location: "Wassa, Ghana" },
};

function expectedReturn(min: number, dailyRate: number, days: number) {
  return min + (min * dailyRate * days) / 100;
}

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ink-600">
          Pick a machine. The expected return is your principal plus the daily yield over the full term.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLANS.map((p) => {
          const meta = META[p.id] ?? { funded: 50, investors: 100, location: "Ghana" };
          const total = expectedReturn(p.min, p.dailyRate, p.durationDays);
          const fullyFunded = meta.funded >= 100;
          return (
            <article key={p.id} className="card overflow-hidden flex flex-col">
              <div className="relative h-36 bg-cream-100">
                <Image
                  src={p.image}
                  alt={p.machine}
                  fill
                  sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/95 backdrop-blur text-ink-900 font-semibold">
                  {p.tier}
                </span>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-ink-900 truncate">{p.machine}</h3>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                  <PinIcon />
                  <span className="truncate">{meta.location}</span>
                </div>

                <div className="mt-4 rounded-xl bg-cream-50 border border-cream-200 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${fullyFunded ? "text-rose-600" : "text-ink-900"}`}>
                      {meta.funded}% Funded
                    </span>
                    <span className="text-ink-500">{meta.investors.toLocaleString()} Investors</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-white overflow-hidden">
                    <div
                      className={`h-full ${fullyFunded ? "bg-rose-500" : "bg-[#1f3a8a]"}`}
                      style={{ width: `${meta.funded}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 pb-4 border-b border-cream-200">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-500">Expected Return</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <UpIcon />
                      <span className="font-semibold text-emerald-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-500">Cost To Invest</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <CoinsIcon />
                      <span className="font-semibold text-ink-900">{formatCurrency(p.min)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 mt-auto">
                  {fullyFunded ? (
                    <button
                      disabled
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-ink-500 text-sm font-medium cursor-not-allowed"
                    >
                      Fully Funded <LockIcon />
                    </button>
                  ) : (
                    <Link
                      href={`/dashboard/plans/${p.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#1f3a8a]/30 text-[#1f3a8a] text-sm font-semibold hover:bg-[#1f3a8a]/5 transition"
                    >
                      Invest Now <span aria-hidden>→</span>
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
function UpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}
function CoinsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f3a8a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="8" cy="9" rx="5" ry="2.2" />
      <path d="M3 9v4c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2V9" />
      <ellipse cx="16" cy="15" rx="5" ry="2.2" />
      <path d="M11 15v4c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2v-4" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}
