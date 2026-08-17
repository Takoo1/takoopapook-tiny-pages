# Shiny 3D Header Chips + Swipeable Carousel

## 1. Mobile header buttons (3D shine)
In `src/index.css`, add two utilities next to the existing `.btn-gold-3d`:
- `.chip-gold-3d` — gold gradient (gold-light to gold), navy text/icon, inset top highlight via `::before`, soft gold drop shadow, hover brightness and active press states.
- `.chip-blue-3d` — same treatment using the existing brand blue tokens, light text.

In `src/components/MobileHeader.tsx`:
- FC balance button: replace the current translucent gold tint + border with `chip-gold-3d` (keep `relative overflow-hidden rounded-full h-9`, FC coin image, balance text, wallet click handler).
- Refer button: replace the secondary background with `chip-blue-3d` (keep Gift icon, "Refer" label, referral click handler).
- No logic, routing or data changes.

## 2. "Why Choose FortunaLink" carousel — manual swipe
In `src/components/ImageCarousel.tsx`, keep the current markup and auto-advance behaviour, and add drag/swipe:
- Track pointer/touch start X and current offset; on release, if the drag passes a ~40px threshold, move to the next/previous slide, otherwise snap back.
- Apply the drag offset on top of the existing `translateX(-index * 100%)` transform, and disable the CSS transition while dragging so the image follows the finger.
- Pause the 7s auto-advance interval while dragging and restart it after release.
- No arrows, no dots — visuals stay exactly as they are today.
- Same behaviour for both the mobile and desktop layout blocks.

## Files
- `src/index.css`
- `src/components/MobileHeader.tsx`
- `src/components/ImageCarousel.tsx`

## Validation
Type check, then confirm on a mobile viewport that both header chips look raised/glossy and the carousel can be swiped by hand while still auto-rotating.
