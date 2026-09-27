"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import Field from "@/components/Field";
import SetupNotice from "@/components/SetupNotice";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        setAuthError("This reset link is invalid or has expired. Request a new one.");
      } else {
        setReady(true);
      }
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");

    setBusy(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1200);
  };

  if (!isSupabaseConfigured()) {
    return (
      <AuthShell
        title="Choose a new password"
        subtitle="Set a strong password to finish."
        altText="Back to"
        altHref="/login"
        altCta="Sign in"
      >
        <SetupNotice />
      </AuthShell>
    );
  }

  if (authError) {
    return (
      <AuthShell
        title="Link expired"
        subtitle="Reset links work once and for a limited time."
        altText="Need another?"
        altHref="/forgot-password"
        altCta="Request again"
      >
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {authError}
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Set a strong password to finish."
      altText="Back to"
      altHref="/login"
      altCta="Sign in"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="New password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          disabled={!ready}
        />
        <Field
          label="Confirm new password"
          name="confirm"
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          disabled={!ready}
        />

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
        {done && (
          <div className="text-sm text-gold-700 bg-gold-50 border border-gold-100 rounded-xl px-3 py-2">
            Password updated. Taking you to your dashboard…
          </div>
        )}

        <button type="submit" disabled={busy || !ready} className="btn btn-primary w-full disabled:opacity-60">
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
