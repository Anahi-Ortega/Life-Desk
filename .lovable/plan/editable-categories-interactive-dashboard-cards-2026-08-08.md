# Editable categories + interactive dashboard cards

## What you'll get

**1. Categories panel on /manage**
A new left column that works like the Tags panel, but for life areas (CLN, MNY, FIT, HOB, MND):
- Add a category: type a 3-letter code (e.g. `TRV`) plus a label, and pick a color.
- Rename the label and change the color inline; the code is locked once tickets exist (ticket IDs like `TRV-0001` depend on it).
- Ticket count per category shown on the right, like tags.
- Delete is blocked while tickets still use that category — you'll see the count instead of a trash icon, so no orphaned tickets.
- New categories immediately appear in the new-ticket dialog, board filters, project category picker, and the manage table.

**2. Interactive stat cards on the homepage**
The four cards (Open tickets, P1 escalations, Near goal, Overdue) become toggle filters on the board below:
- Click a card to show only its tickets; the card gets a highlighted border and its color.
- Click again (or use a "Clear" chip) to reset.
- One card active at a time, and it composes with the existing search / area / P-level filters.
- "Open tickets" also implies hiding resolved, so the counts and the board always agree.

## Extra improvements included

- A fifth card, **Blocked**, since blocked tickets are otherwise easy to lose.
- Filter state summary line above the table ("showing 6 of 21 tickets · clear filters").
- Area filter row switches to using your saved categories, so it grows as you add them.

## Technical notes

- `TrackerData` gains a `categories: Category[]` array (`{ id, label, colorVar? , color }`); `CATEGORIES` in `types.ts` becomes the seed default only. `categoryMeta()` moves to a store-aware lookup so custom colors render.
- Category colors stored as raw color strings (custom ones) with existing five keeping their `var(--cat-*)` tokens; `badges.tsx` reads through the store lookup.
- `counters` keeps a per-category number, initialized to 0 for new categories, so key generation is unchanged.
- Store gains `addCategory`, `updateCategory`, `deleteCategory` (delete refuses when tickets reference it), plus a migration on load that backfills `categories` for existing localStorage data.
- Board adds a `focus` state (`null | "open" | "p1" | "near" | "overdue" | "blocked"`) applied inside the existing `rows` memo; cards become buttons with `aria-pressed`.
