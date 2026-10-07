# Slimmer Mobile Header with Spaced Mode Buttons

## Goal
Add a slight gap between the Coupons and Passes segmented buttons, and reduce the mobile header height by at least 20% by tightening vertical spacing. All elements, click actions and auth states stay identical.

## Current state
- `MobileHeader.tsx` and mobile `PassesHeader.tsx`: fixed header `h-[116px]` — top row `h-[58px]` (logo/wordmark + bell + account actions), bottom row `h-[58px] items-start px-4 pt-1` holding `ModeSwitch segmented`.
- `ModeSwitch.tsx` (segmented): full-width `mode-segmented` container with two `flex-1` buttons, no gap between them; each segment `h-8`.
- `MobileLayout.tsx`: mobile content offset `pt-[116px]`.

## Changes

### 1. `src/components/ModeSwitch.tsx` (segmented variant)
- Add `gap-2` to the `mode-segmented` container so the two glossy buttons have a slight visible space between them.
- No size change to the segments themselves.

### 2. `src/components/MobileHeader.tsx`
- Header height `h-[116px]` → `h-[92px]` (a 20.7% reduction).
- Top row `h-[58px]` → `h-[46px]` (logo, bell, FC/Refer chips and sign-up button all fit at 46px).
- Bottom row `h-[58px] items-start pt-1` → `h-[46px] items-center` (the 38px segmented control centers vertically with no extra padding).

### 3. `src/components/PassesHeader.tsx` (mobile variant)
- Same height changes: header `h-[116px]` → `h-[92px]`, rows to `h-[46px]` each with centered mode switch.

### 4. `src/components/MobileLayout.tsx`
- Update mobile content offset `pt-[116px]` → `pt-[92px]` on both the Passes and Coupons branches so no content hides under the header.

### 5. Unchanged
- Desktop headers, all click handlers, auth states, glossy styles (`chip-gold-3d` / `chip-blue-3d`), `.mode-segment-*` classes.
- Touch targets: buttons stay ≥36px tall within the 46px rows.

## Verification
- Playwright at 320px and 394px, Coupons and Passes modes, light and dark: header measures 92px, gap visible between the two segments, logo/wordmark/bell/account actions all visible and not clipped, mode taps still navigate `/` ↔ `/passes`, no horizontal overflow, content not hidden under the header.
