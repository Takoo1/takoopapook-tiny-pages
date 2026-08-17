# Final Home Page Polish Plan

## Goal
Apply three targeted visual/UX tweaks to the Home page while keeping all existing functionality intact.

## Changes

### 1. Trust Section — remove boxy container
- Remove the container border/background on the trust section strip below the hero so the four icons feel like they float directly on the page background.
- Keep the 3D raised medallion icons and labels.
- Preserve the mobile-friendly horizontal scroll layout.
- Adjust spacing so the strip is compact but still readable.

### 2. "Why Choose" section — reduce top spacing
- Reduce the top padding above the "Why Choose FortunaLink" heading in `src/components/ImageCarousel.tsx`.
- Keep the heading typography and the two-column desktop layout unchanged.

### 3. Hero banner — auto-scroll to "Choose Your Fortune" on mobile tap
- In `src/components/HeroCarousel.tsx`, add a click handler to every image that, on mobile, smoothly scrolls the page to the `gamesSectionRef` "Choose Your Fortune" section.
- Only apply this behaviour when the media has no explicit `link_url` (existing links must still work exactly as today).
- Expose the scroll target from `src/pages/Home.tsx` to the carousel via a callback ref or shared element ID.

## Files to modify
- `src/pages/Home.tsx`
- `src/components/ImageCarousel.tsx`
- `src/components/HeroCarousel.tsx`
- `src/index.css` (only if trust spacing needs a dedicated utility tweak)

## Validation
- Verify the trust section no longer has a separate box/card border.
- Verify the "Why Choose" heading is visually closer to the trust strip.
- Verify tapping any hero image on mobile scrolls to the lottery games section.
- Run a type check and build before finishing.
