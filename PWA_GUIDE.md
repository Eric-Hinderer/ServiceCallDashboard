# Technician PWA — Installation & Usage Guide

The Service Call Dashboard is now an installable **Progressive Web App (PWA)**
with a mobile-optimized **Technician** view. Techs can install it to their
home screen, see their open calls at a glance, claim/start/complete calls with
one tap, and keep working when the network drops (Firestore queues writes
locally and syncs when you reconnect).

---

## What you get

- `/technician` — mobile-first view for field techs (large tap targets,
  My Calls / Unassigned / All Open tabs, one-tap Claim → Start → Done flow,
  tap-to-call caller numbers, floating "New Call" button).
- Installable app icon on iOS, Android, Chrome, and Edge (launches into
  `/technician`).
- Offline mode — service worker caches the app shell; Firestore caches data
  and queues your status changes until you're back online.
- Offline banner across the top of the app when the device goes offline.
- Home-screen shortcuts: **My Calls** and **New Service Call** (long-press the
  icon on Android / right-click on desktop).

---

## Install the app

### Android (Chrome)

1. Visit the dashboard URL in Chrome.
2. Sign in with Google.
3. An **"Install Service Call app"** banner will appear at the bottom — tap
   **Install**.
   - Or open the Chrome menu (⋮) → **Install app**.
4. The icon appears on your home screen; tap it to launch in fullscreen.

### iPhone / iPad (Safari)

Apple doesn't support `beforeinstallprompt`, so installation is manual:

1. Open the dashboard in **Safari** (not Chrome — Safari is required on iOS).
2. Tap the **Share** button (square with an up arrow).
3. Scroll down and tap **Add to Home Screen**.
4. Name it "Service Calls" and tap **Add**.

### Desktop (Chrome / Edge)

1. Visit the dashboard URL.
2. Click the **install icon** in the address bar (⊕ / computer-with-arrow),
   or use the banner at the bottom of the screen.
3. The app launches in its own window and pins to the taskbar / dock.

---

## Using the technician view

First launch:

1. Open the app (it starts on `/technician`).
2. Sign in with your Google account.
3. Tap your name from the list ("Who's working today?"). The choice is
   remembered on this device — tap **Switch user** at the top to change it.

Day-to-day:

- **My Calls** tab → everything currently assigned to you (`takenBy` == your
  name).
- **Unassigned** tab → calls no one has picked up yet. Tap **Claim this call**
  to assign it to yourself and mark it In Progress in one shot.
- **All Open** tab → every OPEN or IN_PROGRESS call across the business.
- For calls that are yours:
  - **Start** (amber) marks it `IN_PROGRESS`.
  - **Mark done** (green) marks it `DONE` and removes it from the open list.
- Tap **Call** next to the caller field to dial the customer directly
  (`tel:` link).
- Tap **Open full details** to jump to the full edit screen for notes, etc.
- Tap the floating **+ New Call** button to create a call from the field.

---

## Offline behavior

- A yellow **"Offline — changes will sync when you reconnect"** pill appears
  at the top whenever the device drops network.
- Previously visited pages load from cache; new pages fall back to a friendly
  `/offline` screen.
- Firestore persistence (`persistentLocalCache`) keeps all the service calls
  you've already seen available locally, and any Claim / Start / Done updates
  queue locally and sync automatically as soon as you reconnect — no action
  needed from the tech.

Notes & caveats:
- First load requires network (to download the app shell + auth). After that,
  it works offline until the browser evicts the cache.
- Sign-in itself requires the network (Google OAuth). Stay signed in to avoid
  being locked out in a dead zone.

---

## Deployment checklist

These need to be true in production for the PWA to install cleanly:

1. App is served over **HTTPS** (Firebase App Hosting does this automatically).
2. `/manifest.json` and `/sw.js` are reachable at the site root (they're in
   `service-call-app/public/`, so Next.js serves them at the root already).
3. The `NEXT_PUBLIC_FIREBASE_*` env vars are set (same as today).
4. After deploying a new version, users' service workers will auto-update on
   next load; nothing else to do.

---

## Files added / changed

**New**
- `service-call-app/app/technician/page.tsx` — route entry
- `service-call-app/app/technician/TechnicianView.tsx` — mobile UI
- `service-call-app/app/offline/page.tsx` — offline fallback
- `service-call-app/components/PWARegister.tsx` — SW registration, install
  prompt, offline banner
- `service-call-app/public/manifest.json` — PWA manifest
- `service-call-app/public/sw.js` — service worker
- `service-call-app/public/icons/icon-192.svg`
- `service-call-app/public/icons/icon-512.svg`
- `service-call-app/public/icons/icon-maskable.svg`

**Changed**
- `service-call-app/app/layout.tsx` — manifest link, viewport / theme-color,
  PWARegister mount
- `service-call-app/components/NavBar.tsx` — Technician nav link, don't
  redirect unauthenticated users away from `/technician` or `/offline`
- `service-call-app/lib/firebase.ts` — enable Firestore IndexedDB persistence
  on the client
