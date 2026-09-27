import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import {
  channelFor,
  initializeCheckout,
  isHubtelConfigured,
  receiveMomo,
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

const MIN = 50;

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
  if (!Number.isFinite(amount) || amount < MIN) {
    return NextResponse.json({ error: `Minimum deposit is GH₵ ${MIN}.` }, { status: 400 });
  }
  if (!["mtn", "telecel", "bank"].includes(body.method)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }
  if ((body.method === "mtn" || body.method === "telecel") && !body.phone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const reference = `gg_dep_${user.id.slice(0, 8)}_${Date.now()}`;
  const admin = createAdminClient();
  const origin = new URL(request.url).origin;

  const { error: insertError } = await admin.from("transactions").insert({
    user_id: user.id,
    kind: "deposit",
    amount,
    status: "pending",
    reference,
    meta: {
      method: body.method,
      phone: body.phone ?? null,
      bank: body.bank ?? null,
    },
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (!isHubtelConfigured()) {
    return NextResponse.json({
      ok: true,
      reference,
      processorConfigured: false,
      message:
        "Deposit recorded as pending. Hubtel isn't connected yet, so no charge will be initiated. " +
        "Add HUBTEL_API_KEY, HUBTEL_API_SECRET, and HUBTEL_MERCHANT_ID to .env.local to enable real charges.",
    });
  }

  try {
    if (body.method === "bank") {
      const res = await initializeCheckout({
        totalAmountCedis: amount,
        description: `GoldGround Capital deposit ${reference}`,
        clientReference: reference,
        callbackUrl:      `${origin}/api/hubtel/webhook`,
        returnUrl:        `${origin}/dashboard/wallet?deposit=${reference}`,
        cancellationUrl:  `${origin}/dashboard/wallet?cancelled=${reference}`,
        customerName:  body.accountName ?? user.email ?? "",
        customerEmail: user.email ?? "",
        customerMsisdn: body.phone ?? "",
      });
      return NextResponse.json({
        ok: true,
        reference,
        method: "bank",
        authorizationUrl: res.data.checkoutUrl,
      });
    } else {
      const msisdn = toGhanaMsisdn(body.phone!);
      const res = await receiveMomo({
        customerName: user.email ?? "GoldGround user",
        customerMsisdn: msisdn,
        channel: channelFor(body.method),
        amountCedis: amount,
        description: `GoldGround deposit ${reference}`,
        clientReference: reference,
        primaryCallbackUrl: `${origin}/api/hubtel/webhook`,
      });
      return NextResponse.json({
        ok: true,
        reference,
        method: body.method,
        processorStatus: res.Status,
        displayText:
          res.Data?.Description ??
          "Check your phone for the payment prompt. Enter your mobile money PIN to authorise the deposit.",
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Hubtel error";
    await admin.from("transactions").update({ status: "failed", meta: { error: msg } }).eq("reference", reference);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
