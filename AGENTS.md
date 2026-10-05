# Project architecture

- Keep Coupons routes and behavior unchanged; route-prefix `/passes` selects its own header, five-tab navigation, and scoped theme so deep links render the correct mode without persistent client state.
- Keep Passes category screens as honest empty states until real availability is integrated; do not invent inventory or connect them to Coupons bookings.