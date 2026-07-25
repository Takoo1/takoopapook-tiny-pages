## Goal
Two Home-screen UX changes on mobile. No business logic, data, or routing changes.

### 1. Conditional visibility of the bottom price filter bar
The floating `MobilePriceFilterBar` should only appear when the "Featured Draws" section occupies **more than 30% of the mobile viewport height**. Otherwise it stays hidden (in addition to the existing scroll-hide behavior).

Implementation:
- In `src/pages/Home.tsx`, attach a ref to the Featured Draws / games section wrapper.
- Pass the ref (or a computed `visible` boolean) into `MobilePriceFilterBar`.
- Inside `MobilePriceFilterBar.tsx`, use an `IntersectionObserver` with fine-grained thresholds (`[0, 0.05, 0.1, ..., 1]`) on the target section. On each callback, compute:
  `coverageRatio = intersectionRect.height / window.innerHeight`
  Show the bar when `coverageRatio > 0.3`, otherwise hide.
- Combine this with the existing scroll-idle hide behavior (both conditions must allow visibility).

### 2. Default = horizontal scroll rail; filter click = stacked grid
Currently the lottery cards render as a stacked vertical grid in each price section.

New behavior:
- When `selectedPriceFilter === "all"` (default), each price-tier section renders its cards as a **horizontally scrollable rail** (swipeable, snap, ~78–85% viewport width per card) on mobile.
- When the user taps Rs 200 / Rs 500 / Rs 1000, only that tier's section is shown (existing behavior) and its cards render as the **stacked vertical layout** (current look).
- Desktop layout is unchanged (always grid).

Implementation:
- In `src/pages/Home.tsx`, inside each price-tier section's cards container, branch the className based on `selectedPriceFilter`:
  - Default (`"all"`): `flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 -mx-4 pb-2 scroll-smooth md:grid md:grid-cols-... md:overflow-visible` and wrap each `LotteryCard` in a `snap-start shrink-0 w-[82%]` container.
  - Filtered (specific price): keep the current stacked grid classes.
- Hide scrollbar via existing utility or `[&::-webkit-scrollbar]:hidden`.

### Technical notes
- Only touch: `src/pages/Home.tsx`, `src/components/MobilePriceFilterBar.tsx`.
- No prop/interface changes to `LotteryCard`.
- Preserve all filtering, sorting, click handlers, section IDs (`price-section-200/500/1000`, `games`) used by the filter bar's auto-scroll.

### Confirmation
Did I understand correctly?
- Filter bar visible only when Featured Draws covers >30% of the viewport.
- Default view: horizontal swipeable rails per tier. After tapping a price filter: that tier renders as the current stacked rows.

If yes, approve and I'll implement.