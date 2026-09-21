# Discreet-mode checklist (spec §7, acceptance §9.3)

Applies to every Whole Table SKU and every `lens = 'affirming'` SKU. A hostile relative who sees the email, the
receipt, the file, or the bank statement learns nothing.

| Surface | Required value | Where it's set | Verified by |
|---|---|---|---|
| Stripe product name (receipt line item, bank descriptor prefix) | `holidayz.vip kit` / `holidayz.vip kit bundle` | `catalog_skus.stripe_product_name` → `scripts/create-stripe-links.ts` (refuses non-neutral names) | Stripe test checkout receipt |
| Stripe statement descriptor | account-level, must read `HOLIDAYZ.VIP` or `US-SQUARED` (no category) | Stripe dashboard → Settings → Public details | Erica, once |
| Checkout page product name | same as product name | inherits from product | Test checkout |
| Success page (`/thanks`) | "Your holidayz.vip kit" + discreet confirmation, no kit name | `src/app/thanks/page.tsx` (`isDiscreet`) | Load `/thanks?sku=wt-open-house-digital` |
| Delivery email subject | `Your holidayz.vip kit` | `src/lib/mailer.ts` `renderDelivery` | Unit check + Resend log |
| Delivery email sender | `holidayz.vip <hello@us-squared.org>` | `MAIL_FROM` | Resend log |
| Delivery email body | no kit name, no category | `renderDelivery` (discreet branch) | Read it |
| File name | `holidayz-winter-kit-NN.pdf` | `catalog_skus.file_name` (seed loader assigns) | `select id, file_name from catalog_skus where kit_id like 'wt-%' or lens is not null` |
| PDF metadata (title/author/subject) | neutral title, no category | PDF export step (content team) | `exiftool` or Preview → Inspector |
| Cover art | reads as a winter kit | design | Auditor (trans lens) sign-off |
| `holidayz_orders.discreet` | `true` | webhook derives from category/lens | Query after test order |

Sign-off: one trans auditor + one dev, per SKU, before `catalog_skus.status` moves to `preorder`.
