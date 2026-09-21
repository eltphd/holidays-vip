# holidayz.vip — Work Session Brief · September 20–21, 2026

**Session focus:** Take the Catalog Dev Build v1 spec (Whole Table + Wellness Season) from a document to a live, wired, content-drafted product line on holidayz.vip, without touching what Winter Light buyers see.

**Bottom line:** As of tonight, holidayz.vip runs from a real codebase instead of a two-file static upload, with 14 new digital SKUs wired end to end (Stripe → webhook → orders → signed-file delivery email) and hidden until the Oct 26 flag flip. All 12 kits are drafted for audit round 1, the community audit has a complete operations pack, and the ERG one-pager exists in three editions. What's left is human: recruit the readers, edit the drafts, sell Winter Light.

## Decisions

1. **Same campaign, more doors.** Whole Table and Wellness Season are catalog depth on Winter Light 2026, not a new venture line. Same seller, same Stripe account (USSQ nonprofit, `acct_1QjUtXA08KNIsxXX`, shown in Stripe as "Feelings Unplugged"), same site, same six standards.
2. **Fold, don't fork.** The live Winter Light page was copied into the repo and served verbatim at `/`; the spec's separate `orders` table was folded into the existing `holidayz_orders`. Nothing a Winter Light buyer sees changed.
3. **Lens is a SKU row, not an upsell.** Affirming lens = separate Stripe link at the same price, discreet delivery, a checkbox on the kit page.
4. **Discreet mode is enforced in code.** Neutral product names on Whole Table and lens SKUs; the link script refuses non-neutral names; statement suffix `HOLIDAYZ KIT`; delivery files are numbered `holidayz-winter-kit-NN.pdf`; the email subject is "Your holidayz.vip kit."
5. **Warmlines chosen and verified** (988; Call BlackLine 1-800-604-5841; Trans Lifeline 877-565-8860, weekdays 1–9 PM ET). Peer-run lines over a long institutional list.
6. **Credits term stays "Community builders"** because auditors consent under that term; the Firefly line "Small lights that find each other" sits beneath it.
7. **Affirming lens is a named +$0 option on the ERG Heritage Day package.**
8. **Card statement prefix stays `FEELINGSUN*`** this season; revisit in the 2027 Renewal cadence. Reason: for a discreet buyer, a youth-wellbeing program name is better cover than a holiday brand, and changing it touches every Feelings Unplugged charge.
9. **Names frozen Sept 21** (six days early): Whole Table, Wellness Season, and the ten kit titles as seeded.
10. **No dev branch.** Pushes to `main` deploy production. Erica: "I don't need the dev branch."
11. **Resend sends only; never enable receiving on us-squared.org** (inbox is on Namecheap Private Email). Inbound for workflows goes on a subdomain later.
12. **Reversal noted:** the first production deploy 404'd because the Vercel project was still typed as a static site; pinning `framework: nextjs` in `vercel.json` fixed it. Vercel "Sensitive" env vars cannot be pulled; `vercel env pull` writes a `[SENSITIVE]` placeholder, which is why the Stripe scripts failed twice before the key was pasted by hand.

## Deliverables

