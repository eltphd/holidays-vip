import { DESIGN_STANDARDS } from "@/lib/standards";

export function StandardsStrip({ overrides = {} }: { overrides?: Record<string, string> }) {
  return (
    <section aria-labelledby="standards-heading">
      <h2 id="standards-heading" className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">Built to six standards</h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DESIGN_STANDARDS.map((s, i) => (
          <li key={s.key} className="rounded-lg border border-border bg-card p-3 flex gap-3">
            <span aria-hidden="true" className="text-xl leading-none">{s.icon}</span>
            <div>
              <p className="font-medium">{i + 1}. {s.label}</p>
              <p className="text-sm text-muted">{overrides[s.key] ?? s.line}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
