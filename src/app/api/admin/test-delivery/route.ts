import { NextResponse } from "next/server";
import { sendDelivery } from "@/lib/mailer";

/**
 * Operator check: send one delivery email to an address you control, in discreet or named mode,
 * to confirm sender, subject, and body before real orders flow. Requires CRON_SECRET.
 *   GET /api/admin/test-delivery?to=you@example.com&discreet=1
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  if (!to || !to.includes("@")) return NextResponse.json({ error: "to= required" }, { status: 400 });
  const discreet = url.searchParams.get("discreet") === "1";
  try {
    const r = await sendDelivery({
      to,
      discreet,
      kitName: "Nourish",
      fileName: discreet ? "holidayz-winter-kit-01.pdf" : "ws-nourish-digital.pdf",
      downloadUrl: "https://www.holidayz.vip/thanks?sku=test",
    });
    return NextResponse.json({ ok: true, ...r, discreet, to });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
