"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/Field";
import SetupNotice from "@/components/SetupNotice";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();

  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle();

      setProfile({
        name: data?.full_name ?? "",
        email: user.email ?? "",
        phone: data?.phone ?? "",
      });
      setLoading(false);
    })();
  }, [configured]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You're not signed in.");
      setSaving(false);
      return;
    }

    const { error: upError } = await supabase
      .from("profiles")
      .update({ full_name: profile.name, phone: profile.phone })
      .eq("id", user.id);

    setSaving(false);
    if (upError) {
      setError(upError.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const onSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!configured) {
    return (
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-ink-900">Settings</h1>
          <p className="text-ink-600 text-sm mt-1">Manage your profile and security preferences.</p>
        </div>
        <SetupNotice />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-ink-900">Settings</h1>
        <p className="text-ink-600 text-sm mt-1">Manage your profile and security preferences.</p>
      </div>

      <form onSubmit={onSave} className="card p-6 space-y-4">
        <div className="text-xs uppercase tracking-wider text-gold-600">Profile</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" name="name" value={profile.name} onChange={onChange} disabled={loading} />
          <Field label="Email" name="email" type="email" value={profile.email} disabled hint="Email changes require re-verification." />
        </div>
        <Field label="Phone (MoMo / Telecel)" name="phone" type="tel" value={profile.phone} onChange={onChange} disabled={loading} />

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>
        )}
        {saved && (
          <div className="text-sm text-gold-700 bg-gold-50 border border-gold-100 rounded-xl px-3 py-2">
            Profile updated.
          </div>
        )}

        <button type="submit" disabled={saving || loading} className="btn btn-primary disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <div className="card p-6 space-y-4">
        <div className="text-xs uppercase tracking-wider text-gold-600">Security</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Current password" name="current" type="password" placeholder="••••••••" />
          <Field label="New password" name="new" type="password" placeholder="••••••••" />
        </div>
        <button className="btn btn-ghost" type="button">Change password</button>

        <div className="pt-4 border-t border-cream-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-ink-900">Two-factor authentication</div>
              <div className="text-sm text-ink-600">Add a one-time code from your authenticator app on sign-in.</div>
            </div>
            <button className="btn btn-ghost" type="button">Enable</button>
          </div>
        </div>

        <div className="pt-4 border-t border-cream-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-ink-900">Sign out</div>
              <div className="text-sm text-ink-600">End your session on this device.</div>
            </div>
            <button onClick={onSignOut} className="btn btn-ghost" type="button">Sign out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
