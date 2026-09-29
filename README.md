# goldgroundcapital344

## Admin access

Set `ADMIN_EMAILS` in the server's `.env.local` to a comma-separated list of verified email addresses allowed to use the admin dashboard, for example `ADMIN_EMAILS=admin@example.com`. Those addresses can create accounts through the normal sign-up page; after verifying their email, they can open `/dashboard/admin`. Restart the dev server after changing this value. Existing users can also be granted admin access by setting `app_metadata.role` to `admin` through the Supabase Admin API.