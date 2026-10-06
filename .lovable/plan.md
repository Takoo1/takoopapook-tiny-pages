# Balanced Premium Material Mobile Header

## Goal
Refine only the mobile header into the selected premium Material Android direction while preserving the logo, wordmark, notifications, authentication action, FC balance, Refer action, Coupons/Passes switching, and every existing click behavior.

## Header structure
1. Rebuild the header as two deliberately balanced rows:
   - Top row: compact logo and wordmark group on the left; notification plus the current account action group on the right.
   - Bottom row: a full-width, softly inset segmented control with equal-width Coupons and Passes choices.
2. Keep the header compact enough for mobile content while increasing its height only as needed to support consistent spacing and 44px touch targets.
3. Use responsive constraints for narrow phones so signed-out “Get 50 FC Free” and signed-in FC/Refer actions fit without hiding, clipping, or overlapping the brand.

## Visual treatment
- Replace the two disconnected floating mode pills with one symmetrical Material-style segmented surface.
- Show the active mode on a raised surface with restrained gold or blue emphasis; keep the inactive mode quieter but fully legible.
- Preserve the existing Fortuna Link logo and wordmark assets unchanged.
- Use existing semantic tokens, Inter typography, soft elevation, and the established button component; no new hardcoded component colors.
- Keep animation limited to subtle press and active-state transitions, with reduced-motion support.

## Passes consistency
Apply the same two-row structure to the Passes header, retaining its distinct blue-led theme, same main branding, notification control, and correct active Passes state.

## Technical details
- Update the shared mode switch to support the selected full-width segmented presentation while retaining its current navigation.
- Update the Coupons and Passes mobile header compositions only; desktop headers and application behavior remain unchanged.
- Adjust the mobile content offset to the final measured header height so no page content sits beneath it.

## Validation
Check signed-out and signed-in layouts at 320px and 394px widths, both Coupons and Passes modes, notification access, FC/Refer actions, mode navigation, no horizontal overflow, direct Passes links, and light/dark appearance.
