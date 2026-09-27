import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import {
  channelFor,
  isHubtelConfigured,
  sendMomo,
  toGhanaMsisdn,
} from "@/lib/hubtel";

type Body = {
  amount: number;
  method: "mtn" | "telecel" | "bank";
  phone?: string;
  bank?: string;
  accountNumber?: string;
  accountName?: string;
};

const MIN_MOMO = 100;
const MIN_BANK = 500;
const FEE_RATE = 0.015;

export function calculateFee(amount: number) {
  const fee = Math.round(amount * FEE_RATE * 100) / 100;
  return { fee, net: Math.round((amount - fee) * 100) / 100 };
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Server isn't configured to record transactions yet. Add SUPABASE_SERVICE_ROLE_KEY to .env.local." },
      { status: 503 },
    );
  }

  let body: Body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Amount must be positive." }, { status: 400 });
  }
  const min = body.method === "bank" ? MIN_BANK : MIN_MOMO;
  if (amount < min) {
    return NextResponse.json({ error: `Minimum withdrawal for this method is GH₵ ${min}.` }, { status: 400 });
  }
  if (!["mtn", "telecel", "bank"].includes(body.method)) {
    return NextResponse.json({ error: "Invalid method" }, { status: 400 });
  }
  if ((body.method === "mtn" || body.method === "telecel") && (!body.phone || !body.accountName)) {
    return NextResponse.json({ error: "Phone and account name are required." }, { status: 400 });
  }
  if (body.method === "bank" && (!body.bank || !body.accountNumber || !body.accountName)) {
    return NextResponse.json({ error: "Bank, account number, and account name are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const origin = new URL(request.url).origin;

  // Check balance.
  const { data: wallet, error: walletErr } = await admin
    .from("wallets")
    .select("balance, locked")
    .eq("user_id", user.id)
    .maybeSingle();
  if (walletErr) return NextResponse.json({ error: walletErr.message }, { status: 500 });
  if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 500 });

  const balance = Number(wallet.balance);
  if (balance < amount) {
    return NextResponse.json(
      { error: `Insufficient balance. Available: GH₵ ${balance.toFixed(2)}` },
      { status: 400 },
    );
  }

  const { fee, net } = calculateFee(amount);
  const reference = `gg_wd_${user.id.slice(0, 8)}_${Date.now()}`;

  // Debit the wallet immediately.
  const { error: debitErr } = await admin
    .from("wallets")
    .update({ balance: balance - amount })
    .eq("user_id", user.id);
  if (debitErr) return NextResponse.json({ error: debitErr.message }, { status: 500 });

  const { error: txErr } = await admin.from("transactions").insert([
    {
      user_id: user.id,
      kind: "withdrawal",
      amount: -net,
      status: "pending",
      reference,
      meta: {
        method: body.method,
        phone: body.phone ?? null,
        bank: body.bank ?? null,
        accountNumber: body.accountNumber ?? null,
        accountName: body.accountName ?? null,
        gross: amount,
        fee,
      },
    },
    {
      user_id: user.id,
      kind: "fee",
      amount: -fee,
      status: "confirmed",
      reference: `${reference}_fee`,
      meta: { for: reference },
      confirmed_at: new Date().toISOString(),
    },
  ]);
  if (txErr) {
    await admin.from("wallets").update({ balance }).eq("user_id", user.id);
    return NextResponse.json({ error: txErr.message }, { status: 500 });
  }

  // Bank-transfer payouts via Hubtel require additional onboarding (Hubtel Send Money for Banks).
  // For now we queue them for manual settlement and notify the user.
  if (body.method === "bank") {
    return NextResponse.json({
      ok: true,
      reference,
      fee,
      net,
      processorConfigured: false,
      message: "Bank withdrawal queued for manual settlement (Hubtel Send-to-Bank requires extra setup).",
    });
  }

  if (!isHubtelConfigured()) {
    return NextResponse.json({
      ok: true,
      reference,
      fee,
      net,
      processorConfigured: false,
      message: "Withdrawal recorded. Hubtel isn't connected yet — manual payout will follow.",
    });
  }

  try {
    const transfer = await sendMomo({
      recipientName: body.accountName!,
      recipientMsisdn: toGhanaMsisdn(body.phone!),
      channel: channelFor(body.method as "mtn" | "telecel"),
      amountCedis: net,
      description: `GoldGround payout ${reference}`,
      clientReference: reference,
      primaryCallbackUrl: `${origin}/api/hubtel/webhook`,
    });

    return NextResponse.json({
      ok: true,
      reference,
      fee,
      net,
      transferStatus: transfer.Status,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Hubtel transfer failed";
    await admin.from("wallets").update({ balance }).eq("user_id", user.id);
    await admin.from("transactions")
      .update({ status: "failed", meta: { error: msg } })
      .eq("reference", reference);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
