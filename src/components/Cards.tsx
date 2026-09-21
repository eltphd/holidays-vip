import Link from "next/link";

/** Whole Table: shown above the fold on the category page and before purchase on every kit page. */
export function DiscreetDeliveryCard({ compact = false }: { compact?: boolean }) {
  return (
    <aside aria-labelledby="discreet-heading" className="rounded-lg border border-border bg-soft p-4">
      <h2 id="discreet-heading" className="font-semibold">Discreet delivery, always</h2>
      <p className="mt-1 text-sm">
        Every Whole Table kit and every affirming-lens kit ships in discreet mode: a neutral email subject, neutral
        file names, a neutral line on your receipt, and cover art that reads as a winter kit. Nothing in it asks
        anyone to come out, be outed, or explain themselves.
      </p>
      {!compact && (
        <ul className="mt-3 grid gap-1 text-sm text-muted sm:grid-cols-2">
          <li>Email subject: &ldquo;Your holidayz.vip kit&rdquo;</li>
          <li>Sender: hello@us-squared.org</li>
          <li>Receipt line: &ldquo;holidayz.vip kit&rdquo;</li>
          <li>File name: holidayz-winter-kit-##.pdf</li>
        </ul>
      )}
    </aside>
  );
}

/** Wellness Season: visible before purchase on every kit page (category rule).
 *  Numbers verified against each organization's own site on 2026-09-21. Re-verify before each season. */
export function NotTherapyCard() {
  return (
    <aside aria-labelledby="not-therapy-heading" className="rounded-lg border border-border bg-soft p-4">
      <h2 id="not-therapy-heading" className="font-semibold">This isn&rsquo;t therapy</h2>
      <p className="mt-1 text-sm">
        These are practices, not treatment. We name where each one comes from; we don&rsquo;t promise what it will do.
        If someone at your table needs more than a practice, reach for a professional. The one rule in this house:
        anyone can pass.
      </p>
      <p className="mt-3 text-sm font-medium">If it&rsquo;s heavier than a practice can hold, these are people who pick up:</p>
      <ul className="mt-1 space-y-1 text-sm">
        <li>
          <span className="font-medium">988 Suicide &amp; Crisis Lifeline</span> &mdash; call or text{" "}
          <a href="tel:988" className="underline">988</a>, any hour.
        </li>
        <li>
          <span className="font-medium">Call BlackLine</span> &mdash;{" "}
          <a href="tel:+18006045841" className="underline">1-800-604-5841</a>. Peer support by us, for us, with an
          LGBTQ+ Black femme lens.
        </li>
        <li>
          <span className="font-medium">Trans Lifeline</span> &mdash;{" "}
          <a href="tel:+18775658860" className="underline">877-565-8860</a>. Run by trans people, for trans people.
          Weekdays, 1&ndash;9 PM Eastern.
        </li>
      </ul>
    </aside>
  );
}

export function LensCallout() {
  return (
    <aside className="rounded-lg border border-border bg-card p-4">
      <h2 className="font-semibold">Affirming family lens · +$0</h2>
      <p className="mt-1 text-sm text-muted">
        Tick the lens on any Winter Light or Wellness Season kit to add a 4-page affirming prompt insert, the host
        scripts from Open House, and discreet delivery. Safety is a feature, not a fee.
      </p>
      <Link href="/lens/affirming" className="mt-2 inline-block text-sm underline">How the lens works</Link>
    </aside>
  );
}
