import { NextResponse } from "next/server";

/** Operator status: which integrations are configured (presence only, never values). Requires CRON_SECRET. */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const has = (k: string) => Boolean(process.env[k] && process.env[k]!.length > 8);
  return NextResponse.json({
    catalog_v2: process.env.NEXT_PUBLIC_CATALOG_V2 === "true",
    supabase_service_role: has("SUPABASE_SERVICE_ROLE_KEY"),
    stripe_secret_key: has("STRIPE_SECRET_KEY"),
    stripe_webhook_secret: has("STRIPE_WEBHOOK_SECRET"),
    resend_api_key: has("RESEND_API_KEY"),
    files_base_url: has("FILES_BASE_URL"),
    mail_from: process.env.MAIL_FROM ?? "holidayz.vip <hello@us-squared.org> (default)",
    site_url: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    vercel_env: process.env.VERCEL_ENV ?? "local",
  });
}
