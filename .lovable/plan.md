# Targeted Checkout, FC and Series UX Enhancements

## Scope

Make only the requested presentation, section-order, and navigation changes. Preserve authentication, payment and FC calculations, ticket allocation/availability, database access, existing routes, and all current actions.

## User-facing changes

1. **Checkout ordering**
   - Keep the existing game/checkout header first.
   - Render the existing Buyer Details block next, followed by the existing Fortune Coins discount block, FC reward message, Order Summary, and secure-booking/verified-organiser message.
   - Move each existing block once without duplicating or changing its fields, validation, calculations, or handlers.
   - Leave the existing sticky payment bar and `Pay` action unchanged.

2. **“What is FC” entry point**
   - Add a secondary button with the exact label `What is FC` inside the existing Fortune Coins checkout block.
   - Show it for both authenticated and unauthenticated states, without replacing the authenticated discount action or unauthenticated sign-in message.
   - Navigate to the existing Wallet route with a hash/landing target for the new FC information section.

3. **Wallet FC information section**
   - Add a compact, non-accordion section with `id="what-is-fc"` at the top of Wallet, before the balance card.
   - Include a short explanation and four concise visual blocks: “What is FC”, “How to Use FC”, “Benefits”, and “How to Earn FC”. Explain the existing 3 FC = ₹1 eligible-ticket discount relationship without changing the calculation.
   - Make the informational section accessible to signed-out visitors. Preserve the existing signed-in balance, packages, custom amount, referral, and purchase behavior; for signed-out visitors, show the information and a clear sign-in prompt instead of account-only wallet controls.
   - On Wallet mount, honor the `#what-is-fc` target and scroll it into view after the section is rendered.

4. **Series navigation above Books**
   - Replace the current all-series chip row presentation with a compact four-control navigation for games containing multiple Series:
     - previous series (one position back),
     - current active series name,
     - next series name (one position forward),
     - next-series control (two positions forward).
   - Use the loaded series names and ordering dynamically; never hard-code labels.
   - Highlight the current series control, keep the existing selected-series filtering and book reset behavior, disable or hide unavailable edge controls, and hide the entire series navigation when there is one or zero Series.
   - Keep the existing Book Navigation directly below it and independently scoped to the selected Series.

5. **Sold tickets**
   - Keep sold tickets non-selectable and retain their current unavailable styling.
   - Update the reusable ticket presentation so sold tickets include the small label `Sold` and a slightly smaller ticket number, while available and selected states remain distinct.

6. **Compact game-detail lead-in**
   - Reduce only the vertical footprint of the identity/details area and the existing prize/terms lead-in above ticket selection using smaller mobile-first typography, padding, gaps, and compact headers.
   - Do not remove content, alter collapsible behavior, or change ticket selection logic.

## Technical details

- Files expected to change: `src/pages/TicketBuying.tsx`, `src/pages/Wallet.tsx`, `src/pages/LotteryDetail.tsx`, and `src/components/ui/lottery-ticket.tsx`; add only small semantic styles in `src/index.css` if the existing tokens cannot express the sold-ticket treatment.
- Reuse the existing `Button`, `Card`, icons, semantic color tokens, and light Fortuna Link palette. No new route, schema, API, auth, payment, or database work.
- Keep the existing React state and Supabase queries; only add local navigation/scroll state needed for the Wallet anchor and series controls.

## Verification

- Check the checkout DOM order and confirm both auth states expose `What is FC`.
- Check `/wallet#what-is-fc` lands on the new top section, with signed-out access limited to public information plus sign-in prompting.
- Check multi-series previous/current/next/two-forward behavior and edge states, including independent Book navigation.
- Check sold tickets show `Sold` and cannot be clicked, while available/selected tickets retain their behavior.
- Check the compact details layout at mobile and desktop widths and confirm the sticky payment/buy bars remain unchanged.