import { supabaseServer } from "./supabase";

export type CategoryId = "winter-light" | "whole-table" | "wellness-season";

export interface Category {
  id: CategoryId;
  display_name: string;
  tagline: string | null;
  season_start: string | null;
  season_end: string | null;
  sort_order: number;
  status: "draft" | "audit" | "live" | "archived";
  category_rules: string[];
}

export interface KitAsks {
  minutes?: number;
  sensory?: string;
  low_demand?: string;
}

export interface Kit {
  id: string;
  category_id: CategoryId;
  display_name: string;
  format: "make" | "practice" | "bundle";
  domain: string | null;
  audience: string[];
  summary: string | null;
  contents: string[];
  design_standards: Record<string, string>;
  asks: KitAsks;
  lens_available: boolean;
  audit_owners: string[];
  audit_status: "draft" | "round1" | "revising" | "round2" | "approved" | "live";
  deliver_by: string | null;
  fallback_tier: number | null;
  sort_order: number;
}

export interface Sku {
  id: string;
  kit_id: string;
  delivery: "digital" | "print" | "print-digital";
  lens: "affirming" | null;
  price_cents: number;
  currency: string;
  stripe_product_name: string | null;
  stripe_payment_link: string | null;
  stripe_payment_url: string | null;
  file_name: string | null;
  status: "hidden" | "preorder" | "live" | "retired";
  deliver_by: string | null;
}

/** Kit ids are prefixed by category (wt-, ws-, wl-); URLs drop the prefix. */
const PREFIX: Record<CategoryId, string> = {
  "winter-light": "wl",
  "whole-table": "wt",
  "wellness-season": "ws",
};

export function kitSlug(kit: Pick<Kit, "id" | "category_id">): string {
  const p = `${PREFIX[kit.category_id]}-`;
  return kit.id.startsWith(p) ? kit.id.slice(p.length) : kit.id;
}

export function kitHref(kit: Pick<Kit, "id" | "category_id">): string {
  return `/${kit.category_id}/${kitSlug(kit)}`;
}

export function kitIdFromSlug(categoryId: CategoryId, slug: string): string {
  const p = `${PREFIX[categoryId]}-`;
  return slug.startsWith(p) ? slug : `${p}${slug}`;
}

export function formatPrice(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: 0 }).format(cents / 100);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "TBD";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** A SKU is discreet when it belongs to Whole Table or carries the affirming lens. */
export function isDiscreet(sku: Pick<Sku, "lens">, categoryId: CategoryId): boolean {
  return categoryId === "whole-table" || sku.lens === "affirming";
}

export async function getCategory(id: CategoryId): Promise<Category | null> {
  const { data, error } = await supabaseServer().from("catalog_categories").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Category) ?? null;
}

export async function getCategories(ids?: CategoryId[]): Promise<Category[]> {
  let q = supabaseServer().from("catalog_categories").select("*").neq("status", "archived").order("sort_order");
  if (ids) q = q.in("id", ids);
  const { data, error } = await q;
  if (error) throw error;
  return (data as Category[]) ?? [];
}

export async function getKits(categoryId: CategoryId): Promise<Kit[]> {
  const { data, error } = await supabaseServer().from("catalog_kits").select("*").eq("category_id", categoryId).order("sort_order");
  if (error) throw error;
  return (data as Kit[]) ?? [];
}

export async function getKit(categoryId: CategoryId, slug: string): Promise<Kit | null> {
  const { data, error } = await supabaseServer()
    .from("catalog_kits")
    .select("*")
    .eq("id", kitIdFromSlug(categoryId, slug))
    .eq("category_id", categoryId)
    .maybeSingle();
  if (error) throw error;
  return (data as Kit) ?? null;
}

export async function getKitsByIds(ids: string[]): Promise<Kit[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabaseServer().from("catalog_kits").select("*").in("id", ids);
  if (error) throw error;
  return (data as Kit[]) ?? [];
}

export async function getSkus(kitId: string): Promise<Sku[]> {
  const { data, error } = await supabaseServer()
    .from("catalog_skus")
    .select("*")
    .eq("kit_id", kitId)
    .neq("status", "retired")
    .order("lens", { nullsFirst: true });
  if (error) throw error;
  return (data as Sku[]) ?? [];
}

export async function getSkusForKits(kitIds: string[]): Promise<Sku[]> {
  if (kitIds.length === 0) return [];
  const { data, error } = await supabaseServer().from("catalog_skus").select("*").in("kit_id", kitIds).neq("status", "retired");
  if (error) throw error;
  return (data as Sku[]) ?? [];
}

export async function getSku(id: string): Promise<(Sku & { kit: Kit }) | null> {
  const { data, error } = await supabaseServer().from("catalog_skus").select("*, kit:catalog_kits(*)").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as (Sku & { kit: Kit })) ?? null;
}

export interface Builder {
  id: string;
  handle: string;
  lens_roles: string[];
  credit_choice: "named" | "first-name" | "anonymous";
  credit_name: string | null;
}

export async function getCreditedBuilders(): Promise<Builder[]> {
  const { data, error } = await supabaseServer()
    .from("auditors")
    .select("id, handle, lens_roles, credit_choice, credit_name")
    .neq("credit_choice", "anonymous")
    .not("consent_signed_at", "is", null)
    .order("handle");
  if (error) throw error;
  return (data as Builder[]) ?? [];
}
