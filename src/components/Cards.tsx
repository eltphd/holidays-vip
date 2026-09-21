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

/** Wellness Season: visible before purchase on every kit page (category rule). */
export function NotTherapyCard() {
  return (
    <aside aria-labelledby="not-therapy-heading" className="rounded-lg border border-border bg-soft p-4">
      <h2 id="not-therapy-heading" className="font-semibold">This isn&rsquo;t therapy</h2>
      <p className="mt-1 text-sm">
        These are practices, not treatment. We name where each one comes from; we don&rsquo;t promise what it will do.
        If someone at your table needs more than a practice, reach for a professional. If it&rsquo;s urgent, call or text
        988 (Suicide &amp; Crisis Lifeline, US).
      </p>
      <p className="mt-2 text-xs text-muted">Additional warmline numbers are confirmed before publish (see spec §7).</p>
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
