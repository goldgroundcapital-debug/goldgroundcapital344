"use client";

import { useState } from "react";
import AuthShell from "@/components/AuthShell";
import Field from "@/components/Field";
import SetupNotice from "@/components/SetupNotice";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) return setError("Enter the email on your account.");

    setBusy(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setBusy(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  if (!isSupabaseConfigured()) {
    return (
      <AuthShell
        title="Reset password"
        subtitle="We'll email you a secure link."
        altText="Back to"
        altHref="/login"
        altCta="Sign in"
      >
        <SetupNotice />
      </AuthShell>
    );
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="The link works for 60 minutes."
        altText="Wrong address?"
        altHref="/forgot-password"
        altCta="Try again"
      >
        <div className="rounded-2xl bg-[#FFF3EC] border border-[#FFD8C0] p-4 text-sm text-ink-800 leading-relaxed">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
          Open it on this device to choose a new password.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter the email on your account and we'll send you a link."
      altText="Remembered it?"
      altHref="/login"
      altCta="Sign in"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Email address"
          name="email"
          type="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
          {busy ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
