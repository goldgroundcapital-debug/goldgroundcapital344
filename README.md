# goldgroundcapital344

## Google sign-in URLs

Set `NEXT_PUBLIC_SITE_URL` in the deployment environment to the public app origin, for example `https://goldgroundcapital1.online` (use HTTPS when available). In Supabase → Authentication → URL Configuration, set **Site URL** to the same origin and add `<site-origin>/auth/callback` to **Redirect URLs**. Keep `http://localhost:3000/auth/callback` there only for local development.

In Google Cloud Console, the OAuth client's authorized redirect URI must be the Supabase callback URL, `https://<project-ref>.supabase.co/auth/v1/callback`, not the app's `/auth/callback` URL. Find the project ref in `NEXT_PUBLIC_SUPABASE_URL`.

## Admin access

Set `ADMIN_EMAILS` in the server's `.env.local` to a comma-separated list of verified email addresses allowed to use the admin dashboard, for example `ADMIN_EMAILS=admin@example.com`. Those addresses can create accounts through the normal sign-up page; after verifying their email, they can open `/dashboard/admin`. Restart the dev server after changing this value. Existing users can also be granted admin access by setting `app_metadata.role` to `admin` through the Supabase Admin API.