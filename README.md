# DropshipTroopers 2.0

Full-stack auto-curated storefront: Next.js 15 + Tailwind + Supabase (auth + Postgres) + Stripe + Resend.

## What's actually wired up vs. stubbed

| Feature | Status |
|---|---|
| Email magic-link auth | ✅ real (Supabase Auth) |
| Product catalog (10 seed items) | ✅ real, in Postgres |
| Cart (localStorage + DB sync) | ✅ real |
| Stripe Checkout (test mode) | ✅ real |
| Order history | ✅ real |
| Admin dashboard (owner-only) | ✅ real |
| Tracking email on payment | ✅ real send via Resend, but the tracking **number is fake** (`DST########`) |
| Daily "hottest products" refresh | ⚠️ stub — Edge Function re-randomizes trending scores on a schedule so the self-refresh loop works end-to-end, but it isn't pulling from a real supplier trending feed yet |
| CJDropshipping / Zendrop / Spocket auto-fulfillment | ❌ not connected — footer shows "not connected," and there's a clearly marked TODO in `app/api/webhook/route.ts` for where the real order-placement call goes |

That last one is the piece we didn't have API access sorted out yet — once you get a CJ (or Zendrop/Spocket) API key, that's a single function to write, and I can do it with you when you're ready.

## 1. Install dependencies

```powershell
cd dropshiptroopers2
npm install
```

## 2. Create a Supabase project

1. Go to supabase.com → New Project.
2. Once it's up, go to **Project Settings → API** and copy: `Project URL`, `anon public` key, and `service_role` key (keep this one secret).
3. Go to **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, run it.
4. New query again, paste `supabase/seed.sql`, run it. This loads 10 placeholder products — **edit the prices/costs/supplier SKUs in that file first** if you already know your real numbers, or edit the rows directly in Supabase's Table Editor afterward.

## 3. Make yourself the admin/owner

Sign up on your own site once (via the magic link flow), then in Supabase SQL Editor:

```sql
update public.profiles set role = 'owner' where email = 'you@example.com';
```

Now `/admin` will let you in — everyone else gets redirected home.

## 4. Set up Stripe (test mode)

1. dashboard.stripe.com/test/apikeys → copy the **Secret key**.
2. Install the Stripe CLI, then in a separate PowerShell window while developing locally:
   ```powershell
   stripe login
   stripe listen --forward-to localhost:3000/api/webhook
   ```
   This prints a `whsec_...` — that's your `STRIPE_WEBHOOK_SECRET` for local dev.
3. For production, create the webhook in the Stripe Dashboard instead: **Developers → Webhooks → Add endpoint**, URL = `https://yourdomain.com/api/webhook`, event = `checkout.session.completed`. Copy the signing secret it gives you.
4. Test card for checkout: `4242 4242 4242 4242`, any future expiry, any CVC.

## 5. Set up Resend (optional but recommended)

1. resend.com → API Keys → create one.
2. Verify a sending domain (or use their test domain while developing).
3. Without a `RESEND_API_KEY` set, the app just logs "would send email" to the server console instead of failing — so you can test the whole flow before setting this up.

## 6. Environment variables

```powershell
copy .env.local.example .env.local
```
Fill in every value from steps 2–5.

## 7. Run it

```powershell
npm run dev
```
Visit http://localhost:3000. Sign in, add items to cart, checkout with the Stripe test card, and you should land on the success page, see the order in `/account/orders`, and see it (and live revenue) in `/admin`.

## 8. Schedule the daily "self-run" refresh

```powershell
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase functions deploy refresh-trending
npx supabase secrets set FUNCTION_SECRET=some-long-random-string
```
Then in the Supabase Dashboard → **Edge Functions → refresh-trending → Schedule**, set a daily cron (e.g. `0 8 * * *`). This re-sorts the trending grid every day. When you connect a supplier API, this is the function you'll extend to pull real trending products instead of randomizing scores.

## 9. Deploy to Vercel

Push to GitHub, import into Vercel, paste in the same env vars from `.env.local` (Vercel Project Settings → Environment Variables), redeploy. Update the Stripe webhook endpoint URL to your production domain once it's live.

## Project structure

```
app/
  page.tsx                 → homepage / trending product grid
  login/                   → magic link sign-in
  auth/callback/           → completes the magic link exchange
  cart/                    → cart page, calls /api/checkout
  checkout/success|cancel/ → post-Stripe redirect pages
  account/orders/          → per-user order history (RLS-scoped)
  admin/                   → owner-only live revenue dashboard
  api/checkout/route.ts    → creates the Stripe Checkout Session
  api/webhook/route.ts     → Stripe webhook: creates order + sends tracking email
components/                → Header, Footer, ProductCard
lib/                       → Supabase clients, Stripe client, cart logic, types
middleware.ts              → refreshes auth session, gates /admin to owners
supabase/schema.sql        → run this first
supabase/seed.sql          → 10 starter products, edit with real data
supabase/functions/        → refresh-trending Edge Function
```
