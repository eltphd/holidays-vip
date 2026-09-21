/**
 * Loads supabase/seed/holidayz-catalog-seed.json into catalog_categories / catalog_kits / catalog_skus.
 * Idempotent (upserts on id). Never touches holidayz_waitlist or holidayz_orders.
 *
 *   npx tsx scripts/load-seed.ts          # upsert via supabase-js (needs SUPABASE_SERVICE_ROLE_KEY)
 *   npx tsx scripts/load-seed.ts --sql    # print the equivalent SQL instead (paste into the SQL editor / MCP)
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"] });
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

type SeedKit = {
  id: string; category_id: string; display_name: string; format: string; domain?: string;
  audience: string[]; summary: string; contents: string[]; lens_available: boolean;
  audit_owners: string[]; deliver_by: string; fallback_tier: number; sort_order: number;
};
type SeedSku = {
  id: string; kit_id: string; delivery: string; lens: string | null; price_cents: number;
  status: string; deliver_by: string; stripe_product_name: string; note?: string;
};
type Seed = {
  categories: Array<{ id: string; display_name: string; tagline: string; season_start: string; season_end: string; sort_order: number; status: string; category_rules?: string[] }>;
  kits: SeedKit[];
  skus: SeedSku[];
};

const seed: Seed = JSON.parse(readFileSync(resolve(process.cwd(), "supabase/seed/holidayz-catalog-seed.json"), "utf8"));

// Existing Winter Light kits, added so lens SKUs can reference them (spec §9.1).
const winterLightKits: SeedKit[] = [
  { id: "wl-make", category_id: "winter-light", display_name: "Winter Light Make", format: "make", audience: ["family", "teen"],
    summary: "The founding-season make kit.", contents: [], lens_available: true, audit_owners: [], deliver_by: "2026-10-15", fallback_tier: 1, sort_order: 1 },
  { id: "wl-practice", category_id: "winter-light", display_name: "Winter Light Practice", format: "practice", audience: ["family", "teen"],
    summary: "The founding-season practice kit.", contents: [], lens_available: true, audit_owners: [], deliver_by: "2026-10-15", fallback_tier: 1, sort_order: 2 },
];

const categories = seed.categories.map((c) => ({
  id: c.id, display_name: c.display_name, tagline: c.tagline, season_start: c.season_start, season_end: c.season_end,
  sort_order: c.sort_order, status: c.status, category_rules: c.category_rules ?? [],
}));

const kits = [...winterLightKits, ...seed.kits].map((k) => ({
  id: k.id, category_id: k.category_id, display_name: k.display_name, format: k.format, domain: k.domain ?? null,
  audience: k.audience, summary: k.summary, contents: k.contents, lens_available: k.lens_available,
  audit_owners: k.audit_owners, deliver_by: k.deliver_by, fallback_tier: k.fallback_tier, sort_order: k.sort_order,
}));

// Discreet SKUs (Whole Table or lens) get neutral, numbered file names. Others get a readable one.
let discreetN = 0;
const skus = seed.skus.map((s) => {
  const discreet = s.kit_id.startsWith("wt-") || s.lens === "affirming";
  const file_name = discreet ? `holidayz-winter-kit-${String(++discreetN).padStart(2, "0")}.pdf` : `${s.id}.pdf`;
  return {
    id: s.id, kit_id: s.kit_id, delivery: s.delivery, lens: s.lens, price_cents: s.price_cents, currency: "usd",
    stripe_product_name: s.stripe_product_name, file_name, status: s.status, deliver_by: s.deliver_by,
  };
});

const JSONB_COLS = new Set(["contents", "design_standards", "asks"]);

function lit(v: unknown, col?: string): string {
  if (v === null || v === undefined) return "null";
  if (col && JSONB_COLS.has(col)) return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `array[${v.map((x) => lit(x)).join(",")}]::text[]`;
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

function upsertSql(table: string, rows: Record<string, unknown>[]): string {
  const cols = Object.keys(rows[0]);
  const values = rows.map((r) => `(${cols.map((c) => lit(r[c], c)).join(", ")})`).join(",\n  ");
  const sets = cols.filter((c) => c !== "id").map((c) => `${c} = excluded.${c}`).join(", ");
  return `insert into public.${table} (${cols.join(", ")}) values\n  ${values}\non conflict (id) do update set ${sets};`;
}

async function main() {
  if (process.argv.includes("--sql")) {
    console.log("begin;");
    console.log(upsertSql("catalog_categories", categories));
    console.log(upsertSql("catalog_kits", kits));
    console.log(upsertSql("catalog_skus", skus));
    console.log("commit;");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or run with --sql).");
  const db = createClient(url, key, { auth: { persistSession: false } });

  const batches: Array<[string, Record<string, unknown>[]]> = [
    ["catalog_categories", categories],
    ["catalog_kits", kits],
    ["catalog_skus", skus],
  ];
  for (const [table, rows] of batches) {
    const { error } = await db.from(table).upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`${table}: ${error.message}`);
    console.log(`${table}: upserted ${rows.length} rows`);
  }

  const counts = await Promise.all(
    ["catalog_categories", "catalog_kits", "catalog_skus"].map(async (t) => {
      const { count } = await db.from(t).select("*", { count: "exact", head: true });
      return `${t}=${count}`;
    }),
  );
  console.log("totals:", counts.join(" "));
}

main().catch((e) => { console.error(e); process.exit(1); });
