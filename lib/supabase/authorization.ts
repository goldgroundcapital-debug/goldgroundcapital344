type AdminIdentity = {
  email?: string;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  app_metadata?: Record<string, unknown>;
};

export function isAdminUser(user: AdminIdentity) {
  if (user.app_metadata?.role === "admin") return true;

  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const emailVerified = Boolean(user.email_confirmed_at || user.confirmed_at);
  return Boolean(emailVerified && user.email && allowedEmails.includes(user.email.toLowerCase()));
}