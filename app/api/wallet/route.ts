import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: wallet, error } = await supabase
    .from("wallets")
    .select("balance, locked, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    balance: Number(wallet?.balance ?? 0),
    locked: Number(wallet?.locked ?? 0),
    updated_at: wallet?.updated_at ?? null,
  });
}
