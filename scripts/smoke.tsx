/** Render smoke test for the kit page template + discreet-mode helpers. Run: npm run smoke */
import React from "react";
import { renderToString } from "react-dom/server";
import { KitPage } from "@/components/KitPage";
import { KitGrid } from "@/components/KitGrid";
import { renderDelivery } from "@/lib/mailer";
import type { Category, Kit, Sku } from "@/lib/catalog";
import { kitHref, kitIdFromSlug, isDiscreet } from "@/lib/catalog";

const category: Category = { id: "whole-table", display_name: "Whole Table", tagline: "Everybody who's coming is already welcome.", season_start: "2026-11-20", season_end: "2027-01-01", sort_order: 2, status: "draft", category_rules: [] };
const kit: Kit = { id: "wt-open-house", category_id: "whole-table", display_name: "Open House", format: "make", domain: null, audience: ["host", "gift-giver"], summary: "An affirming gathering.", contents: ["Host run-of-show", "Name-tag templates"], design_standards: {}, asks: {}, lens_available: false, audit_owners: ["trans"], audit_status: "draft", deliver_by: "2026-12-01", fallback_tier: 1, sort_order: 1 };
const base: Sku = { id: "wt-open-house-digital", kit_id: "wt-open-house", delivery: "digital", lens: null, price_cents: 2900, currency: "usd", stripe_product_name: "holidayz.vip kit", stripe_payment_link: null, stripe_payment_url: "https://buy.stripe.com/test", file_name: "holidayz-winter-kit-01.pdf", status: "preorder", deliver_by: "2026-12-01" };
const wsKit: Kit = { ...kit, id: "ws-nourish", category_id: "wellness-season", display_name: "Nourish", lens_available: true, domain: "nutritional" };
const wsCat: Category = { ...category, id: "wellness-season", display_name: "Wellness Season" };
const wsBase: Sku = { ...base, id: "ws-nourish-digital", kit_id: "ws-nourish", stripe_product_name: "Wellness Season — Nourish" };
const wsLens: Sku = { ...wsBase, id: "ws-nourish-digital-affirming", lens: "affirming" };
const bundle: Kit = { ...kit, id: "wt-complete", display_name: "Whole Table Complete", format: "bundle", contents: ["wt-open-house", "Family Soul Compass readout"] };

const checks: Array<[string, boolean]> = [];
const wt = renderToString(<KitPage category={category} kit={kit} skus={[base]} />);
checks.push(["WT page has title", wt.includes("Open House")]);
checks.push(["WT page has price $29", wt.includes("$29")]);
checks.push(["WT page has Pre-order button", wt.includes("Pre-order")]);
checks.push(["WT page has discreet card", wt.includes("Discreet delivery, always")]);
checks.push(["WT page lacks not-therapy card", !wt.includes("This isn")]);
checks.push(["WT page has six standards", (wt.match(/rounded-lg border border-border bg-card p-3 flex gap-3/g) ?? []).length === 6]);

const ws = renderToString(<KitPage category={wsCat} kit={wsKit} skus={[wsBase, wsLens]} />);
checks.push(["WS page has not-therapy card", ws.includes("This isn")]);
checks.push(["WS page has lens checkbox", ws.includes('type="checkbox"') && ws.includes("affirming family lens")]);
checks.push(["WS page links to lens explainer", ws.includes('href="/lens/affirming"')]);

const hiddenSku = { ...base, status: "hidden" as const };
const dark = renderToString(<KitPage category={category} kit={kit} skus={[hiddenSku]} />);
checks.push(["Hidden SKU shows 'Pre-orders open October 26'", dark.includes("Pre-orders open October 26") && !dark.includes("buy.stripe.com")]);

const b = renderToString(<KitPage category={category} kit={bundle} skus={[base]} bundleKits={[kit]} />);
checks.push(["Bundle links child kit", b.includes('href="/whole-table/open-house"')]);

const grid = renderToString(<KitGrid kits={[kit, wsKit]} skus={[base, wsBase]} />);
checks.push(["Grid renders both kits with prices", grid.includes("Nourish") && (grid.match(/\$29/g) ?? []).length === 2]);

checks.push(["kitHref strips prefix", kitHref(kit) === "/whole-table/open-house"]);
checks.push(["kitIdFromSlug adds prefix", kitIdFromSlug("wellness-season", "teen-room") === "ws-teen-room" && kitIdFromSlug("wellness-season", "ws-teen-room") === "ws-teen-room"]);
checks.push(["isDiscreet: whole-table base", isDiscreet(base, "whole-table")]);
checks.push(["isDiscreet: wellness lens", isDiscreet(wsLens, "wellness-season")]);
checks.push(["isDiscreet: wellness base is not", !isDiscreet(wsBase, "wellness-season")]);

const d = renderDelivery({ to: "x@y.z", discreet: true, kitName: "Open House", fileName: "holidayz-winter-kit-01.pdf", downloadUrl: "https://f/x" });
checks.push(["Discreet email subject neutral", d.subject === "Your holidayz.vip kit" && !d.text.includes("Open House")]);
const n = renderDelivery({ to: "x@y.z", discreet: false, kitName: "Nourish", fileName: "ws-nourish-digital.pdf", downloadUrl: "https://f/x" });
checks.push(["Non-discreet email names kit", n.subject.includes("Nourish")]);

let fail = 0;
for (const [name, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"}  ${name}`); if (!ok) fail++; }
console.log(fail === 0 ? "\nall checks passed" : `\n${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
