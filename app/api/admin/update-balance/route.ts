import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/supabase/authorization";

type Body = {
  userId: string;
  amount: number;
  reason: string;
};

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Server admin client is not configured." }, { status: 503 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }
  if (
    typeof body.userId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.userId)
  ) {
    return NextResponse.json({ error: "A valid userId is required." }, { status: 400 });
  }
  if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount === 0) {
    return NextResponse.json({ error: "Amount must be a non-zero finite number." }, { status: 400 });
  }
  const cents = body.amount * 100;
  if (Math.abs(cents - Math.round(cents)) > 1e-8) {
    return NextResponse.json({ error: "Amount cannot have more than two decimal places." }, { status: 400 });
  }
  if (typeof body.reason !== "string" || body.reason.trim().length < 3 || body.reason.trim().length > 300) {
    return NextResponse.json({ error: "Reason must be between 3 and 300 characters." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("update_balance", {
    p_user_id: body.userId,
    p_amount: body.amount,
    p_admin_user_id: user.id,
    p_reason: body.reason.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, result: data });
}