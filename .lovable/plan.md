# Three fixes: desktop hero, terms popup, mobile buy bar

## 1. Hide the hero image section on desktop

On the Home page, the hero carousel section is currently shown on all screen sizes. It will be hidden on desktop and kept exactly as-is on mobile. No change to the carousel component or its data.

## 2. Terms popup reappearing on every refresh

Confirmed cause (from the database): the acceptance table has 13 duplicate `user_login` rows for the same user. The check that decides whether to show the popup uses a "single row expected" query, which errors when duplicates exist, and the error is treated as "not accepted" — so the popup shows again on every refresh. On top of that, Supabase fires a `SIGNED_IN` event on page refresh/token restore, so the check runs again each reload.

Fix:
- Change the acceptance check to fetch the newest matching row instead of expecting exactly one, so existing duplicates no longer break it.
- Prevent duplicate inserts on accept (only insert when no row exists yet).
- Only run the login terms check for a genuine new sign-in, not for a restored session on refresh, using a per-browser-session marker that is cleared on logout.

Result: the popup appears once after a real login and never again until the user logs out and logs back in. No change to what the popup shows or to the acceptance records themselves.

## 3. Reduce the mobile bottom "Select Tickets / Buy Now" bar height

On the Lottery Details page, the sticky bottom bar (mobile only) is tall and eats scrolling space. It will be made significantly shorter: reduced outer padding, a more compact inner layout, smaller price/label typography, and a shorter button — while keeping the button large enough to tap comfortably. Content bottom padding is adjusted so nothing is hidden behind the shorter bar. Desktop is untouched, and the button labels, states and buy action stay exactly the same.

## Technical notes

- `src/pages/Home.tsx` — hero `<section>` gets a `hidden md:…`-style responsive visibility rule (mobile only).
- `src/hooks/useTermsAcceptance.ts` — `maybeSingle()` → ordered `limit(1)` fetch; guard insert against duplicates.
- `src/components/AuthButton.tsx` — gate the `user_login` popup behind a `sessionStorage` flag set on sign-in check and cleared on sign-out, so refresh-triggered `SIGNED_IN` events don't re-trigger it.
- `src/pages/LotteryDetail.tsx` — sticky buy bar: reduce wrapper padding, inner padding, button height (h-12 → ~h-10/11) and text sizes.

No business logic, routing, API, or payment flow changes.
