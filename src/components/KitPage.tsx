import Link from "next/link";
import type { Category, Kit, Sku } from "@/lib/catalog";
import { formatDate, kitHref } from "@/lib/catalog";
import { BuyBox } from "./BuyBox";
import { StandardsStrip } from "./StandardsStrip";
import { DiscreetDeliveryCard, NotTherapyCard } from "./Cards";

interface Props {
  category: Category;
  kit: Kit;
  skus: Sku[];
  bundleKits?: Kit[]; // resolved kits when kit.format === 'bundle'
}

const AUDIENCE_LABEL: Record<string, string> = {
  host: "Hosts", "gift-giver": "Gift-givers", "adult-child": "Adult children", parent: "Parents", couple: "Couples",
  "chosen-family-host": "Chosen-family hosts", elder: "Elders", family: "Whole family", household: "Households",
  cook: "Cooks", teen: "Teens", adult: "Adults", guest: "Guests",
};

/** One template, all kits (spec §5 contract). */
export function KitPage({ category, kit, skus, bundleKits = [] }: Props) {
  const digital = skus.filter((s) => s.delivery === "digital");
  const base = digital.find((s) => s.lens === null) ?? null;
  const lens = digital.find((s) => s.lens === "affirming") ?? null;
  const preorderOpen = !!base && base.status !== "hidden";
  const isWholeTable = category.id === "whole-table";
  const isWellness = category.id === "wellness-season";
  const asks = kit.asks ?? {};
  const bundleById = new Map(bundleKits.map((k) => [k.id, k]));

  return (
    <article className="space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href={`/${category.id}`} className="underline">{category.display_name}</Link> / {kit.display_name}
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{kit.display_name}</h1>
        {kit.summary && <p className="text-lg text-muted max-w-2xl">{kit.summary}</p>}
        <ul aria-label="Audience" className="flex flex-wrap gap-2">
          {kit.audience.map((a) => (
            <li key={a} className="rounded-full border border-border bg-card px-3 py-1 text-xs">{AUDIENCE_LABEL[a] ?? a}</li>
          ))}
          <li className="rounded-full border border-border bg-soft px-3 py-1 text-xs capitalize">{kit.format}</li>
          {kit.domain && <li className="rounded-full border border-border bg-soft px-3 py-1 text-xs">{kit.domain.replace(/-/g, " ")}</li>}
        </ul>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          <section aria-labelledby="contents-heading">
            <h2 id="contents-heading" className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">What&rsquo;s in it</h2>
            <ol className="space-y-2">
              {kit.contents.map((c, i) => {
                const child = bundleById.get(c);
                return (
                  <li key={i} className="rounded-lg border border-border bg-card p-3">
                    {child ? (
                      <Link href={kitHref(child)} className="underline">{child.display_name}</Link>
                    ) : (
                      c
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          <StandardsStrip overrides={kit.design_standards} />

          <section aria-labelledby="asks-heading">
            <h2 id="asks-heading" className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">What this asks of you</h2>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <dt className="text-xs text-muted">Time</dt>
                <dd className="font-medium">{asks.minutes ? `${asks.minutes} minutes` : "Set at audit round 1"}</dd>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <dt className="text-xs text-muted">Sensory</dt>
                <dd className="font-medium">{asks.sensory ?? "Set at audit round 1"}</dd>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <dt className="text-xs text-muted">Low-demand version</dt>
                <dd className="font-medium">{asks.low_demand ?? "Every activity has one"}</dd>
              </div>
            </dl>
          </section>

          {isWholeTable && <DiscreetDeliveryCard />}
          {isWellness && <NotTherapyCard />}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 self-start">
          <BuyBox base={base} lens={lens} lensAvailable={kit.lens_available} preorderOpen={preorderOpen} />
          <p className="text-xs text-muted">
            Files delivered by email on {formatDate(kit.deliver_by)}.
            {(isWholeTable || lens) && " Discreet delivery on every kit here."}
          </p>
          {kit.lens_available && (
            <Link href="/lens/affirming" className="text-sm underline">About the affirming lens</Link>
          )}
        </aside>
      </div>
    </article>
  );
}
