/**
 * Loads community builders into public.auditors from a CSV that contains NO contact details.
 *   npm run auditors:load -- docs/audit/auditors.csv
 * Columns (see docs/audit/auditors-template.csv):
 *   handle,lens_roles,credit_choice,credit_name,compensation,is_minor,consent_signed_at,guardian_consent_at,contact_ref
 * Upserts on (handle, contact_ref). Refuses any column that looks like an email or phone.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"] });
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const ROLES = new Set(["older-adult", "adolescent", "adult", "gay-married", "lesbian", "trans", "parent"]);

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells: string[] = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) { cells.push(cur); cur = ""; }
      else cur += ch;
    }
    cells.push(cur);
    return Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? "").trim()]));
  });
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Usage: npm run auditors:load -- <csv>");
  const rows = parseCsv(readFileSync(file, "utf8"));
  for (const r of rows) {
    for (const [k, v] of Object.entries(r)) {
      const digits = v.replace(/\D/g, "").length;
      const looksLikeDate = /^\d{4}-\d{2}-\d{2}$/.test(v);
      if (/@/.test(v) || (digits >= 10 && !looksLikeDate)) throw new Error(`Row "${r.handle}": column ${k} looks like contact info. Contact details stay in Erica's private sheet.`);
    }
    const roles = r.lens_roles.split(";").map((s) => s.trim()).filter(Boolean);
    const bad = roles.filter((x) => !ROLES.has(x));
    if (bad.length) throw new Error(`Row "${r.handle}": unknown lens role(s) ${bad.join(", ")}`);
    if (!["named", "first-name", "anonymous"].includes(r.credit_choice)) throw new Error(`Row "${r.handle}": credit_choice must be named | first-name | anonymous`);
    if (!["honorarium", "kit-credit", "declined"].includes(r.compensation)) throw new Error(`Row "${r.handle}": compensation must be honorarium | kit-credit | declined`);
    if (r.is_minor === "true" && !r.guardian_consent_at) throw new Error(`Row "${r.handle}": minor without guardian_consent_at`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  const db = createClient(url, key, { auth: { persistSession: false } });

  for (const r of rows) {
    const record = {
      handle: r.handle,
      lens_roles: r.lens_roles.split(";").map((s) => s.trim()).filter(Boolean),
      credit_choice: r.credit_choice,
      credit_name: r.credit_choice === "named" ? r.credit_name || r.handle : null,
      compensation: r.compensation,
      is_minor: r.is_minor === "true",
      consent_signed_at: r.consent_signed_at || null,
      guardian_consent_at: r.guardian_consent_at || null,
      contact_ref: r.contact_ref || null,
    };
    const { data: existing } = await db.from("auditors").select("id").eq("handle", r.handle).eq("contact_ref", record.contact_ref).maybeSingle();
    const q = existing ? db.from("auditors").update(record).eq("id", existing.id) : db.from("auditors").insert(record);
    const { error } = await q;
    if (error) throw new Error(`${r.handle}: ${error.message}`);
    console.log(`${existing ? "updated" : "added"}  ${r.handle}  [${record.lens_roles.join(", ")}]  credit=${record.credit_choice}  pay=${record.compensation}${record.is_minor ? "  MINOR" : ""}`);
  }
  const { count } = await db.from("auditors").select("*", { count: "exact", head: true });
  console.log(`auditors total: ${count}`);
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
