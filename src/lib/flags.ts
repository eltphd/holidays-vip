/** Catalog v2 (Whole Table + Wellness Season) ships dark; flip NEXT_PUBLIC_CATALOG_V2=true on 2026-10-26. */
export function catalogV2Enabled(): boolean {
  return process.env.NEXT_PUBLIC_CATALOG_V2 === "true";
}

/** Categories that only exist behind the flag. */
export const FLAGGED_CATEGORIES = ["whole-table", "wellness-season"] as const;
