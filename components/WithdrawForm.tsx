"use client";

import { useState } from "react";

type MethodId = "mtn" | "telecel" | "bank";

const FEE_RATE = 0.015;

const METHODS: { id: MethodId; label: string; min: number }[] = [
  { id: "mtn",     label: "MTN Mobile Money", min: 100 },
  { id: "telecel", label: "Telecel Cash",     min: 100 },
  { id: "bank",    label: "Bank Transfer",    min: 500 },
];

const GHANA_BANKS = [
  "Absa Bank Ghana", "Access Bank Ghana", "Agricultural Development Bank (ADB)",
  "ARB Apex Bank", "Bank of Africa Ghana", "CalBank",
  "Consolidated Bank Ghana (CBG)", "Ecobank Ghana", "FBNBank Ghana",
  "Fidelity Bank Ghana", "First Atlantic Bank", "First National Bank Ghana",
  "GCB Bank", "GTBank Ghana", "National Investment Bank (NIB)",
  "OmniBSIC Bank", "Prudential Bank", "Republic Bank Ghana",
  "Société Générale Ghana", "Stanbic Bank Ghana", "Standard Chartered Bank Ghana",
  "United Bank for Africa (UBA) Ghana", "Universal Merchant Bank (UMB)", "Zenith Bank Ghana",
];

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "queued"; reference: string; net: number; fee: number; processor: boolean }
  | { kind: "error"; message: string };

export default function WithdrawForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [methodId, setMethodId] = useState<MethodId>("mtn");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const method = METHODS.find((m) => m.id === methodId)!;
  const amountNum = Number(amount) || 0;
  const fee = Math.round(amountNum * FEE_RATE * 100) / 100;
  const net = Math.round((amountNum - fee) * 100) / 100;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          method: methodId,
          phone: phone || undefined,
          bank: bank || undefined,
          accountNumber: accountNumber || undefined,
          accountName: accountName || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setStatus({ kind: "error", message: json.error ?? "Request failed" }); return; }
      onSubmitted?.();
      setStatus({
        kind: "queued",
        reference: json.reference,
        net: Number(json.net),
        fee: Number(json.fee),
        processor: json.processorConfigured !== false,
      });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Network error" });
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-ink-900">Select Payout Method</h3>
      <p className="text-sm text-ink-500 mt-0.5">Cash out to MoMo or your bank. 1.5% fee applies.</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {METHODS.map((m) => {
          const active = m.id === methodId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethodId(m.id)}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition ${
                active
                  ? "border-[#1f3a8a] bg-[#1f3a8a]/5 text-[#1f3a8a]"
                  : "border-cream-200 bg-white text-ink-700 hover:border-cream-300"
              }`}
            >
              <MethodIcon id={m.id} active={active} />
              <span className="text-xs font-semibold text-center px-1">{m.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-ink-800">Amount (GH₵)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder={`Minimum GH₵ ${method.min}`}
            value={amount}
            min={method.min}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-3 outline-none focus:border-gold-300 focus:ring-4 focus:ring-gold-100"
          />
        </label>

        {(methodId === "mtn" || methodId === "telecel") && (
          <>
            <label className="block">
              <span className="block text-sm font-medium text-ink-800">
                {methodId === "mtn" ? "MTN MoMo number" : "Telecel Cash number"}
              </span>
              <input
                type="tel"
                inputMode="tel"
                placeholder="e.g. 024 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-3 outline-none focus:border-gold-300 focus:ring-4 focus:ring-gold-100"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink-800">Account name</span>
              <input
                type="text"
                placeholder="Name registered on the wallet"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-3 outline-none focus:border-gold-300 focus:ring-4 focus:ring-gold-100"
              />
            </label>
          </>
        )}

        {methodId === "bank" && (
          <>
            <label className="block">
              <span className="block text-sm font-medium text-ink-800">Bank</span>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-3 outline-none focus:border-gold-300 focus:ring-4 focus:ring-gold-100"
              >
                <option value="" disabled>Select your bank</option>
                {GHANA_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink-800">Account number</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="13-digit account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-gold-300 focus:ring-4 focus:ring-gold-100"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink-800">Account name</span>
              <input
                type="text"
                placeholder="As it appears on your bank statement"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-3 outline-none focus:border-gold-300 focus:ring-4 focus:ring-gold-100"
              />
            </label>
          </>
        )}

        {amountNum > 0 && (
          <div className="rounded-xl bg-cream-50 border border-cream-200 p-3 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-ink-500">Gross</span>
              <span className="text-ink-900">GH₵ {amountNum.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Fee (1.5%)</span>
              <span className="text-ink-900">− GH₵ {fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-cream-200">
              <span className="text-ink-700 font-medium">You&apos;ll receive</span>
              <span className="font-serif text-base text-gold-700">GH₵ {net.toFixed(2)}</span>
            </div>
          </div>
        )}

        <StatusBanner status={status} />

        <button
          type="submit"
          disabled={status.kind === "submitting" || amountNum < method.min}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1f3a8a] hover:bg-[#2247bd] text-white font-semibold text-sm shadow disabled:opacity-60"
        >
          {status.kind === "submitting" ? "Submitting…" : "Request withdrawal"}
        </button>
      </form>
    </div>
  );
}

function StatusBanner({ status }: { status: Status }) {
  if (status.kind === "idle" || status.kind === "submitting") return null;
  if (status.kind === "error") {
    return (
      <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
        {status.message}
      </div>
    );
  }
  return (
    <div className="text-sm text-ink-700 bg-gold-50 border border-gold-200 rounded-xl px-3 py-2">
      <div className="font-medium text-ink-900">
        Queued — GH₵ {status.net.toFixed(2)} to be paid out (fee GH₵ {status.fee.toFixed(2)}).
      </div>
      <div className="mt-1 text-xs">
        Reference: <code className="font-mono">{status.reference}</code>
        {!status.processor && " · Hubtel not connected — manual payout."}
      </div>
    </div>
  );
}

function MethodIcon({ id, active }: { id: MethodId; active: boolean }) {
  const color = active ? "#1f3a8a" : "#6b7280";
  if (id === "mtn") {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#FFCC00] text-[#1A140A] font-bold text-[10px]">
        MTN
      </span>
    );
  }
  if (id === "telecel") {
    return (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#E60000] text-white font-bold text-[10px]">
        TLC
      </span>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 10h18M5 10V21M19 10V21M9 10V21M15 10V21M12 3 3 8h18z" />
    </svg>
  );
}
