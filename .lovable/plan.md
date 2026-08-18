# Series support + game detail polish

## 1. Image upload > 2MB bug
In the game creation form, when a file over 2MB is picked the error toast shows but the file input keeps the selection, so the flow gets stuck and the serial number editor never appears.

- Reject oversized files cleanly: clear the file input value, reset preview/progress state, and keep the previous image (if any) untouched.
- Show the serial number editor as soon as a valid ticket image preview exists (progress reaching 100%), so a successful re-upload always brings it back.
- Keep the 2MB limit and the same messaging.

## 2. Series > Books > Tickets
Today a game has books directly. Add a Series layer above books.

Database (new migration):
- New table `lottery_series`: game reference, series name, display order, timestamps, RLS + grants mirroring `lottery_books` (public read for visible games, organiser/admin manage).
- `lottery_books` gets a nullable `series_id` referencing `lottery_series`.
- Backfill: every existing game with books gets one auto-created "Series A", and all its books are attached to it.
- Ticket numbers stay unique per game (series is a grouping label only), so no changes to ticket generation logic or ticket numbering.

Admin (game add/edit form):
- Books UI becomes grouped by series: add/remove series, name each series, and add books inside a series with first/last ticket numbers and the online/offline switch (all existing per-book behaviour preserved).
- Overlap validation stays game-wide since numbers remain unique per game.
- Save flow: create series rows first, then books with their `series_id`, then generate tickets exactly as today.
- Preview modal and admin listings show books grouped under their series.

User side (game details / booking):
- Add a series selector above the existing book carousel. Choosing a series filters the carousel to that series' books; the ticket grid, selection, pricing, wallet/FC and checkout logic are unchanged.
- Games with a single series show the selector in a compact form (or hidden) so nothing feels heavier than today.

## 3. Glossy tier section headers
Make the "Elite Selection", "Premium Collection" and "Featured Collection" (and Budget Collection) headers on the Home page glossy — gradient sheen, soft highlight and subtle depth — keeping each tier's current colour.

## 4. Ticket image lightbox
On the game details page, tapping the lottery ticket image opens a full-screen preview dialog with a close button in the top corner, dark backdrop, and pinch/zoom-friendly sizing.

## 5. Game details page density
- Reduce font sizes and paddings in the first details box (game name, organiser, draw date, booking close, books) to shrink its height while staying readable and touch-friendly.
- Convert "Main Prizes" and "Incentive Prizes" into collapsible accordions (Main Prizes expanded by default), keeping all prize data and ordering.

## 6. Dark mode refinement
Refine the existing dark theme tokens: deeper layered surfaces, softer borders, correct text contrast tiers, reduced harsh gold, and consistent card/elevation shadows across pages. No structural changes.

## Guarantees
No changes to routing, payments, wallet/FC logic, ticket generation, authentication or APIs beyond the additive series table and `series_id` column.
