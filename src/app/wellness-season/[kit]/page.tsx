import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogV2Enabled } from "@/lib/flags";
import { getCategory, getKit, getKitsByIds, getSkus } from "@/lib/catalog";
import { KitPage } from "@/components/KitPage";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ kit: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (!catalogV2Enabled()) return {};
  const { kit: slug } = await params;
  const kit = await getKit("wellness-season", slug).catch(() => null);
  return kit ? { title: `${kit.display_name} · Wellness Season`, description: kit.summary ?? undefined } : {};
}

export default async function WellnessKitPage({ params }: Params) {
  if (!catalogV2Enabled()) notFound();
  const { kit: slug } = await params;
  const [category, kit] = await Promise.all([getCategory("wellness-season"), getKit("wellness-season", slug)]);
  if (!category || !kit) notFound();
  const [skus, bundleKits] = await Promise.all([
    getSkus(kit.id),
    kit.format === "bundle" ? getKitsByIds(kit.contents) : Promise.resolve([]),
  ]);
  return <KitPage category={category} kit={kit} skus={skus} bundleKits={bundleKits} />;
}
