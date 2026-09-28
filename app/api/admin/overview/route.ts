import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";

const PAGE_SIZE = 25;

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Server admin client is not configured." }, { status: 503 });
  }

  const pageParam = Number(new URL(request.url).searchParams.get("page") ?? 1);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const admin = createAdminClient();

  const [authResult, profilesResult, transactionCountResult, pendingResult, recentResult] =
    await Promise.all([
      admin.auth.admin.listUsers({ page, perPage: PAGE_SIZE }),
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("transactions").select("id", { count: "exact", head: true }),
      admin.from("transactions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      admin
        .from("transactions")
        .select("id, user_id, kind, amount, status, reference, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  if (authResult.error) return NextResponse.json({ error: authResult.error.message }, { status: 500 });
  const overviewError = profilesResult.error ?? transactionCountResult.error ?? pendingResult.error ?? recentResult.error;
  if (overviewError) return NextResponse.json({ error: overviewError.message }, { status: 500 });

  const authUsers = authResult.data.users;
  const userIds = authUsers.map((entry) => entry.id);
  const [profileResult, walletResult] = userIds.length
    ? await Promise.all([
        admin.from("profiles").select("id, full_name, phone").in("id", userIds),
        admin.from("wallets").select("user_id, balance, locked").in("user_id", userIds),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];

  const directoryError = profileResult.error ?? walletResult.error;
  if (directoryError) return NextResponse.json({ error: directoryError.message }, { status: 500 });

  const profiles = new Map((profileResult.data ?? []).map((profile) => [profile.id, profile]));
  const wallets = new Map((walletResult.data ?? []).map((wallet) => [wallet.user_id, wallet]));
  const users = authUsers.map((entry) => {
    const profile = profiles.get(entry.id);
    const wallet = wallets.get(entry.id);
    return {
      id: entry.id,
      email: entry.email ?? "",
      name: profile?.full_name ?? entry.user_metadata?.full_name ?? "",
      phone: profile?.phone ?? "",
      balance: Number(wallet?.balance ?? 0),
      locked: Number(wallet?.locked ?? 0),
      created_at: entry.created_at,
    };
  });

  return NextResponse.json({
    page,
    pageSize: PAGE_SIZE,
    totalUsers: profilesResult.count ?? 0,
    totalTransactions: transactionCountResult.count ?? 0,
    pendingTransactions: pendingResult.count ?? 0,
    users,
    transactions: recentResult.data ?? [],
  });
}