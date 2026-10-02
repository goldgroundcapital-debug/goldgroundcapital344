"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  next?: string;
  label?: string;
};

export default function GoogleButton({ next = "/dashboard", label = "Continue with Google" }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", process.env.NEXT_PUBLIC_SITE_URL || window.location.origin);
    callbackUrl.searchParams.set("next", next);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
    if (oauthError) {
      setBusy(false);
      setError(oauthError.message);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-cream-200 bg-white px-4 py-3 text-sm font-medium text-ink-800 hover:border-cream-300 disabled:opacity-60 transition"
      >
        <GoogleMark />
        {busy ? "Redirecting…" : label}
      </button>
      {error && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C40 35.6 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
