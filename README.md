# holidayz.vip — Catalog Dev Build v1

Whole Table (LGBTQIA+) and Wellness Season, sold alongside Winter Light through Dec 31, 2026. Spec: *Catalog Dev
Build v1* (Sept 20, 2026). Seed: `supabase/seed/holidayz-catalog-seed.json`.

Next.js 16 (App Router) · Tailwind 4 · Supabase (project `avrpthgahcrvsqpruziz`) · Stripe payment links · Vercel.

## Run it

```bash
cp .env.example .env.local   # fill SUPABASE_SERVICE_ROLE_KEY at minimum
npm install
npm run dev
```

Pages ship dark. Set `NEXT_PUBLIC_CATALOG_V2=true` to light the new routes (flag flips for real on **Oct 26**).

## What's here

| Piece | Where |
|---|---|
| Migration (5 tables + `holidayz_orders` columns + RLS + triggers) | `supabase/migrations/20260920120000_catalog_v2.sql` — **applied to the live project on Sept 20** |
| Seed loader (idempotent; `--sql` mode prints SQL) | `scripts/load-seed.ts` — **seed loaded Sept 20**: 3 categories, 14 kits, 14 SKUs |
| Feature flag | `src/lib/flags.ts` (`NEXT_PUBLIC_CATALOG_V2`) |
| Data layer (server-side, service role) | `src/lib/catalog.ts`, `src/lib/supabase.ts` |
| Kit page template (one component, all kits) | `src/components/KitPage.tsx` + `BuyBox.tsx` + `StandardsStrip.tsx` + `Cards.tsx` |
| Routes | `/` · `/whole-table` · `/whole-table/[kit]` · `/wellness-season` (calendar) · `/wellness-season/[kit]` · `/lens/affirming` · `/thanks` · `/community-builders` |
| Webhook → `holidayz_orders` | `src/app/api/stripe/webhook/route.ts` |
| Daily delivery mailer (Resend, neutral subject for discreet SKUs) | `src/app/api/cron/deliver/route.ts` + `src/lib/mailer.ts` + `vercel.json` cron |
| Stripe link creation (dry-run default) | `scripts/create-stripe-links.ts` |
| Repoint existing Winter Light links to `/thanks` | `scripts/repoint-links-to-thanks.ts` |
| Discreet-mode checklist | `docs/discreet-mode-checklist.md` |

Kit URLs drop the category prefix: kit `wt-open-house` lives at `/whole-table/open-house`.

## Deviations from the spec (deliberate)

- **No new `orders` table.** The live project already has `holidayz_orders` (written by the Winter Light webhook).
  The migration adds `category_id`, `lens`, `discreet`, `deliver_by`, `delivered_at` to it instead.
- **Extra columns** on `catalog_kits` (`domain`, `audit_owners`, `deliver_by`, `fallback_tier`, `asks`) and
  `catalog_skus` (`stripe_product_name`, `stripe_product_id`, `stripe_payment_url`, `file_name`) because the seed
  and the page contract need them. `auditors` gains `credit_choice` / `credit_name` for `/community-builders`.
- **RLS + rendering.** Anonymous reads are limited to `live` rows as specced. The site renders server-side with the
  service role so pre-order (non-live) kits can show behind the flag. `auditors` / `audit_reviews` have no policies
  (service role only). Two triggers: any rubric 0 sets `blocking`; a review from an unconsented or minor-without-guardian
  auditor is rejected.
- **Lens = separate SKU row** (seed approach). The buy box swaps the payment link when the box is ticked.

## Stripe steps (need `STRIPE_SECRET_KEY`; not run yet)

```bash
npx tsx scripts/create-stripe-links.ts            # dry run
npx tsx scripts/create-stripe-links.ts --apply    # creates products/prices/links, writes ids to catalog_skus
npx tsx scripts/repoint-links-to-thanks.ts        # lists existing links; --apply to set success URL → /thanks
```

Then add the webhook endpoint `https://holidayz.vip/api/stripe/webhook` for `checkout.session.completed` and set
`STRIPE_WEBHOOK_SECRET`. If the old Winter Light webhook also writes `holidayz_orders`, retire it once this one is
live to avoid two writers.

## Acceptance criteria (spec §9)

1. Migration applied, seed loads: **done** (`catalog_kits` = 14 rows: 12 new + 2 Winter Light; `catalog_skus` = 14: 12 base + 2 lens).
2. Flag off → new routes 404; flag on → routes render from Supabase: **built**; verified flag-off locally, flag-on needs `SUPABASE_SERVICE_ROLE_KEY`.
3. Discreet-mode checklist: `docs/discreet-mode-checklist.md`; the link script refuses non-neutral product names.
4. Webhook writes `holidayz_orders`; cron sends on `deliver_by` (or dry-run logs when `RESEND_API_KEY` is unset): **built, not yet wired in Stripe**.
5. Lighthouse ≥ 95 / tagged PDFs: pages use semantic landmarks, skip link, focus rings, contrast tokens; run Lighthouse after deploy. PDFs are the content team's.
6. FIRSTLIGHT + `/thanks` on every link: enforced by both scripts.

## Fallback (spec §8.3)

`catalog_kits.fallback_tier = 1` marks what ships regardless. To execute the fallback, set tier-2 SKUs to
`status = 'hidden'`; the pages hide nothing else automatically, so also set `catalog_kits.audit_status` back to
`draft` for tier-2 kits and they drop from the grids via a one-line filter you'd add in `getKits`.
