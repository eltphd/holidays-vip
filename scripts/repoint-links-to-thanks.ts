/**
 * Repoints existing payment links (the six Winter Light links) so checkout ends on /thanks?sku=… instead of stripe.com
 * (spec §9.6). Lists every active payment link; for each with metadata.sku (or a --map override) sets after_completion.
 *
 *   npx tsx scripts/repoint-links-to-thanks.ts                       # dry run: lists links + what would change
 *   npx tsx scripts/repoint-links-to-thanks.ts --apply
 *   npx tsx scripts/repoint-links-to-thanks.ts --apply --map plink_abc=wl-make-digital,plink_def=wl-make-print
 *
 * Links without a sku (no metadata and no --map) are listed and left alone so nothing gets a wrong sku.
 */
import "dotenv/config";
import Stripe from "stripe";

const APPLY = process.argv.includes("--apply");
const mapIdx = process.argv.indexOf("--map");
const MAP = new Map<string, string>(
  mapIdx > -1 ? process.argv[mapIdx + 1].split(",").map((p) => p.split("=") as [string, string]) : [],
);
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://holidayz.vip").replace(/\/$/, "");

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY required.");
  const stripe = new Stripe(key);

  for await (const link of stripe.paymentLinks.list({ active: true, limit: 100 })) {
    const sku = MAP.get(link.id) ?? link.metadata?.sku ?? null;
    const current = link.after_completion?.type === "redirect" ? link.after_completion.redirect?.url : `(${link.after_completion?.type ?? "hosted"})`;
    if (!sku) { console.log(`?     ${link.id} no sku — current: ${current}  (pass --map ${link.id}=<sku>)`); continue; }
    const target = `${SITE}/thanks?sku=${encodeURIComponent(sku)}`;
    if (current === target) { console.log(`ok    ${link.id} ${sku} already → ${target}`); continue; }
    console.log(`${APPLY ? "set  " : "would"} ${link.id} ${sku}: ${current} → ${target}`);
    if (!APPLY) continue;
    await stripe.paymentLinks.update(link.id, {
      after_completion: { type: "redirect", redirect: { url: target } },
      allow_promotion_codes: true,
      metadata: { ...link.metadata, sku, campaign: link.metadata?.campaign ?? "winter-light-2026" },
    });
  }
  if (!APPLY) console.log("\nDry run. Re-run with --apply.");
}

main().catch((e) => { console.error(e); process.exit(1); });
