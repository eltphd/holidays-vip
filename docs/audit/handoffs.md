# Handoffs — Malia, Measurement Ally, PDF production, credits page

## 1. Malia — Teen Room co-author

**Subject:** Teen Room is yours to finish. Nine spots.

Hi Malia,

Teen Room is drafted as a scaffold, and it's written to the teen, not the parent. It reads okay without you, and that's the problem: it sounds like an adult who's good at sounding young. The nine places where it needs to be you are marked like this:

`[MALIA — your voice here: …]`

Each one says what the spot needs in one line. The big ones are the opening, the intro to the "my terms" page, the "nobody reads this" line on the journal, the journal prompts (cut any that sound adult, add yours), and the eighth night. Write them however you'd actually say them. Don't match my register; replace it.

Rules that stay no matter what: nothing in the kit asks you or any teen to tell anyone anything. The journal is private, full stop. The three phone lines and their numbers stay exactly as they are. No exclamation points (that one's mine, you can argue).

File: `docs/kits/ws-teen-room.md`. Edit the file directly or send me your lines by email and I'll drop them in. By **October 10** if you can, so it goes into round 1 with your voice on it. The adolescent auditor will score it; expect them to be hard on the parts that are still me.

You're on the cover as co-author. Tell me how you want your name to read.

Erica

---

## 2. Measurement Ally — Soul Compass and the season readout

**Subject:** What the kits promise about measurement, so we say the same thing

Hi [name],

Here's the language every kit uses for the Soul Compass, so the readout matches it. Please push back on anything that overpromises.

What the kits say: a short check-in the family keeps; nobody's individual answers leave the house; the family fills a one-page readout for themselves at the end of the season; the aggregate season readout from MA is separate and only with consent. No outcome claims anywhere ("reduces," "improves"). The ERG one-pager says organizations receive an aggregate, consented season readout after the season, nothing individual.

What I need from you:
1. The consent language for the aggregate share, in the same register as the kits (peer, plain, one paragraph). It goes on the last page of every Complete bundle and on the ERG one-pager.
2. What exactly a family opts in to sharing, and how (a link? a form? a photo of their page?). Nothing that requires an account.
3. The Day-120 readout outline for January 14, including the two new categories, so I know what the kits need to capture for it.
4. Confirmation that the language "measured, returned to the family" is one you'll stand behind in the readout.

Files: `docs/kits/wt-complete.md` §3, `docs/kits/ws-complete.md` §3, `docs/erg/heritage-day-one-pager.md`.

Erica

---

## 3. PDF production — whoever lays out the files

**Subject:** Kit files: names, metadata, and the discreet-mode rules

Twelve kit PDFs plus the lens insert, from the Markdown in `docs/kits/`. Type and layout are yours; these rules aren't.

**File names, exactly** (they're keyed in the database; the delivery email breaks if they differ):

| Kit | File |
|---|---|
| Open House | holidayz-winter-kit-01.pdf |
| Coming Home | holidayz-winter-kit-02.pdf |
| Chosen Family Table | holidayz-winter-kit-03.pdf |
| Elder Light | holidayz-winter-kit-04.pdf |
| Whole Table Complete (readout pages) | holidayz-winter-kit-05.pdf |
| Lens insert, Winter Light Make | holidayz-winter-kit-06.pdf |
| Lens insert, Winter Light Practice | holidayz-winter-kit-07.pdf |
| Nourish | ws-nourish-digital.pdf |
| Mind Lanterns | ws-mind-lanterns-digital.pdf |
| Steady | ws-steady-digital.pdf |
| Teen Room | ws-teen-room-digital.pdf |
| Family Weather | ws-family-weather-digital.pdf |
| Legacy Table | ws-legacy-table-digital.pdf |
| Wellness Season Complete (readout pages) | ws-complete-digital.pdf |

**Discreet mode (the `holidayz-winter-kit-NN` files):**
- PDF metadata: Title "Winter kit", Author "holidayz.vip", Subject blank, Keywords blank. No category name anywhere in metadata.
- Cover reads as a winter kit. No category name on the cover, in running headers, or in footers. The kit's own title appears inside, on page 2 onward.
- No page numbers that say "Whole Table"; use the kit title only.

**Every file:**
- Tagged PDF, reflowable, reading order set. WCAG 2.2 AA contrast.
- Offer a dyslexia-friendly type option (a second export with Atkinson Hyperlegible or similar is fine, same file name with `-large` appended; the delivery email links only the standard one for now).
- The "This isn't therapy" card (Wellness kits) is on page 2, before any activity, and the three phone numbers are text, not an image.
- Fill-in pages (cards, one-pagers, journals) have real form fields where practical.

**Delivery:** upload finished files to the private Supabase Storage bucket `holidayz-kits` with the exact names above. Claude sends a test delivery for each before the dates (Nov 15 / Dec 1 / Dec 12).

**Dates:** Nourish and Family Weather final by Nov 12. Steady, Teen Room, Coming Home, Open House by Nov 28. Everything else and the two readout files by Dec 9.

---

## 4. Credits page — going live (Erica, Nov 15)

Nothing to build. Once the Oct 4 CSV is loaded, everyone with `credit_choice` of `named` or `first-name` and a consent date appears on `/community-builders` automatically the moment the flag is on. Before Nov 15: check the page once, confirm each name reads the way they asked in their §4 reply, tell Claude any change. Anyone who chose `anonymous` never appears.
