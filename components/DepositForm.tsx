"use client";

import { useState } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "submitted"; reference: string }
  | { kind: "error"; message: string };

export default function DepositForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [amount, setAmount] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ kind: "submitting" });
    try {
      const formData = new FormData();
      formData.set("amount", amount);
      if (screenshot) formData.set("screenshot", screenshot);
      const res = await fetch("/api/deposits", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) { setStatus({ kind: "error", message: json.error ?? "Request failed" }); return; }

      onSubmitted?.();
      setStatus({ kind: "submitted", reference: json.reference });
      setAmount("");
      setScreenshot(null);
      form.reset();
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Network error" });
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-ink-900">Pay by Telecel Cash</h3>
      <p className="text-sm text-ink-500 mt-0.5">Send your deposit, then submit the payment screenshot for review.</p>

      <div className="mt-4 rounded-xl border border-cream-200 bg-cream-50 p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-ink-500">Send payment to</div>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="font-mono text-xl font-semibold text-ink-900">0203601136</span>
          <span className="text-sm text-ink-700">Francis Ntamah</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-ink-800">Amount (GH₵)</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Minimum GH₵ 50"
            value={amount}
            min="50"
            step="0.01"
            onChange={(e) => setAmount(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-3 outline-none focus:border-gold-300 focus:ring-4 focus:ring-gold-100"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-ink-800">Payment screenshot</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
            className="mt-1.5 block w-full rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-[#1f3a8a]/10 file:px-3 file:py-2 file:font-medium file:text-[#1f3a8a]"
          />
          <span className="mt-1 block text-xs text-ink-500">JPG, PNG or WebP, up to 5 MB.</span>
        </label>

        <StatusBanner status={status} />

        <button
          type="submit"
          disabled={status.kind === "submitting"}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1f3a8a] hover:bg-[#2247bd] text-white font-semibold text-sm shadow disabled:opacity-60"
        >
          {status.kind === "submitting" ? "Submitting…" : "Submit payment for review"}
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
    <div role="status" className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
      Payment submitted for review. Reference: <code className="font-mono">{status.reference}</code>.
    </div>
  );
}
