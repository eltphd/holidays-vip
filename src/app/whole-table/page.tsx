import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogV2Enabled } from "@/lib/flags";
import { getCategory, getKits, getSkusForKits } from "@/lib/catalog";
import { KitGrid } from "@/components/KitGrid";
import { DiscreetDeliveryCard, LensCallout } from "@/components/Cards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Whole Table", description: "Kwanzaa and winter-break kits for Black families where LGBTQIA+ people are at the table." };

export default async function WholeTablePage() {
  if (!catalogV2Enabled()) notFound();
  const category = await getCategory("whole-table");
  if (!category) notFound();
  const kits = await getKits("whole-table");
  const skus = await getSkusForKits(kits.map((k) => k.id));

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">{category.display_name}</h1>
        <p className="text-lg text-muted max-w-2xl">{category.tagline}</p>
        <p className="max-w-2xl">
          Kits for Black families where LGBTQIA+ people are at the table: the affirming host, the adult child coming
          home, the couple hosting chosen family, the elder carrying legacy.
        </p>
      </header>

      <DiscreetDeliveryCard />

      <section aria-labelledby="kits-heading">
        <h2 id="kits-heading" className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">The kits</h2>
        <KitGrid kits={kits} skus={skus} />
      </section>

      <LensCallout />
    </div>
  );
}
