# Coupons and Passes Modes

## Goal
Give Fortuna Link two clearly separate experiences. Coupons keeps the current site and its existing behavior. Passes opens a new, visually distinct area for events, news, videos, and tourism, ready for real bookings later.

## Experience
1. Raise the Fortuna Link name within the mobile header and place two compact, glossy 3D mode buttons directly below it: gold **Coupons** and blue **Passes**. Keep the existing main logo unchanged and retain notification, FC, referral, and sign-in actions without overlaps. Provide the same mode switch on desktop without making its header unnecessarily tall.
2. **Coupons** returns to the current home page and retains its existing header, bottom navigation, theme, and all existing flows.
3. **Passes** opens a separate Passes home view with a distinct blue-led, restrained premium palette, its own header treatment (same main logo), and its own five-item mobile bottom navigation: Discover, Events, News, Videos, Tourism. Provide matching desktop navigation. The mode switch remains available so users can return to Coupons from anywhere in Passes.
4. Give each Passes category a real destination and a polished, truthful empty state while inventory and editorial content are not yet provided. Do not invent events, ticket prices, availability, news stories, or videos; do not show a purchase action that cannot complete. Keep the future booking pathway visible as a category, but defer checkout and pass administration.
5. Use responsive spacing, touch-friendly controls, and semantic theme tokens; support light/dark appearance and avoid changing the Coupons styling beyond what the shared header needs.

## Technical approach
- Add a small `/passes` route group and shared Passes layout/content views; choose the header, bottom navigation, and scoped theme by route prefix, not by a persisted toggle. Direct links and refreshes must open in the correct mode.
- Reuse the existing logo assets and Button component; scope new color and gloss tokens to the Passes mode while retaining current Coupons tokens and styles.
- Keep existing coupon routes, authentication, APIs, wallet, payments, lottery logic, and existing `/videos` behavior untouched. New Passes views are presentational only in this phase; no database or booking schema change yet.
- Check mobile and desktop layouts, each mode switch, direct Passes links, dark appearance, and regressions in current Coupons navigation.

## Later phase, not included now
Real pass inventory, publishing tools, booking, payment, and availability checks will be specified and implemented when pass types and booking rules are ready.
