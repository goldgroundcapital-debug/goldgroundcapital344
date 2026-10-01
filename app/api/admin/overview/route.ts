import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/supabase/authorization";

const PAGE_SIZE = 25;

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Server admin client is not configured." }, { status: 503 });
  }

  const pageParam = Number(new URL(request.url).searchParams.get("page") ?? 1);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const admin = createAdminClient();
  const activityStart = new Date();
  activityStart.setMonth(activityStart.getMonth() - 5, 1);
  activityStart.setHours(0, 0, 0, 0);

  const [authResult, profilesResult, transactionCountResult, pendingResult, pendingWithdrawalsResult, pendingDepositsResult, recentResult, activityResult] =
    await Promise.all([
      admin.auth.admin.listUsers({ page, perPage: PAGE_SIZE }),
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("transactions").select("id", { count: "exact", head: true }),
      admin.from("transactions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      admin.from("transactions").select("id", { count: "exact", head: true }).eq("status", "pending").eq("kind", "withdrawal"),
      admin.from("transactions").select("id", { count: "exact", head: true }).eq("status", "pending").eq("kind", "deposit"),
      admin
        .from("transactions")
        .select("id, user_id, kind, amount, status, reference, meta, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
      admin
        .from("transactions")
        .select("kind, amount, created_at")
        .in("kind", ["deposit", "withdrawal"])
        .gte("created_at", activityStart.toISOString())
        .order("created_at", { ascending: true })
        .limit(1000),
    ]);

  if (authResult.error) return NextResponse.json({ error: authResult.error.message }, { status: 500 });
  const overviewError = profilesResult.error ?? transactionCountResult.error ?? pendingResult.error ?? pendingWithdrawalsResult.error ?? pendingDepositsResult.error ?? recentResult.error ?? activityResult.error;
  if (overviewError) return NextResponse.json({ error: overviewError.message }, { status: 500 });

  const transactions = await Promise.all((recentResult.data ?? []).map(async (transaction) => {
    const meta = transaction.meta as Record<string, unknown> | null;
    const proofPath = typeof meta?.proofPath === "string" ? meta.proofPath : null;
    if (!proofPath) return { ...transaction, proofUrl: null };
    const { data } = await admin.storage.from("deposit-proofs").createSignedUrl(proofPath, 60 * 60);
    return { ...transaction, proofUrl: data?.signedUrl ?? null };
  }));

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

  const monthlyActivity = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(activityStart.getFullYear(), activityStart.getMonth() + index, 1);
    return {
      label: month.toLocaleDateString("en-GH", { month: "short" }),
      key: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`,
      deposits: 0,
      withdrawals: 0,
    };
  });
  const monthsByKey = new Map(monthlyActivity.map((month) => [month.key, month]));
  for (const transaction of activityResult.data ?? []) {
    const month = monthsByKey.get(transaction.created_at.slice(0, 7));
    if (!month) continue;
    if (transaction.kind === "deposit") month.deposits += Math.abs(Number(transaction.amount));
    if (transaction.kind === "withdrawal") month.withdrawals += Math.abs(Number(transaction.amount));
  }

  return NextResponse.json({
    page,
    pageSize: PAGE_SIZE,
    totalUsers: profilesResult.count ?? 0,
    totalTransactions: transactionCountResult.count ?? 0,
    pendingTransactions: pendingResult.count ?? 0,
    pendingWithdrawals: pendingWithdrawalsResult.count ?? 0,
    pendingDeposits: pendingDepositsResult.count ?? 0,
    users,
    transactions,
    monthlyActivity,
  });
}