import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { sendDelivery } from "@/lib/mailer";

/**
 * Daily: send the download email for every paid order whose deliver_by has arrived.
 * Protected by CRON_SECRET (Vercel sets Authorization: Bearer <CRON_SECRET> on cron calls).
 * Download URLs are FILES_BASE_URL/<file_name>; swap for signed URLs when files move to Blob/Storage.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const base = process.env.FILES_BASE_URL;
  if (!base) return NextResponse.json({ error: "FILES_BASE_URL not set" }, { status: 500 });

  const db = supabaseServer();
  const today = new Date().toISOString().slice(0, 10);
  const { data: orders, error } = await db
    .from("holidayz_orders")
    .select("id, email, sku, discreet, deliver_by")
    .eq("status", "paid")
    .is("delivered_at", null)
    .not("deliver_by", "is", null)
    .lte("deliver_by", today)
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: Array<{ id: string; ok: boolean; reason?: string }> = [];
  for (const o of orders ?? []) {
    if (!o.email) { results.push({ id: o.id, ok: false, reason: "no email" }); continue; }
    const { data: sku } = await db.from("catalog_skus").select("file_name, kit:catalog_kits(display_name)").eq("id", o.sku).maybeSingle();
    if (!sku?.file_name) { results.push({ id: o.id, ok: false, reason: "no file_name" }); continue; }
    const kit = sku.kit as unknown as { display_name: string } | null;
    try {
      const r = await sendDelivery({
        to: o.email,
        discreet: o.discreet,
        kitName: kit?.display_name ?? "holidayz.vip",
        fileName: sku.file_name,
        downloadUrl: `${base.replace(/\/$/, "")}/${sku.file_name}`,
      });
      if (r.sent) await db.from("holidayz_orders").update({ delivered_at: new Date().toISOString() }).eq("id", o.id);
      results.push({ id: o.id, ok: r.sent, reason: r.sent ? undefined : "mailer dry-run" });
    } catch (e) {
      results.push({ id: o.id, ok: false, reason: (e as Error).message });
    }
  }
  return NextResponse.json({ date: today, processed: results.length, results });
}
