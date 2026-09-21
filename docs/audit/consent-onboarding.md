# Consent onboarding — from "I agree" to a row in the database

## The two-sheet rule

Contact details never enter the database. Two records exist:

1. **Your private sheet** (Google Sheet or Numbers, yours only): name, email, phone, guardian name and email, the consent reply (forward the email to yourself or paste the text), date received.
2. **The `auditors` table** (Supabase): handle, lens roles, credit choice, compensation, minor flag, consent dates, and a `contact_ref` that is just the row number in your private sheet.

The site, the audit reviews, and the credits page only ever see sheet 2.

## Your private sheet columns

| Col | Field | Notes |
|---|---|---|
| A | Row # | This is what goes in `contact_ref` |
| B | Name | |
| C | Email | |
| D | Phone | optional |
| E | Minor? | yes/no |
| F | Guardian name | minors only |
| G | Guardian email | minors only |
| H | Consent reply received | date; paste the "I agree" line |
| I | Guardian consent received | date; minors only |
| J | Compensation paid | date + method (Zelle/PayPal/check) or kit sent |

## What you send Claude on Oct 4

One CSV, no names or emails. Template: `auditors-template.csv`. One row per person:

```
handle,lens_roles,credit_choice,credit_name,compensation,is_minor,consent_signed_at,guardian_consent_at,contact_ref
Rae,"trans;adult",first-name,,honorarium,false,2026-10-01,,1
J.,"gay-married",named,Jordan Ellis,kit-credit,false,2026-10-02,,2
Malia,"adolescent",named,Malia Phoenix,kit-credit,true,2026-10-02,2026-10-02,3
```

Rules:
- `handle`: what they want called in notes. First name or chosen name only.
- `lens_roles`: any of `older-adult` `adolescent` `adult` `gay-married` `lesbian` `trans` `parent`, separated by `;`.
- `credit_choice`: `named`, `first-name`, or `anonymous`. `credit_name` only when `named`.
- `compensation`: `honorarium`, `kit-credit`, or `declined`.
- `is_minor` true requires `guardian_consent_at`; the database rejects a review from a minor without it.
- `consent_signed_at`: the date the "I agree" reply arrived.

Then Claude runs:

```bash
npm run auditors:load -- docs/audit/auditors.csv
```

(Keep the filled `auditors.csv` out of git; it's already ignored. The template is committed.)

## Consent validity, plainly

A typed "I've read the consent page and I agree" in a reply email, from the person's own address, with their four choices, is a valid record of consent for a content review with an honorarium. For minors, the guardian's reply from the guardian's own address is the co-signature. Keep the emails. No DocuSign needed.

## Compensation mechanics

- Honorarium: $75 each, paid Nov 9–15 after round 2 closes, by whatever you already use (Zelle, PayPal, check). Under $600 per person, so no 1099. Record date and method in column J.
- Kit credit: a Complete bundle of their choice, delivered with the Dec 12 files (or Winter Light's Oct 15 files if they pick that). Claude creates a 100% promo code per person so it flows through the normal order path and the delivery email goes out automatically.
- Minors: honorarium goes to the guardian, or a kit. Never a direct payment to the teen.
