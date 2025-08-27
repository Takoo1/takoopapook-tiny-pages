# Mobile App Setup with Capacitor

## Capacitor Configuration
The Capacitor configuration has been set up with:
- App ID: `app.lovable.2dce9f3596ae47d6b50ad94cc45f7489`
- App Name: `takoopapook-tiny-pages`
- Hot-reload enabled for development

## Next Steps to Initialize Capacitor

Run this command to initialize the Capacitor project:
```bash
npx cap init
```

## Bottom Navigation Features
✅ Mobile-responsive bottom navigation with 5 tabs:
- **Home** - Main lottery games page
- **Videos** - Video content section
- **Winners** - Winners showcase
- **My Tickets** - User's purchased tickets
- **Menu** - App settings and options

✅ Mobile system bar support with safe area handling
✅ Active state highlighting
✅ Icons from Lucide React

## To Run on Physical Device/Emulator:
1. Export to GitHub and git pull the project
2. Run `npm install`
3. Add platforms: `npx cap add ios` and/or `npx cap add android`
4. Update platforms: `npx cap update ios` or `npx cap update android`
5. Build: `npm run build`
6. Sync: `npx cap sync`
7. Run: `npx cap run android` or `npx cap run ios`

Note: iOS requires Mac with Xcode, Android requires Android Studio.

For more details, read: https://lovable.dev/blogs/TODO