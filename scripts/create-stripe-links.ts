/**
 * Creates one Stripe product + price + payment link per catalog SKU (spec §2 Stripe conventions), then writes
 * the ids back to catalog_skus. Idempotent: skips SKUs that already have stripe_payment_link.
 *
 *   npx tsx scripts/create-stripe-links.ts             # dry run — prints what it would create
 *   npx tsx scripts/create-stripe-links.ts --apply     # creates in Stripe + writes back to Supabase
 *   npx tsx scripts/create-stripe-links.ts --apply --only wt-open-house-digital
 *
 * Conventions enforced here:
 *   metadata.campaign = winter-light-2026, metadata.category, metadata.sku (on product, price, link, AND session)
 *   allow_promotion_codes = true (FIRSTLIGHT applies)
 *   no shipping collection (digital)
 *   after_completion → NEXT_PUBLIC_SITE_URL/thanks?sku=<id>
 *   product name = catalog_skus.stripe_product_name (neutral for Whole Table + lens SKUs)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"] });
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;
const CAMPAIGN = "winter-light-2026";
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://holidayz.vip").replace(/\/$/, "");

type Row = {
  id: string; kit_id: string; lens: string | null; price_cents: number; currency: string;
  stripe_product_name: string | null; stripe_payment_link: string | null;
  kit: { category_id: string; display_name: string } | null;
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  const db = createClient(url, key, { auth: { persistSession: false } });

  let q = db.from("catalog_skus").select("id, kit_id, lens, price_cents, currency, stripe_product_name, stripe_payment_link, kit:catalog_kits(category_id, display_name)").neq("status", "retired").order("id");
  if (ONLY) q = q.eq("id", ONLY);
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as unknown as Row[];

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (APPLY && !stripeKey) throw new Error("STRIPE_SECRET_KEY required with --apply.");
  const stripe = stripeKey ? new Stripe(stripeKey) : null;

  for (const r of rows) {
    if (r.stripe_payment_link) { console.log(`skip  ${r.id} (has ${r.stripe_payment_link})`); continue; }
    const category = r.kit?.category_id ?? "unknown";
    const discreet = category === "whole-table" || r.lens === "affirming";
    const name = r.stripe_product_name ?? (discreet ? "holidayz.vip kit" : `${r.kit?.display_name ?? r.id}`);
    if (discreet && /whole table|affirming|lgbt|queer|trans/i.test(name)) {
      throw new Error(`${r.id}: product name "${name}" is not neutral — discreet-mode violation`);
    }
    const metadata = { campaign: CAMPAIGN, category, sku: r.id, lens: r.lens ?? "" };
    const successUrl = `${SITE}/thanks?sku=${encodeURIComponent(r.id)}`;

    console.log(`${APPLY ? "create" : "would "} ${r.id}: "${name}" ${r.price_cents / 100} ${r.currency} → ${successUrl}`);
    if (!APPLY || !stripe) continue;

    const product = await stripe.products.create({ name, metadata, shippable: false });
    const price = await stripe.prices.create({ product: product.id, unit_amount: r.price_cents, currency: r.currency, metadata });
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: true,
      metadata,
      // Card statement reads "FEELINGSUN* <suffix>" (account prefix). Discreet SKUs must not name the category.
      payment_intent_data: { metadata, statement_descriptor_suffix: discreet ? "HOLIDAYZ KIT" : "WELLNESS SEASON" },
      after_completion: { type: "redirect", redirect: { url: successUrl } },
      // No shipping_address_collection: digital only.
    });

    const { error: upErr } = await db.from("catalog_skus").update({
      stripe_product_id: product.id, stripe_price_id: price.id, stripe_payment_link: link.id, stripe_payment_url: link.url,
    }).eq("id", r.id);
    if (upErr) throw upErr;
    console.log(`  ok  ${link.id} ${link.url}`);
  }
  if (!APPLY) console.log("\nDry run. Re-run with --apply to create in Stripe.");
}

main().catch((e) => { console.error(e); process.exit(1); });
