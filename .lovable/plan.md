# Home swap + ticket selection fixes

## 1. Home page: swap section order
Currently the "Why Choose FortunaLink" carousel band sits above the "Featured Draws / Choose Your Fortune" games section. Swap them so the games section (with all price-tier card sections, search/filters, rails) comes first, and the carousel band follows below. No changes to the sections' internals, refs, IDs (`#games`, price-section anchors) or the mobile price filter bar logic.

## 2. Ticket number buttons: two states only
In `src/components/ui/lottery-ticket.tsx` the default style includes `hover:bg-lottery-gold`. On touch devices the hover state sticks after tapping, so a deselected ticket still looks selected.

- Default (available): light blue glossy pill — soft blue gradient, subtle inner highlight and thin blue border, dark blue text.
- Selected: current gold/primary highlight, stronger elevation.
- Remove hover-based colour changes entirely; keep only a small scale/press feedback.
- Sold tickets keep their existing sold styling and remain non-clickable.
- New glossy blue token/utility added in `src/index.css` so light and dark mode both look right.

## 3. Keep selection across books/series
`nextBook` / `prevBook` in `src/pages/LotteryDetail.tsx` call `setSelectedTickets([])`, wiping the cart when paging. Remove those resets so selections accumulate across books (and across series). The sticky bar count, total price and checkout payload already work off the full `selectedTickets` array, so no other logic changes.

## 4. Series > Book > Ticket hierarchy
The series layer already exists (table `lottery_series`, `lottery_books.series_id`, admin form grouping, booking-page series chips). Remaining polish only:
- Always show the series chip row on the game details page when at least one series exists (today it only renders when there is more than one), so the hierarchy is visible.
- When switching series, reset the book index to the first book of that series but keep selected tickets.
- Verify admin add/edit game saves series → books → generated tickets correctly; no new migration needed.

## Files
- `src/pages/Home.tsx`
- `src/components/ui/lottery-ticket.tsx`
- `src/index.css`
- `src/pages/LotteryDetail.tsx`

## Guarantees
No changes to routing, APIs, payments, wallet/FC logic or ticket generation.
