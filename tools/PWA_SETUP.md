# 📱 PWA Setup for iOS - 52 Weeks

## Quick Start

1. **Generate Icons** (Required)
   ```bash
   open generate-icons.html
   ```
   - Click "Generate All Icons" button
   - All PNG files will download automatically
   - Move downloaded files to `public/` folder

2. **Build & Deploy**
   ```bash
   npm run build
   ```

3. **Install on iOS**
   - Open app in Safari
   - Tap Share button (⬆️)
   - Tap "Add to Home Screen"
   - Tap "Add"
   - Done! App installed with "52🚀" icon

## Features

✅ **Standalone App** - Opens without Safari UI
✅ **Custom Icon** - "52🚀" on home screen
✅ **Offline Support** - Works without internet (after first load)
✅ **Auto-update** - Service worker updates automatically
✅ **iOS Optimized** - Full viewport, no bounce scroll
✅ **Theme Color** - Blue (#3B82F6) status bar

## Generated Files

### Icons (in `public/`)
- `icon.svg` - Source SVG icon
- `apple-touch-icon.png` - 180x180 (iOS home screen)
- `icon-192.png` - 192x192 (Android)
- `icon-512.png` - 512x512 (Android, splash)
- `icon-192-maskable.png` - 192x192 with safe zone
- `icon-512-maskable.png` - 512x512 with safe zone

### Configuration
- `public/manifest.json` - PWA manifest
- `vite.config.ts` - PWA plugin configuration
- `index.html` - Meta tags for iOS

## Manual Icon Generation (Alternative)

If `generate-icons.html` doesn't work, create icons manually:

### Using online tools:
1. Go to https://realfavicongenerator.net
2. Upload `public/icon.svg`
3. Download generated package
4. Extract to `public/` folder

### Using ImageMagick:
```bash
# Install ImageMagick first
brew install imagemagick

# Generate icons
convert public/icon.svg -resize 180x180 public/apple-touch-icon.png
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
convert public/icon.svg -resize 192x192 public/icon-192-maskable.png
convert public/icon.svg -resize 512x512 public/icon-512-maskable.png
```

## PWA Configuration

### Manifest (`public/manifest.json`)
```json
{
  "name": "52 Weeks - Weekly Planning",
  "short_name": "52 Weeks",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3B82F6",
  "icons": [...]
}
```

### Service Worker (Auto-generated)
- Caches all static assets (JS, CSS, HTML)
- NetworkFirst strategy for Supabase API
- Auto-updates on new version

### iOS Meta Tags
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

## Testing PWA

### Development
```bash
npm run dev
# PWA enabled in dev mode for testing
```

### Production
```bash
npm run build
npm run preview
# Open in Safari on iOS
```

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Check "Progressive Web App"
4. Run audit
5. Should score 100/100

## iOS Installation Flow

### First Visit
1. User opens https://52-weeks.app in Safari
2. Service worker installs (background)
3. Assets cached for offline use

### Install Prompt
- **iOS doesn't show automatic install banner**
- User must manually add to home screen

### After Installation
1. Icon appears on home screen: "52🚀"
2. Tap icon → Opens full-screen (no Safari UI)
3. Works offline (shows cached data)
4. Auto-updates on next online visit

## Offline Behavior

### What Works Offline
✅ View cached weeks
✅ Navigate between weeks
✅ UI remains functional
✅ Layout and styles work

### What Requires Internet
❌ First-time authentication
❌ Fetching new data from Supabase
❌ Saving changes to database

### Cache Strategy
- **Static assets** - Cache first, update in background
- **Supabase API** - Network first, fallback to cache (24h max)

## Troubleshooting

### Icon not showing
- Clear Safari cache
- Re-add to home screen
- Check `public/apple-touch-icon.png` exists

### PWA not installing
- Ensure HTTPS (required for PWA)
- Check manifest.json is accessible
- Verify service worker registered (DevTools → Application)

### Updates not applying
- Service worker caches old version
- Force refresh: Settings → Safari → Clear History
- Or wait 24 hours for auto-update

### Build errors
```bash
# Check PWA plugin installed
npm list vite-plugin-pwa

# Reinstall if needed
npm install -D vite-plugin-pwa workbox-window
```

## Advanced Configuration

### Custom Splash Screen
iOS generates splash automatically from:
- `theme_color` (manifest.json)
- `apple-touch-icon.png`
- App name

### Push Notifications (Future)
PWA supports push notifications on iOS 16.4+:
```typescript
// Register for push
const registration = await navigator.serviceWorker.register('/sw.js')
const subscription = await registration.pushManager.subscribe({...})
```

### Share Target (Future)
Allow sharing TO the app:
```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "params": { "title": "title", "text": "text" }
  }
}
```

## Production Checklist

✅ Icons generated and in `public/`
✅ HTTPS enabled (required for PWA)
✅ Service worker registered
✅ Manifest accessible at `/manifest.json`
✅ Lighthouse PWA score 100/100
✅ Tested on real iOS device
✅ Offline mode works
✅ Theme color matches brand

## Resources

- [PWA on iOS Guide](https://developer.apple.com/documentation/webkit/progressive_web_apps)
- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [PWA Builder](https://www.pwabuilder.com/)

---

**Version:** 1.2.0
**Date:** 2026-01-20
**Icon:** 52🚀 on blue background (#3B82F6)
