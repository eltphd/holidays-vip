import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogV2Enabled } from "@/lib/flags";
import { getCreditedBuilders } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Community builders", description: "The people who read these kits as themselves before anyone else did." };

const ROLE_LABEL: Record<string, string> = {
  "older-adult": "older adult", adolescent: "adolescent", adult: "adult", "gay-married": "married gay men",
  lesbian: "lesbian", trans: "trans", parent: "parent",
};

export default async function CommunityBuildersPage() {
  if (!catalogV2Enabled()) notFound();
  const builders = await getCreditedBuilders();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Community builders</h1>
      <p className="text-lg italic">Small lights that find each other.</p>
      <p className="text-lg text-muted">
        Whole Table and Wellness Season were read, marked up, and co-authored by community members before they
        shipped. Nobody is listed here by default; everyone below chose to be.
      </p>
      {builders.length === 0 ? (
        <p>Credits appear after audit round 2 closes.</p>
      ) : (
        <ul className="space-y-2">
          {builders.map((b) => (
            <li key={b.id} className="rounded-lg border border-border bg-card p-3">
              <span className="font-medium">{b.credit_choice === "named" && b.credit_name ? b.credit_name : b.handle}</span>
              <span className="block text-sm text-muted">{b.lens_roles.map((r) => ROLE_LABEL[r] ?? r).join(" · ")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
