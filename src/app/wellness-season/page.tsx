import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogV2Enabled } from "@/lib/flags";
import { getCategory, getKits, getSkusForKits, type Kit } from "@/lib/catalog";
import { KitCard } from "@/components/KitGrid";
import { NotTherapyCard, LensCallout } from "@/components/Cards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wellness Season", description: "Thanksgiving to New Year kits for the one window the whole family is already gathered." };

/** Calendar layout (spec §4): kits fall into windows by deliver_by date. */
const WINDOWS = [
  { key: "thanksgiving", label: "Thanksgiving week", dates: "November 15 onward", match: (k: Kit) => (k.deliver_by ?? "") <= "2026-11-30" },
  { key: "december", label: "December", dates: "December 1 onward", match: (k: Kit) => (k.deliver_by ?? "") > "2026-11-30" && (k.deliver_by ?? "") < "2026-12-12" },
  { key: "kwanzaa", label: "Kwanzaa & New Year week", dates: "December 12 onward", match: (k: Kit) => (k.deliver_by ?? "") >= "2026-12-12" },
];

export default async function WellnessSeasonPage() {
  if (!catalogV2Enabled()) notFound();
  const category = await getCategory("wellness-season");
  if (!category) notFound();
  const kits = await getKits("wellness-season");
  const skus = await getSkusForKits(kits.map((k) => k.id));
  const baseByKit = new Map(skus.filter((s) => s.lens === null && s.delivery === "digital").map((s) => [s.kit_id, s]));
  const singles = kits.filter((k) => k.format !== "bundle");
  const bundles = kits.filter((k) => k.format === "bundle");

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">{category.display_name}</h1>
        <p className="text-lg text-muted max-w-2xl">{category.tagline}</p>
        <p className="max-w-2xl">
          Six practices for the window the whole family is already gathered: nourishment, mind, steadiness, the
          teen&rsquo;s own room, family weather, and legacy across generations.
        </p>
      </header>

      <NotTherapyCard />

      <section aria-labelledby="calendar-heading" className="space-y-8">
        <h2 id="calendar-heading" className="text-sm font-semibold uppercase tracking-wide text-muted">The season, in order</h2>
        <ol className="space-y-8">
          {WINDOWS.map((w) => {
            const inWindow = singles.filter(w.match);
            if (inWindow.length === 0) return null;
            return (
              <li key={w.key} className="grid gap-4 md:grid-cols-[12rem_1fr]">
                <div>
                  <h3 className="text-xl font-semibold">{w.label}</h3>
                  <p className="text-sm text-muted">{w.dates}</p>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {inWindow.map((k) => <KitCard key={k.id} kit={k} sku={baseByKit.get(k.id)} />)}
                </ul>
              </li>
            );
          })}
        </ol>
      </section>

      {bundles.length > 0 && (
        <section aria-labelledby="bundle-heading">
          <h2 id="bundle-heading" className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">The whole season</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {bundles.map((k) => <KitCard key={k.id} kit={k} sku={baseByKit.get(k.id)} />)}
          </ul>
        </section>
      )}

      <LensCallout />
    </div>
  );
}