- **Live site:** https://www.holidayz.vip (apex 308s to www). Home is byte-identical to the original Winter Light page. New routes 404 until the flag flips.
- **Repo:** https://github.com/eltphd/holidays-vip (public; see risks). Next.js 16, Supabase, Stripe, Resend. Vercel project `holidays-vip` linked to `main`.
- **Database:** migration `catalog_v2_whole_table_wellness_season` applied to Supabase `avrpthgahcrvsqpruziz`; seed loaded (3 categories, 14 kits, 14 SKUs, all `hidden`); private Storage bucket `holidayz-kits` for delivery files.
- **Stripe:** 14 products/prices/payment links with correct names, redirects to `/thanks`, promo codes on, metadata; the six Winter Light links repointed to `/thanks` with the original "Habari Gani" message preserved; webhook endpoint live; FIRSTLIGHT active through Dec 4.
- **Fulfilment:** webhook writes `holidayz_orders` (with lens, discreet, deliver_by); daily cron emails 7-day signed download links; two test emails sent from hello@us-squared.org and received.
- **Operator endpoints:** `/api/status`, `/api/admin/test-delivery` (bearer `CRON_SECRET`).
- **Kit drafts (12) + lens insert:** `docs/kits/` (index in `docs/kits/README.md`). Teen Room is a scaffold with nine `[MALIA — your voice here]` markers.
- **Audit operations pack:** `docs/audit/` — runbook, consent form, auditor brief, scorecard, recruiting emails, round emails, consent onboarding with a PII-refusing CSV loader (`npm run auditors:load`), handoffs for Malia / Measurement Ally / PDF production.
- **ERG pack:** `docs/erg/heritage-day-one-pager.md` (Winter Light, Pride-December, Wellness-January editions) and four outreach emails.
- **Spec reference:** `docs/spec-catalog-dev-build-v1.md`.

## Language worth keeping

- "Everybody who's coming is already welcome." (Whole Table tagline)
- "The one time of year everyone's already in the room." (Wellness Season tagline)
- "The one rule in this house: anyone can pass."
- "Safety is a feature, not a fee." (why the lens is +$0)
- "Not tonight. Pass the yams." (script one)
- "In this house everybody who's here is welcome. That includes you. Let's leave it there." (script two)
- "These are practices, not treatment. We name where each one comes from; we don't promise what it will do."
- "Say your weather, not your reasons."
- "Small lights that find each other."
- "I'd rather you tell me it's wrong now than a stranger tell me in December."
- "Ship smaller, not later."

## Action steps (ordered by leverage)

1. **Sell Winter Light this week.** Owner: Erica · 2 hours · no dependency. Four ERG emails went out Sept 18 (BPN, Huntington AABRG, AABLE, BLAC); follow up on each and send the next five from the target list. Winter Light has 0 paid orders as of Sept 20; the ERG Day ($7,500–$15,000) is the lever that closes the $10K floor.
2. **Make the GitHub repo private.** Owner: Erica (or say "flip it") · 2 minutes · none. Kit drafts, ERG pricing, and discreet file names are publicly readable today.
3. **Recruit and brief the community builders.** Owner: Erica · 20 min invitations (Sept 22–24) + one 20-min call · none · consents back Oct 4. Files: `docs/audit/emails-recruit.md`, `runbook.md`.
4. **Send three handoffs:** Malia (Teen Room by Oct 10), Measurement Ally (consent paragraph + readout outline), PDF production (file names, metadata, dates). Owner: Erica · 15 min · none. File: `docs/audit/handoffs.md`.
5. **Oct 4: send Claude the auditor CSV** (handles only). Owner: Erica · 15 min · depends on 3. Claude loads it; credits page populates automatically.
6. **Fill three ERG one-pager placeholders:** Day price for digital bundles; per-household claim-code flow (load-bearing for "nothing disclosed to the employer"); roster deadline. Owner: Erica · 20 min · none. Suggested: keep the $7,500 floor, claim codes = one 100% promo code per household.
7. **Four 30-minute editing blocks, Oct 5–18.** Owner: Erica · 2 hours · depends on 3 for round-1 timing.
8. **Align the reply address:** the site's waitlist uses hello@holidayz.vip (forwards to erica@measurementally.com); the kits and ERG docs use hello@us-squared.org. Pick one. Owner: Erica · 5 min. Suggested: keep hello@us-squared.org for delivery (discreet sender) and point holidayz.vip copy at it too.
9. **Upload finished PDFs to the `holidayz-kits` bucket** with the exact file names. Owner: PDF production · depends on 4 · Nov 12 / Nov 28 / Dec 9.
10. **Oct 26: "flip it."** Owner: Claude on Erica's word · 5 min · depends on round 1 closing. Pre-orders open.

## Open questions & risks

