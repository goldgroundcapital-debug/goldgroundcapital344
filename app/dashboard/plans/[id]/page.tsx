"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { PLANS, formatCurrency } from "@/lib/plans";

export default function PlanDetailPage() {
  const params = useParams<{ id: string }>();
  const plan = PLANS.find((p) => p.id === params.id);
  if (!plan) notFound();

  const [amount, setAmount] = useState(plan.min);

  const dailyYield = (amount * plan.dailyRate) / 100;
  const totalYield = dailyYield * plan.durationDays;
  const maturity = amount + totalYield;

  const quickAmounts = Array.from(
    new Set([
      plan.min,
      Math.round((plan.min + plan.max) / 4),
      Math.round((plan.min + plan.max) / 2),
      plan.max,
    ]),
  );

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/plans"
        className="inline-flex items-center gap-1 text-xs text-ink-600 hover:text-ink-900"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        All plans
      </Link>

      <div className="card overflow-hidden">
        <div className="relative h-40 bg-cream-100">
          <Image src={plan.image} alt={plan.machine} fill sizes="100vw" className="object-cover" priority />
        </div>
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-gold-600">{plan.tier}</div>
          <h1 className="font-serif text-xl text-ink-900 mt-0.5">{plan.name}</h1>
          <div className="text-[11px] text-ink-500">{plan.machine}</div>
          <div className="mt-2 font-serif text-lg text-ink-900">
            {plan.dailyRate}% daily for {plan.durationDays} days
          </div>
          <p className="mt-2 text-xs text-ink-600 leading-relaxed">{plan.summary}</p>
        </div>
      </div>

      <div className="card p-4">
        <label className="block">
          <span className="block text-xs font-medium text-ink-800">Amount to invest (GH₵)</span>
          <input
            type="number"
            min={plan.min}
            max={plan.max}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gold-300 focus:ring-4 focus:ring-gold-100"
          />
          <span className="mt-1.5 block text-[10px] text-ink-500">
            Min {formatCurrency(plan.min)} · Max {formatCurrency(plan.max)}
          </span>
        </label>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {quickAmounts.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(v)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-cream-200 bg-white hover:border-gold-200"
            >
              {formatCurrency(v)}
            </button>
          ))}
        </div>

        <Link
          href={`/dashboard/deposit?plan=${plan.id}&amount=${amount}`}
          className="btn btn-primary w-full mt-4 text-sm py-2.5 inline-flex items-center justify-center"
        >
          Activate {plan.name}
        </Link>
      </div>

      <div className="card p-4 bg-cream-50">
        <div className="text-[10px] uppercase tracking-wider text-ink-500">Projection</div>
        <dl className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-ink-600">Daily yield</dt>
            <dd className="font-semibold text-ink-900 truncate">{formatCurrency(dailyYield)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-ink-600">Total yield ({plan.durationDays}d)</dt>
            <dd className="font-semibold text-ink-900 truncate">{formatCurrency(totalYield)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-ink-600">Principal returned</dt>
            <dd className="font-semibold text-ink-900 truncate">{formatCurrency(amount)}</dd>
          </div>
          <div className="flex justify-between gap-2 pt-2 border-t border-cream-200">
            <dt className="text-ink-800 font-medium">Total at maturity</dt>
            <dd className="font-serif text-base text-gold-700 truncate">{formatCurrency(maturity)}</dd>
          </div>
        </dl>

        <ul className="mt-4 space-y-1.5 text-xs text-ink-700">
          {plan.perks.map((perk) => (
            <li key={perk} className="flex gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold-gradient shrink-0" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
