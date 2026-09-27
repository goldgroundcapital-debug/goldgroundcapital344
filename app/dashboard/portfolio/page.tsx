"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const GHANAIAN_NAMES = [
  "Kwame Asante", "Akosua Mensah", "Kofi Boateng", "Adwoa Owusu",
  "Yaw Frimpong", "Ama Darko", "Kojo Sarpong", "Abena Acheampong",
  "Kwabena Antwi", "Akua Tetteh", "Kwadwo Appiah", "Yaa Quaye",
  "Joseph Bediako", "Ethan Annan", "Samuel Aidoo", "Daniel Nyame",
  "Emmanuel Addo", "Michael Agyei", "Naa Quaynor", "Esi Ofori",
  "Nana Boahen", "Kwesi Dapaah", "Maame Donkor", "Fiifi Bonsu",
  "Eric Adjei", "Grace Anane", "Linda Anokye", "Stephen Mensa",
  "Patrick Yeboah", "Vincent Kusi", "Comfort Sasu", "Mavis Opoku",
];

const ACTIONS = [
  { kind: "withdraw",  label: "withdrew profits",        tone: "pink",   dir: "up"   },
  { kind: "reinvest",  label: "reinvested dividends",    tone: "green",  dir: "down" },
  { kind: "deposit",   label: "made a deposit of",       tone: "blue",   dir: "down" },
  { kind: "yield",     label: "earned daily yield of",   tone: "gold",   dir: "spark"},
  { kind: "referral",  label: "claimed referral bonus",  tone: "purple", dir: "users"},
  { kind: "activate",  label: "activated a plan worth",  tone: "indigo", dir: "play" },
];

type Entry = {
  id: number;
  name: string;
  action: typeof ACTIONS[number];
  amount: number;
  at: number;
};

function randomAmount() {
  // Bias toward smaller amounts; occasional big ones.
  const r = Math.random();
  if (r < 0.55) return Math.round((50 + Math.random() * 950) / 10) * 10;       // 50–1000
  if (r < 0.9)  return Math.round((1000 + Math.random() * 9000) / 50) * 50;     // 1000–10k
  return Math.round((10000 + Math.random() * 40000) / 100) * 100;               // 10k–50k
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PortfolioPage() {
  const [feed, setFeed] = useState<Entry[]>([]);
  const [tick, setTick] = useState(0); // forces relative-time refresh

  useEffect(() => {
    let queue = shuffle(GHANAIAN_NAMES);
    let lastName = "";
    let id = 0;

    const makeEntry = (): Entry => {
      if (queue.length === 0) queue = shuffle(GHANAIAN_NAMES);
      let name = queue.pop()!;
      // avoid showing same name back-to-back across reshuffles
      if (name === lastName && queue.length > 0) {
        const swap = queue.pop()!;
        queue.unshift(name);
        name = swap;
      }
      lastName = name;
      return {
        id: id++,
        name,
        action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
        amount: randomAmount(),
        at: Date.now(),
      };
    };

    // Seed with three entries spaced in the past.
    setFeed([
      { ...makeEntry(), at: Date.now() - 5_000 },
      { ...makeEntry(), at: Date.now() - 35_000 },
      { ...makeEntry(), at: Date.now() - 2 * 60_000 },
    ]);

    const addInt = setInterval(() => {
      setFeed((prev) => [makeEntry(), ...prev].slice(0, 8));
    }, 4500);

    const tickInt = setInterval(() => setTick((t) => t + 1), 15_000);

    return () => { clearInterval(addInt); clearInterval(tickInt); };
  }, []);

  return (
    <div className="space-y-6">
      {/* Empty portfolio card */}
      <div className="card p-10 text-center">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EAF1FE] text-[#3257d0]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="7" height="7" rx="1.5" />
            <rect x="14" y="4" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </span>
        <h2 className="mt-5 font-serif text-2xl tracking-tight text-ink-900">Your portfolio is empty</h2>
        <p className="mt-2 text-sm text-ink-600 max-w-md mx-auto leading-relaxed">
          You haven&apos;t invested in any plans yet. Start your journey to passive income by exploring our
          highly-vetted, premium mining-machinery offerings.
        </p>
        <Link
          href="/dashboard/plans"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1f3a8a] hover:bg-[#2247bd] text-white font-semibold text-sm shadow"
        >
          <SearchIcon /> Browse Plans
        </Link>
      </div>

      {/* Live Network card */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-ink-900/10">
        <div className="bg-[#0F172A] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="font-semibold">Live Network</span>
          </div>
          <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-md border border-white/20 text-cream-100">
            Real-time
          </span>
        </div>

        <div className="bg-white divide-y divide-cream-100">
          {feed.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-ink-500">Loading network activity…</div>
          ) : (
            feed.map((e) => <FeedRow key={e.id} entry={e} _tick={tick} />)
          )}
        </div>
      </div>
    </div>
  );
}

function FeedRow({ entry, _tick }: { entry: Entry; _tick: number }) {
  void _tick; // re-render trigger only
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${toneClass(entry.action.tone)}`}>
        <DirIcon dir={entry.action.dir as DirKey} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-ink-800 truncate">
          <span className="font-semibold">{shortName(entry.name)}</span>{" "}
          {entry.action.label}{" "}
          <span className="font-semibold">GH₵ {entry.amount.toLocaleString()}</span>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-ink-400 mt-0.5">
          {timeAgo(entry.at)}
        </div>
      </div>
    </div>
  );
}

function shortName(full: string) {
  const [first, ...rest] = full.split(" ");
  const lastInitial = rest.length ? `${rest[rest.length - 1][0]}.` : "";
  return `${first} ${lastInitial}`.trim();
}

function timeAgo(at: number) {
  const diff = Math.floor((Date.now() - at) / 1000);
  if (diff < 5) return "Just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function toneClass(tone: string) {
  switch (tone) {
    case "pink":   return "bg-rose-100 text-rose-600";
    case "green":  return "bg-emerald-100 text-emerald-600";
    case "blue":   return "bg-sky-100 text-sky-600";
    case "gold":   return "bg-amber-100 text-amber-700";
    case "purple": return "bg-violet-100 text-violet-600";
    case "indigo": return "bg-indigo-100 text-indigo-600";
    default:       return "bg-cream-100 text-ink-600";
  }
}

type DirKey = "up" | "down" | "spark" | "users" | "play";

function DirIcon({ dir }: { dir: DirKey }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (dir === "up")     return <svg {...common}><path d="M7 17 17 7M9 7h8v8" /></svg>;
  if (dir === "down")   return <svg {...common}><path d="M17 7 7 17M15 17H7V9" /></svg>;
  if (dir === "spark")  return <svg {...common}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2" /></svg>;
  if (dir === "users")  return <svg {...common}><circle cx="9" cy="9" r="3" /><circle cx="17" cy="10" r="2.4" /><path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 19c0-2 2-3.5 4-3.5s2 1 2 1" /></svg>;
  return                 <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M10 9l5 3-5 3z" fill="currentColor" /></svg>;
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
