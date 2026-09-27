import Link from "next/link";
import Logo from "./Logo";

const COLS = [
  {
    title: "Platform",
    links: [
      { href: "#how", label: "How it works" },
      { href: "#opportunities", label: "Browse plans" },
      { href: "/dashboard", label: "Portfolio" },
      { href: "/register", label: "Start earning" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "#", label: "Investment basics" },
      { href: "#", label: "Mining glossary" },
      { href: "#", label: "Tax info" },
      { href: "#", label: "Help center" },
    ],
  },
  {
    title: "Contact",
    links: [
      { href: "#", label: "Ridge, Accra, Ghana" },
      { href: "tel:+233301234567", label: "+233 30 123 4567" },
      { href: "mailto:invest@goldgroundcapital.com", label: "invest@goldgroundcapital.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#", label: "Privacy policy" },
      { href: "#", label: "Terms of service" },
      { href: "#", label: "Risk disclosure" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-cream-50 border-t border-cream-200">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Logo size={40} />
            <p className="mt-5 max-w-sm text-sm text-ink-600 leading-relaxed">
              GoldGround Capital — democratising mining-machinery investment.
              Real hardware, daily yield, transparent ledger.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {["X", "in", "tg", "ig"].map((s) => (
                <a key={s} href="#" aria-label={s}
                   className="w-9 h-9 rounded-full border border-cream-200 bg-white flex items-center justify-center text-ink-500 hover:text-gold-600 hover:border-gold-200 transition">
                  <span className="text-xs font-semibold">{s}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {COLS.map((col) => (
              <div key={col.title}>
                <div className="text-xs uppercase tracking-[0.22em] text-gold-600">{col.title}</div>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-ink-700 hover:text-ink-900">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-ink-500">
          <div>© {new Date().getFullYear()} GoldGround Capital. All rights reserved.</div>
          <div>Mining-machinery investments carry risk of loss. Past returns do not guarantee future results.</div>
        </div>
      </div>
    </footer>
  );
}
