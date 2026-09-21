import Link from "next/link";
import type { Kit, Sku } from "@/lib/catalog";
import { formatPrice, kitHref } from "@/lib/catalog";

export function KitCard({ kit, sku }: { kit: Kit; sku?: Sku }) {
  return (
    <li className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold">
          <Link href={kitHref(kit)} className="hover:underline">{kit.display_name}</Link>
        </h3>
        {sku && <span className="text-sm font-medium">{formatPrice(sku.price_cents, sku.currency)}</span>}
      </div>
      {kit.summary && <p className="text-sm text-muted">{kit.summary}</p>}
      <p className="mt-auto pt-2 text-xs text-muted capitalize">
        {kit.format}{kit.lens_available ? " · lens available" : ""}
      </p>
    </li>
  );
}

export function KitGrid({ kits, skus }: { kits: Kit[]; skus: Sku[] }) {
  const baseByKit = new Map(skus.filter((s) => s.lens === null && s.delivery === "digital").map((s) => [s.kit_id, s]));
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {kits.map((k) => <KitCard key={k.id} kit={k} sku={baseByKit.get(k.id)} />)}
    </ul>
  );
}
