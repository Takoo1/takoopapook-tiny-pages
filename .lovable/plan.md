# Visual Polish: 3D Trust Icons and Gold Header CTA

## Goal
Add premium, tactile 3D styling to the Home page trust-marker icons and convert the Mobile Header's "Get 50 FC Free" sign-up button into a gold, 3D-shining CTA that matches the brand palette.

## Changes

### 1. 3D Trust Section Icons (`src/pages/Home.tsx`)
- Upgrade the four trust chips (Secure, Instant, Verified, Discounted) from flat circles to raised 3D medallions.
- Give each icon container:
  - A soft top-left white/blue highlight for depth.
  - A subtle bottom-right shadow to suggest a beveled button.
  - A gentle gold/navy gradient background that shifts per icon or a uniform premium brand-blue surface.
  - A slight `translateY(-2px)` on hover / active scale for tactile feedback.
- Keep the labels, icon choices, and horizontal scroll layout unchanged.

### 2. Gold 3D "Get 50 FC Free" Button (`src/components/MobileHeader.tsx`)
- Replace the current primary-blue sign-up button with a gold gradient button using the brand `--lottery-gold` / `--lottery-gold-light` tokens.
- Add a glossy 3D sheen:
  - Vertical gradient: gold-light on top, gold on bottom.
  - A thin horizontal highlight pseudo-element at the top (1–2 px) for the shine effect.
  - A soft gold shadow underneath to make it pop from the header.
- Keep text color as dark navy for contrast, preserve the Gift icon, `rounded-full`, and the existing click handler.
- Ensure the button still fits the compact header height (`h-9`).

### 3. Supporting Styles (if needed)
- Add or reuse a `.btn-gold-3d` utility class in `src/index.css` for the gold gradient + shine + shadow so the style can be reused consistently.

## Verification
- Open the Home page on mobile viewport and confirm the four trust icons look raised/3D and the labels remain clear.
- Confirm the header "Get 50 FC Free" button renders gold with a glossy top sheen and does not overlap neighboring icons.
- Run a type check to ensure no TypeScript errors from style changes.
