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

**Every device:** open `/technician` in the app, and tap the **Install the app
on this device** card at the top. If the browser supports an automatic prompt
(Android Chrome / desktop Chrome / Edge), you'll get an **Install now** button;
otherwise the same card expands to show the right step-by-step for iOS /
Android / desktop.

### Android (Chrome)

1. Visit the dashboard URL in Chrome.
2. Sign in with Google → navigate to **Technician**.
3. Tap **Install now** on the install card (or open Chrome menu ⋮ →
   **Install app**).
4. The icon appears on your home screen; tap it to launch in fullscreen.

Note: Chrome on Android sometimes waits ~30 seconds of engagement before
making the automatic prompt available. If you see **How to install on this
device** instead of **Install now**, expand it and follow the manual steps, or
wait a bit and re-open the page.

### iPhone / iPad (Safari)

iOS Safari does not support the automatic install prompt. You'll always see
the **How to install on this device** button on the install card — tap it and
follow the steps:

1. Open the dashboard in **Safari** (not Chrome — iOS only lets Safari install
   PWAs).
2. Tap the **Share** button (square with an up arrow) at the bottom of Safari.
3. Scroll down and tap **Add to Home Screen**.
4. Name it "Service Calls" and tap **Add**.

### Desktop (Chrome / Edge)

1. Visit the dashboard URL.
2. Click the **install icon** in the address bar (⊕ / computer-with-arrow),
   or click **Install now** on the install card inside `/technician`.
3. The app launches in its own window and pins to the taskbar / dock.

### Troubleshooting: "I don't see an install prompt"

- The automatic prompt is Chrome / Edge only. iOS Safari **never** shows one —
  use the manual steps above.
- The prompt only fires after the service worker is registered. Open the app
  once online, let it load, then try again.
- If you've previously dismissed the prompt, the install card on
  `/technician` is still available and will trigger the native install flow
  whenever Chrome makes it available.
- In private / incognito windows, install is disabled by the browser.

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

## Push notifications

Techs can receive a push notification on their phone the moment a call is
assigned to them (the `takenBy` field changes to their name).

### How it works

- Each device registers an FCM token against the technician name stored in
  `localStorage` (same identity used for "My Calls"). Tokens live in the
  `fcmTokens` Firestore collection, keyed by the token string.
- A Cloud Function (`notifyOnServiceCallAssigned`) watches every write to
  `ServiceCalls/*`. When `takenBy` changes to a real technician name, it looks
  up every token registered for that name and sends a push to all of them.
- The background notification is rendered by `/firebase-messaging-sw.js`
  (served by a Next.js route handler with the Firebase config injected). In the
  foreground, the app shows a toast instead of a system notification.
- Tapping a notification opens `/technician`. Stale / unregistered tokens are
  deleted automatically.

### One-time setup (per deployment)

1. **Enable Cloud Messaging** in the Firebase console for the project.
2. **Generate a VAPID key pair** in Firebase Console → Project Settings → Cloud
   Messaging → Web Push certificates → *Generate key pair*.
3. **Find the Sender ID** on the same page (a numeric value).
4. **Add two env vars** wherever the app reads `NEXT_PUBLIC_FIREBASE_*` (local
   `.env.local` and Firebase App Hosting secrets):
   ```
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=<public VAPID key from step 2>
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender id from step 3>
   ```
5. **Deploy the Cloud Function**:
   ```
   cd functions && npm install
   firebase deploy --only functions:notifyOnServiceCallAssigned
   ```

### Using it (per tech, per device)

1. Open the PWA on the phone (install it first on iPhone — see install steps
   above; iOS requires an installed PWA for push).
2. Sign in and pick your name on the "Who's working today?" screen.
3. Tap **Turn on notifications** at the top of the Technician screen and
   approve the browser permission prompt.
4. You'll see a green **Notifications on** pill. From then on, any call
   assigned to you triggers a push on this device — even when the app is
   closed. Tap the notification to jump back into `/technician`.
5. Tap the green pill again to turn them off on that device.

### Caveats

- **iOS**: push only works if the PWA is **installed to the home screen** and
  running iOS 16.4+. Plain Safari won't prompt for permission.
- **Permission denied**: if a tech previously blocked notifications, the UI
  shows a "Notifications blocked" pill. They have to re-enable them via the
  browser's site settings; the app can't re-prompt.
- **Identity is per device**: because we key off the `technician-name` in
  `localStorage`, if a tech shares a phone with someone else, tapping **Switch
  user** will *not* automatically remove the old FCM token — the replaced
  tech's pushes will keep going to that phone until they tap the green pill to
  disable, or their token ages out and the CF cleans it up.

---

---

## Admin view (`/admin`)

Admins get a separate operations screen with:

- Totals: Open, In Progress, Overdue, Unassigned
- Per-technician workload with click-to-filter rows
- One-screen list of every active call with inline reassign (`TakenBy`),
  status change, and link to the full edit view

**Who counts as an admin?** The allowlist lives in
`service-call-app/lib/admins.ts`:

```ts
export const ADMIN_DISPLAY_NAMES = ["Joe Hinderer", "Eric Hinderer"];
```

The check is against the signed-in Firebase user's `displayName`. If your
Google display name matches, the **Admin** tab appears in the top nav and
`/admin` loads. If not, `/admin` shows a friendly "Not authorized" card.

**Caveat — this is UI-level authorization only.** There is no Firestore rule
today that prevents a non-admin from writing the same data directly. Harden
this by adding a rule in `firestore.rules` that only lets admins (by uid) write
to privileged fields. See the sign-in notes in `README.md`.

---

## Files added / changed

**New**
- `service-call-app/app/technician/page.tsx` — route entry
- `service-call-app/app/technician/TechnicianView.tsx` — mobile UI
- `service-call-app/app/admin/page.tsx` — admin route entry
- `service-call-app/app/admin/AdminView.tsx` — admin dashboard
- `service-call-app/app/offline/page.tsx` — offline fallback
- `service-call-app/components/PWARegister.tsx` — SW registration + offline
  banner
- `service-call-app/components/InstallCard.tsx` — always-visible install CTA
  with platform-specific instructions
- `service-call-app/components/useInstallState.tsx` — install/platform hook
- `service-call-app/lib/admins.ts` — admin allowlist helper
- `service-call-app/public/manifest.json` — PWA manifest
- `service-call-app/public/sw.js` — service worker
- `service-call-app/public/icons/icon-192.svg`
- `service-call-app/public/icons/icon-512.svg`
- `service-call-app/public/icons/icon-maskable.svg`

**Changed**
- `service-call-app/app/layout.tsx` — manifest link, viewport / theme-color,
  PWARegister mount
- `service-call-app/components/NavBar.tsx` — Technician + Admin nav links,
  don't redirect unauthenticated users away from `/technician`, `/admin`, or
  `/offline`
- `service-call-app/lib/firebase.ts` — enable Firestore IndexedDB persistence
  on the client
