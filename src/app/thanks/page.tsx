import type { Metadata } from "next";
import Link from "next/link";
import { getSku, formatDate, isDiscreet } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ sku?: string }> }) {
  const { sku: skuId } = await searchParams;
  const sku = skuId ? await getSku(skuId).catch(() => null) : null;
  const discreet = sku ? isDiscreet(sku, sku.kit.category_id) : false;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Thank you.</h1>
      {sku ? (
        <>
          <p className="text-lg">
            {discreet ? "Your holidayz.vip kit" : sku.kit.display_name} is on its way. Files arrive by email on{" "}
            <strong>{formatDate(sku.deliver_by ?? sku.kit.deliver_by)}</strong>.
          </p>
          {discreet && (
            <aside className="rounded-lg border border-border bg-soft p-4 text-sm space-y-1">
              <p className="font-semibold">Discreet delivery is on for this order.</p>
              <p>Your receipt says &ldquo;{sku.stripe_product_name ?? "holidayz.vip kit"}&rdquo;. The email will come from hello@us-squared.org with the subject &ldquo;Your holidayz.vip kit&rdquo;, and the file is named {sku.file_name ?? "holidayz-winter-kit.pdf"}.</p>
            </aside>
          )}
          {sku.lens === "affirming" && !discreet && <p className="text-sm text-muted">Affirming lens insert included.</p>}
        </>
      ) : (
        <p className="text-lg">Your order is confirmed. Files arrive by email on the delivery date shown at checkout.</p>
      )}
      <p className="text-sm text-muted">
        Questions: <a href="mailto:hello@us-squared.org" className="underline">hello@us-squared.org</a>. <Link href="/" className="underline">Back to holidayz.vip</Link>
      </p>
    </div>
  );
}
