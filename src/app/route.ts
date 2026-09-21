import { readFileSync } from "node:fs";
import { join } from "node:path";
import { catalogV2Enabled } from "@/lib/flags";
import { getCategories, type Category } from "@/lib/catalog";

/**
 * Home = the live Winter Light page (src/winter-light/index.html), served verbatim.
 * Behind NEXT_PUBLIC_CATALOG_V2 it gains nav links and a "This season" tile strip
 * under the Winter Light kit section (spec §5), rendered from catalog_categories.
 */
export const dynamic = "force-dynamic";

const HTML_PATH = join(process.cwd(), "src", "winter-light", "index.html");

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CATEGORY_COPY: Record<string, { eyebrow: string; blurb: string }> = {
  "whole-table": {
    eyebrow: "Category 2 · LGBTQIA+",
    blurb: "Kwanzaa and winter-break kits for Black families where LGBTQIA+ people are at the table. Discreet delivery on every kit.",
  },
  "wellness-season": {
    eyebrow: "Category 3 · Thanksgiving to New Year",
    blurb: "Nourishment, mind, steadiness, the teen's own room, family weather, and legacy. Practices, not treatment.",
  },
};

function tilesSection(categories: Category[]): string {
  const tiles = categories
    .map((c) => {
      const copy = CATEGORY_COPY[c.id] ?? { eyebrow: c.display_name, blurb: c.tagline ?? "" };
      return `      <article class="tier">
        <div class="eyebrow">${esc(copy.eyebrow)}</div>
        <div class="name">${esc(c.display_name)}</div>
        <p class="kit-intro" style="margin:8px 0 12px">${esc(c.tagline ?? "")}</p>
        <ul><li>${esc(copy.blurb)}</li></ul>
        <div class="buy"><a class="btn btn-outline" href="/${esc(c.id)}">See the kits</a></div>
      </article>`;
    })
    .join("\n");
  return `
<section id="catalog" class="band">
  <div class="wrap">
    <div class="kit-head">
      <div>
        <div class="eyebrow">Also this season · digital kits</div>
        <h2>Two more doors into the same house</h2>
      </div>
      <div class="ship">Pre-orders open Oct 26 · Files from Nov 15</div>
    </div>
    <div class="tiers">
${tiles}
    </div>
  </div>
</section>
`;
}

export async function GET() {
  let html = readFileSync(HTML_PATH, "utf8");

  if (catalogV2Enabled()) {
    let categories: Category[] = [];
    try {
      categories = await getCategories(["whole-table", "wellness-season"]);
    } catch (e) {
      console.error("home: category fetch failed", e);
    }
    if (categories.length > 0) {
      const navLinks = categories.map((c) => `<a href="/${esc(c.id)}">${esc(c.display_name)}</a>`).join("");
      html = html.replace('<a href="#orgs">For organizations</a>', `${navLinks}<a href="#orgs">For organizations</a>`);
      html = html.replace('<section id="experiences"', `${tilesSection(categories)}\n<section id="experiences"`);
    }
  }

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" },
  });
}
