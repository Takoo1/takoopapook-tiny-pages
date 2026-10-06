# 3D Glossy Coupons & Passes Buttons (lower height)

## Goal
Make the two mode buttons (Coupons / Passes) in the header mode switch 3D glossy — matching the existing gold and blue 3D chips used elsewhere (FC balance, Refer) — and reduce their height via smaller padding and font size. No functionality changes; clicks, routing and active-mode behavior stay identical.

## Current state
- `ModeSwitch.tsx` (segmented variant): two ghost buttons `h-10`, `text-sm`, inside a `p-1` rounded container. Active segment = white pill + text tint only.
- `index.css` already has reusable glossy classes: `.chip-gold-3d` and `.chip-blue-3d` (gradient fill, top gloss highlight via `::before`, inset shine, drop shadow, active press scale).

## Changes

### 1. `src/components/ModeSwitch.tsx` (segmented variant only)
- Lower height: `h-10` → `h-8`.
- Smaller text: `text-sm` → `text-[13px]` font-bold.
- Container: `p-1` → `p-[3px]`, keep full-width segmented layout.
- Apply `.chip-gold-3d` to the Coupons segment and `.chip-blue-3d` to the Passes segment for both segments (active and inactive), so both buttons are always glossy 3D:
  - Active segment: full gloss as-is + existing `mode-segment-active` outline removed (glossy fill replaces it); keep `mode-current`-style ring on the active one for clarity (reuse `mode-button.mode-current` outline).
  - Inactive segment: same 3D material but softened (slight transparency / reduced shadow) via a new `.mode-segment-muted` class so the active choice still reads clearly.

### 2. `src/index.css`
- Add `.mode-segment-muted` (softened inactive state): ~85% opacity fill, smaller shadow.
- Ensure glossy `::before` highlight scales with the shorter button (already percentage-based — no change expected; verify visually).
- Keep reduced-motion handling.

### 3. Unchanged
- Pill variant (desktop compact switch) already glossy — untouched.
- Headers, navigation, click actions, auth states — untouched.
- `.passes-mode` theme colors drive the blue/gold values — reused as-is.

## Verification
- Playwright at 394px and 320px, light + dark: buttons visibly glossy 3D (gold Coupons, blue Passes), lower height (32px), no horizontal overflow, active mode still distinguishable, taps still navigate to `/` and `/passes`.