- **Public repository** (above). Until it's private, the launch is not actually dark.
- **Ohio digital-goods sales tax** for downloadable PDFs: still open, tied to the USSQ vendor's-license question.
- **Trademark knockout** for "Whole Table" and "Wellness Season": queued with "Holidayz" / "Soul Compass"; not run.
- **Two Stripe writers on `holidayz_orders`:** the Feelings Unplugged fulfillment worker and the new holidayz.vip webhook both receive `checkout.session.completed`. Both upsert on session id; harmless today, but retire the old one for holidayz SKUs before December volume.
- **Resend DKIM** showed Resend's newer record set; sending works, but confirm the domain shows "Verified" in Resend before Nov 15.
- **Auditor pushback expected** (each posed inside the kits): Coming Home never says "queer" or "trans"; Elder Light Q10 may read as a nudge; Legacy Table's unlabeled tree may read as erasure; Nourish's salt/sugar choices sit closest to diet creep; Steady's exit plan assumes a trusted person in the house.
- **Claude cannot execute Stripe writes or pull Stripe secrets** in this environment. Anything that creates live Stripe objects is Erica's keyboard.

---

## If these steps are completed

- **Revenue.** One ERG Day at the floor ($7,500) closes three-quarters of the $10K season floor by itself; one Hour ($2,500) plus the spec's conservative catalog add (60 units × $38 ≈ $2,300) closes the rest. The comfortable catalog case (150 units ≈ $5,700) makes the second ERG booking margin, not rescue. Every dollar runs through the USSQ nonprofit account with no new entity, no inventory, and no print exposure this season.
- **Evidence.** Every order writes a row with category, lens, and delivery date. Every household that opts in feeds the Measurement Ally season readout (Day-120, Jan 14). That readout is the honest version of the claim the kits refuse to make, and it is the first dataset in the programs → data → products → revenue flywheel for this line. Two categories mean two readouts, which is the difference between an anecdote and a pattern.
- **Positioning.** Black affirming-family holiday content at the household level barely exists as product. Shipping Whole Table in December, community-audited, with a discreet-mode promise enforced in code, is a first-mover claim that can be documented, not asserted.
- **Capacity.** The audit protocol, the consent flow, the loader, the handoffs, and the delivery pipeline are reusable for the Feb 2027 Renewal cadence with print. The marginal cost of the next category is content and audit, not infrastructure.

## If these steps stall — the cost of the open loop

- **Revenue foregone.** The season ends Dec 31 and the ERG booking window closes Nov 15. A stalled ERG follow-up this week is not a delay; it's the difference between a Day booked and a Day not booked, and there is no January Winter Light. Estimate: each un-followed ERG thread is a $2,500–$15,000 decision left with the other party.
- **Compounding losses.** No orders → no `holidayz_orders` rows → no Soul Compass opt-ins → no Day-120 readout → nothing for Measurement Ally to stand behind → the ERG pitch in 2027 still says "aggregate, consented readout" with no readout to show. The flywheel does not start slowly; it does not start.
- **Audit slippage is delivery slippage.** Round 1 needs readers by Oct 4. Every week the invitations wait, round 2 slides past Nov 8, and the Dec 1 and Dec 12 file dates become the fallback: two Whole Table kits and three Wellness kits instead of twelve. The spec planned for that outcome, and it is still a real launch, but it is half the catalog for the same fixed cost already paid.
- **Positioning decay.** The repo is public. The drafts, the pricing, and the discreet-mode mechanics are readable now by anyone who finds the link. The longer that stays true, the less "first" the first-mover claim is.
- **Momentum cost.** Fourteen Stripe links, a delivery pipeline, twelve drafts, and an audit pack were built in one session. Unlaunched, they depreciate at the rate the calendar moves: every day before Oct 26 that no reader is recruited is a day the build sits idle at full readiness.

**The one next action that keeps the loop closed:** send the community-builder invitations today, and follow up on the four ERG emails from Sept 18 in the same sitting.
