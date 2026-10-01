import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";

const MIN = 50;
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const BUCKET = "deposit-proofs";
const IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

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

  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return NextResponse.json({ error: "Invalid form data" }, { status: 400 }); }

  const amount = Number(formData.get("amount"));
  if (!Number.isFinite(amount) || amount < MIN) {
    return NextResponse.json({ error: `Minimum deposit is GH₵ ${MIN}.` }, { status: 400 });
  }
  const screenshot = formData.get("screenshot");
  if (!(screenshot instanceof File)) {
    return NextResponse.json({ error: "A payment screenshot is required." }, { status: 400 });
  }
  const extension = IMAGE_TYPES.get(screenshot.type);
  if (!extension || screenshot.size === 0 || screenshot.size > MAX_SCREENSHOT_BYTES) {
    return NextResponse.json({ error: "Upload a JPG, PNG or WebP image up to 5 MB." }, { status: 400 });
  }

  const reference = `gg_dep_${user.id.slice(0, 8)}_${Date.now()}`;
  const admin = createAdminClient();
  const proofPath = `${user.id}/${reference}.${extension}`;
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(proofPath, screenshot, { contentType: screenshot.type, upsert: false });
  if (uploadError) {
    return NextResponse.json({ error: `Unable to upload payment screenshot: ${uploadError.message}` }, { status: 500 });
  }

  const { error: insertError } = await admin.from("transactions").insert({
    user_id: user.id,
    kind: "deposit",
    amount,
    status: "pending",
    reference,
    meta: {
      method: "telecel_manual",
      recipient: "Francis Ntamah",
      recipient_phone: "0203601136",
      proofPath,
    },
  });
  if (insertError) {
    await admin.storage.from(BUCKET).remove([proofPath]);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reference });
}
