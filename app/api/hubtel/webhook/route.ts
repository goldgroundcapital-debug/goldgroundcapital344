import { NextResponse } from "next/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";

/* Hubtel webhook — Hubtel POSTs here when a charge or transfer settles.
   Register this URL in Hubtel: Receive/Send Money → Configure callbacks.

   Optional: set HUBTEL_WEBHOOK_SECRET in .env.local and configure Hubtel to
   append ?secret=... when calling — we'll reject any POST without that
   matching query string. */

type Payload = {
  ResponseCode?: string;
  Status?: string;          // "Success" | "Failed" | "Paid" | ...
  Data?: {
    Amount?: number;
    ClientReference?: string;
    TransactionId?: string;
    Description?: string;
  };
};

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const expected = process.env.HUBTEL_WEBHOOK_SECRET;
  if (expected) {
    const url = new URL(request.url);
    const given = url.searchParams.get("secret");
    if (given !== expected) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }
  }

  let payload: Payload;
  try { payload = await request.json(); }
  catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }

  const reference = payload.Data?.ClientReference;
  const status   = (payload.Status ?? "").toLowerCase();
  if (!reference) return NextResponse.json({ error: "No client reference" }, { status: 400 });

  const admin = createAdminClient();

  // Look up the transaction we created when the user submitted the form.
  const { data: tx } = await admin
    .from("transactions")
    .select("id, user_id, kind, amount, meta, status")
    .eq("reference", reference)
    .maybeSingle();
  if (!tx) return NextResponse.json({ ok: true, ignored: "unknown reference" });

  if (tx.status === "confirmed" || tx.status === "failed") {
    return NextResponse.json({ ok: true, ignored: "already settled" });
  }

  const isSuccess = status === "success" || status === "paid";
  const isFailed  = status === "failed" || status === "cancelled" || status === "reversed";

  if (tx.kind === "deposit" && isSuccess) {
    await confirmDeposit(admin, tx);
  } else if (tx.kind === "deposit" && isFailed) {
    await markFailed(admin, tx.id);
  } else if (tx.kind === "withdrawal" && isSuccess) {
    await admin.from("transactions")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", tx.id);
  } else if (tx.kind === "withdrawal" && isFailed) {
    await refundWithdrawal(admin, tx);
  }

  return NextResponse.json({ ok: true });
}

type Admin = ReturnType<typeof createAdminClient>;
type Tx = { id: string; user_id: string; kind: string; amount: number; meta: Record<string, unknown> | null; status: string };

async function confirmDeposit(admin: Admin, tx: Tx) {
  await admin.from("transactions")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", tx.id);

  const { data: w } = await admin
    .from("wallets")
    .select("balance")
    .eq("user_id", tx.user_id)
    .maybeSingle();
  if (w) {
    await admin.from("wallets")
      .update({ balance: Number(w.balance) + Number(tx.amount) })
      .eq("user_id", tx.user_id);
  }
}

async function markFailed(admin: Admin, id: string) {
  await admin.from("transactions")
    .update({ status: "failed", confirmed_at: new Date().toISOString() })
    .eq("id", id);
}

async function refundWithdrawal(admin: Admin, tx: Tx) {
  const gross = Number(tx.meta?.gross ?? Math.abs(Number(tx.amount)));
  const { data: w } = await admin
    .from("wallets")
    .select("balance")
    .eq("user_id", tx.user_id)
    .maybeSingle();
  if (w) {
    await admin.from("wallets")
      .update({ balance: Number(w.balance) + gross })
      .eq("user_id", tx.user_id);
  }
  await markFailed(admin, tx.id);
  await admin.from("transactions")
    .update({ status: "cancelled" })
    .eq("reference", `${tx.id}_fee`); // best-effort cancel of fee row
}
