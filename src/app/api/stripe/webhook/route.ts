import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabase";

/**
 * checkout.session.completed → holidayz_orders row (spec §5 fulfilment).
 * Reads sku from the payment link's metadata (set by scripts/create-stripe-links.ts),
 * resolves deliver_by + discreet from catalog_skus, and upserts on stripe_session_id.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "webhook not configured" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    // Static verifier: needs only the endpoint signing secret, not the account secret key.
    event = Stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `signature: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true });

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};
  const skuId = meta.sku ?? null;
  const db = supabaseServer();

  let deliverBy: string | null = null;
  let discreet = false;
  let lens: string | null = null;
  let categoryId: string | null = meta.category ?? null;

  if (skuId) {
    const { data: sku } = await db
      .from("catalog_skus")
      .select("deliver_by, lens, kit:catalog_kits(category_id)")
      .eq("id", skuId)
      .maybeSingle();
    if (sku) {
      deliverBy = sku.deliver_by;
      lens = sku.lens;
      const kit = sku.kit as unknown as { category_id: string } | null;
      categoryId = kit?.category_id ?? categoryId;
      discreet = categoryId === "whole-table" || lens === "affirming";
    }
  }

  const { error } = await db.from("holidayz_orders").upsert(
    {
      stripe_session_id: session.id,
      stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
      email: session.customer_details?.email ?? session.customer_email ?? null,
      name: session.customer_details?.name ?? null,
      sku: skuId ?? "unknown",
      amount_cents: session.amount_total ?? null,
      currency: session.currency ?? "usd",
      status: session.payment_status === "paid" ? "paid" : session.payment_status,
      category_id: categoryId,
      lens,
      discreet,
      deliver_by: deliverBy,
    },
    { onConflict: "stripe_session_id" },
  );

  if (error) {
    console.error("holidayz_orders upsert failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
