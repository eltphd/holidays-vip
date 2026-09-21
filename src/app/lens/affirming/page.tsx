import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogV2Enabled } from "@/lib/flags";
import { getKitsByIds, kitHref } from "@/lib/catalog";
import { DiscreetDeliveryCard } from "@/components/Cards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Affirming family lens", description: "A +$0 variant on any Winter Light or Wellness Season kit." };

const AVAILABLE_ON = ["wl-make", "wl-practice", "ws-nourish", "ws-mind-lanterns", "ws-steady", "ws-teen-room", "ws-family-weather", "ws-legacy-table", "ws-complete"];

export default async function LensPage() {
  if (!catalogV2Enabled()) notFound();
  const kits = await getKitsByIds(AVAILABLE_ON);

  return (
    <div className="space-y-8 max-w-3xl">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">The affirming family lens</h1>
        <p className="text-lg text-muted">A checkbox, not an upsell. Same kit, same price, built for a table where LGBTQIA+ people are already welcome.</p>
      </header>

      <section aria-labelledby="adds-heading" className="space-y-2">
        <h2 id="adds-heading" className="text-xl font-semibold">What it adds</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>A 4-page insert of affirming prompts matched to the kit you chose.</li>
          <li>The host scripts from Open House, for the relative who says something.</li>
          <li>Discreet-delivery mode on the whole order.</li>
        </ul>
      </section>

      <DiscreetDeliveryCard />

      <section aria-labelledby="on-heading" className="space-y-2">
        <h2 id="on-heading" className="text-xl font-semibold">Available on</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {kits.map((k) => (
            <li key={k.id} className="rounded-lg border border-border bg-card p-3">
              {k.category_id === "winter-light" ? (
                <span>{k.display_name}</span>
              ) : (
                <Link href={kitHref(k)} className="underline">{k.display_name}</Link>
              )}
              <span className="block text-xs text-muted">{k.category_id.replace("-", " ")}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">Wellness Season lens variants switch on as each kit clears community audit.</p>
        <p className="text-sm text-muted">
          Organizations: the lens is a named option on the ERG Heritage Day package, at the same price, with the same
          discreet handling. Ask for it by name or just tick the box on the one-pager.
        </p>
      </section>
    </div>
  );
}
