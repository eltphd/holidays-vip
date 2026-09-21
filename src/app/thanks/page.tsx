import type { Metadata } from "next";
import Link from "next/link";
import { getSku, formatDate, isDiscreet } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

/** The six original Winter Light payment links carry these metadata.sku values (created before the catalog tables). */
const WINTER_LIGHT: Record<string, { name: string; line: string }> = {
  "make-digital": { name: "Winter Light Make (digital)", line: "Your files arrive by email on October 15, 2026." },
  "practice-digital": { name: "Winter Light Practice (digital)", line: "Your files arrive by email on October 15, 2026." },
  "make-print": { name: "Winter Light Make (print)", line: "Digital files arrive by email on October 15; your box ships by December 12 (orders placed by December 5)." },
  "practice-print": { name: "Winter Light Practice (print)", line: "Digital files arrive by email on October 15; your box ships by December 12 (orders placed by December 5)." },
  complete: { name: "Winter Light Complete", line: "Digital files arrive by email on October 15; your box ships by December 12 (orders placed by December 5)." },
  "complete-gift": { name: "Winter Light Complete + Gift", line: "Digital files arrive by email on October 15, and the box ships gift-ready by December 12." },
};

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ sku?: string }> }) {
  const { sku: skuId } = await searchParams;
  const wl = skuId ? WINTER_LIGHT[skuId] : undefined;
  const sku = skuId && !wl ? await getSku(skuId).catch(() => null) : null;
  const discreet = sku ? isDiscreet(sku, sku.kit.category_id) : false;

  if (wl) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">Habari Gani, and thank you for being a first light.</h1>
        <p className="text-lg">This is a pre-order for <strong>{wl.name}</strong>. {wl.line}</p>
        <p>The one rule in this house: anyone can pass. &mdash; Altered Earth Press</p>
        <p className="text-sm text-muted">
          Questions: <a href="mailto:hello@us-squared.org" className="underline">hello@us-squared.org</a>. <Link href="/" className="underline">Back to holidayz.vip</Link>
        </p>
      </div>
    );
  }

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
