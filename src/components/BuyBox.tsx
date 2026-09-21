"use client";

import { useId, useState } from "react";
import type { Sku } from "@/lib/catalog";
import { formatPrice, formatDate } from "@/lib/catalog";

interface Props {
  base: Sku | null;
  lens: Sku | null;
  lensAvailable: boolean;
  preorderOpen: boolean;
}

/** Price + buy button + lens checkbox. Lens is a separate SKU row at the same price (+$0). */
export function BuyBox({ base, lens, lensAvailable, preorderOpen }: Props) {
  const [withLens, setWithLens] = useState(false);
  const id = useId();
  const active = withLens && lens ? lens : base;
  const url = active?.stripe_payment_url ?? null;
  const canBuy = preorderOpen && !!url && active?.status !== "hidden";

  if (!base) {
    return <p className="text-sm text-muted">Pricing lands when this kit reaches audit.</p>;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <p className="text-2xl font-semibold">{formatPrice(active!.price_cents, active!.currency)}</p>
      <p className="text-sm text-muted">Digital kit · delivered by {formatDate(active!.deliver_by)}</p>

      {lensAvailable && (
        <div className="flex items-start gap-2">
          <input
            id={`${id}-lens`}
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={withLens}
            disabled={!lens}
            onChange={(e) => setWithLens(e.target.checked)}
          />
          <label htmlFor={`${id}-lens`} className="text-sm">
            Add the affirming family lens (+$0)
            {!lens && <span className="block text-xs text-muted">Lens variant arrives when this kit is approved by the community audit.</span>}
          </label>
        </div>
      )}

      {canBuy ? (
        <a
          href={url!}
          className="inline-block rounded-md bg-accent px-5 py-2.5 font-medium text-accent-ink hover:opacity-90"
        >
          {active!.status === "preorder" ? "Pre-order" : "Buy"} {withLens ? "with lens" : ""}
        </a>
      ) : (
        <button type="button" disabled className="inline-block rounded-md bg-border px-5 py-2.5 font-medium text-muted cursor-not-allowed">
          Pre-orders open October 26
        </button>
      )}
      <p className="text-xs text-muted">Promo code FIRSTLIGHT applies at checkout.</p>
    </div>
  );
}
