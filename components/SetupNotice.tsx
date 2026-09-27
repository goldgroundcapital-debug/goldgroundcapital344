export default function SetupNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 p-5">
      <div className="font-semibold">Supabase isn&apos;t configured yet</div>
      <p className="mt-1 text-sm leading-relaxed">
        Create a file named <code className="px-1 py-0.5 rounded bg-amber-100">.env.local</code> in the project root with:
      </p>
      <pre className="mt-3 text-xs bg-white border border-amber-200 rounded-lg p-3 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}
      </pre>
      <p className="mt-3 text-sm">
        Get both values from your Supabase dashboard → <em>Project Settings → API</em>, then restart{" "}
        <code className="px-1 py-0.5 rounded bg-amber-100">npm run dev</code>.
      </p>
    </div>
  );
}
