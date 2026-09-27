/* Hubtel API wrapper — Ghana mobile money + bank.
   All amounts are in cedis (GHS), not pesewas. */

const RECEIVE_BASE  = "https://rmp.hubtel.com";
const SEND_BASE     = "https://rmp.hubtel.com";
const CHECKOUT_BASE = "https://payproxyapi.hubtel.com";

export function isHubtelConfigured() {
  return Boolean(
    process.env.HUBTEL_API_KEY &&
    process.env.HUBTEL_API_SECRET &&
    process.env.HUBTEL_MERCHANT_ID,
  );
}

function authHeader() {
  const key    = process.env.HUBTEL_API_KEY;
  const secret = process.env.HUBTEL_API_SECRET;
  if (!key || !secret) throw new Error("HUBTEL_API_KEY and HUBTEL_API_SECRET must be set in .env.local.");
  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  return `Basic ${token}`;
}

function merchantId() {
  const id = process.env.HUBTEL_MERCHANT_ID;
  if (!id) throw new Error("HUBTEL_MERCHANT_ID must be set in .env.local.");
  return id;
}

async function call<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (json && (json.Message || json.message)) || `Hubtel ${url} failed (${res.status})`;
    throw new Error(message);
  }
  return json as T;
}

/* ---------- Channel codes ---------- */

export type HubtelChannel = "mtn-gh" | "vodafone-gh" | "tigo-gh";

export function channelFor(method: "mtn" | "telecel"): HubtelChannel {
  // Telecel Ghana = ex-Vodafone Ghana; Hubtel still uses "vodafone-gh".
  return method === "mtn" ? "mtn-gh" : "vodafone-gh";
}

/* ---------- Receive Money (mobile money deposit) ---------- */

export type ReceiveMomoResponse = {
  ResponseCode: string;        // "0000" on success
  Status: string;              // "Pending" | "Success" | ...
  Data?: {
    TransactionId?: string;
    Description?: string;      // USSD prompt text shown to the user
    ClientReference?: string;
    Amount?: number;
  };
};

export function receiveMomo(args: {
  customerName: string;
  customerMsisdn: string;       // e.g. "233244123456"
  channel: HubtelChannel;
  amountCedis: number;
  description: string;
  clientReference: string;
  primaryCallbackUrl: string;
}) {
  const url = `${RECEIVE_BASE}/merchantaccount/merchants/${merchantId()}/receive/mobilemoney`;
  return call<ReceiveMomoResponse>(url, {
    CustomerName: args.customerName,
    CustomerMsisdn: args.customerMsisdn,
    Channel: args.channel,
    Amount: args.amountCedis,
    PrimaryCallbackUrl: args.primaryCallbackUrl,
    Description: args.description,
    ClientReference: args.clientReference,
  });
}

/* ---------- Online Checkout (hosted page; used for bank transfer + cards) ---------- */

export type CheckoutResponse = {
  status: string;              // "Success"
  responseCode: string;
  data: {
    checkoutUrl: string;
    checkoutId: string;
    clientReference: string;
  };
};

export function initializeCheckout(args: {
  totalAmountCedis: number;
  description: string;
  clientReference: string;
  callbackUrl: string;         // server webhook
  returnUrl: string;           // user browser redirect after payment
  cancellationUrl: string;
  customerName?: string;
  customerEmail?: string;
  customerMsisdn?: string;
  itemName?: string;
}) {
  return call<CheckoutResponse>(`${CHECKOUT_BASE}/items/initiate`, {
    totalAmount: args.totalAmountCedis,
    description: args.description,
    callbackUrl: args.callbackUrl,
    returnUrl: args.returnUrl,
    cancellationUrl: args.cancellationUrl,
    merchantAccountNumber: merchantId(),
    clientReference: args.clientReference,
    payeeName: args.customerName,
    payeeMobileNumber: args.customerMsisdn,
    payeeEmail: args.customerEmail,
  });
}

/* ---------- Send Money (mobile money withdrawal) ---------- */

export type SendMomoResponse = {
  ResponseCode: string;
  Status: string;
  Data?: { TransactionId?: string; ClientReference?: string; Amount?: number };
};

export function sendMomo(args: {
  recipientName: string;
  recipientMsisdn: string;
  channel: HubtelChannel;
  amountCedis: number;
  description: string;
  clientReference: string;
  primaryCallbackUrl: string;
}) {
  const url = `${SEND_BASE}/merchantaccount/merchants/${merchantId()}/send/mobilemoney`;
  return call<SendMomoResponse>(url, {
    RecipientName: args.recipientName,
    RecipientMobileMoneyNumber: args.recipientMsisdn,
    CustomerEmail: "",
    Channel: args.channel,
    Amount: args.amountCedis,
    PrimaryCallbackUrl: args.primaryCallbackUrl,
    Description: args.description,
    ClientReference: args.clientReference,
  });
}

/* ---------- Helper: normalise Ghana phone to 233-format ---------- */

export function toGhanaMsisdn(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("233") && digits.length === 12) return digits;
  if (digits.startsWith("0")   && digits.length === 10) return `233${digits.slice(1)}`;
  if (digits.length === 9)                              return `233${digits}`;
  return digits;
}
