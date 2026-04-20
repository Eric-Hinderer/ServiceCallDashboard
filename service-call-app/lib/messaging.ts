"use client";

import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  deleteToken,
  type Messaging,
} from "firebase/messaging";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseApp } from "./firebaseConfig";
import db from "./firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const SW_URL = "/firebase-messaging-sw.js";

let messagingInstance: Messaging | null = null;
let supportChecked = false;
let supported = false;

export async function ensureSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (supportChecked) return supported;
  supportChecked = true;
  try {
    supported =
      (await isSupported()) &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
  } catch {
    supported = false;
  }
  return supported;
}

async function getMessagingSafe(): Promise<Messaging | null> {
  if (!(await ensureSupported())) return null;
  if (!messagingInstance) messagingInstance = getMessaging(firebaseApp);
  return messagingInstance;
}

async function getOrRegisterSW(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration(SW_URL);
  if (existing) return existing;
  return navigator.serviceWorker.register(SW_URL, {
    scope: "/firebase-cloud-messaging-push-scope",
  });
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export function getPermission(): PushPermission {
  if (typeof window === "undefined" || !("Notification" in window))
    return "unsupported";
  return Notification.permission as PushPermission;
}

export interface EnablePushArgs {
  technicianName: string;
  uid?: string | null;
  email?: string | null;
}

export interface EnablePushResult {
  token: string;
}

export async function enablePush({
  technicianName,
  uid,
  email,
}: EnablePushArgs): Promise<EnablePushResult> {
  if (!(await ensureSupported())) {
    throw new Error(
      "This browser doesn't support push notifications. On iOS, install the app to your home screen first."
    );
  }
  if (!VAPID_KEY) {
    throw new Error(
      "Push not configured: missing NEXT_PUBLIC_FIREBASE_VAPID_KEY."
    );
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Notifications were blocked. Enable them in your browser settings."
        : "Notification permission wasn't granted."
    );
  }

  const registration = await getOrRegisterSW();
  if (!registration)
    throw new Error("Couldn't register the notification service worker.");

  const messaging = await getMessagingSafe();
  if (!messaging) throw new Error("Messaging not available in this browser.");

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  if (!token) throw new Error("Couldn't obtain a device token.");

  await setDoc(
    doc(db, "fcmTokens", token),
    {
      technicianName,
      uid: uid || null,
      email: email || null,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { token };
}

export async function disablePush(token?: string | null): Promise<void> {
  if (!(await ensureSupported())) return;
  try {
    const messaging = await getMessagingSafe();
    if (messaging) await deleteToken(messaging);
  } catch {
    /* ignore */
  }
  if (token) {
    try {
      await deleteDoc(doc(db, "fcmTokens", token));
    } catch {
      /* ignore */
    }
  }
}

export async function getExistingToken(): Promise<string | null> {
  if (!(await ensureSupported())) return null;
  if (getPermission() !== "granted") return null;
  if (!VAPID_KEY) return null;
  try {
    const registration = await getOrRegisterSW();
    if (!registration) return null;
    const messaging = await getMessagingSafe();
    if (!messaging) return null;
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch {
    return null;
  }
}

export async function onForegroundMessage(
  handler: (payload: {
    title?: string;
    body?: string;
    data?: Record<string, string>;
  }) => void
): Promise<() => void> {
  const messaging = await getMessagingSafe();
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    handler({
      title: payload.notification?.title,
      body: payload.notification?.body,
      data: (payload.data as Record<string, string> | undefined) || {},
    });
  });
}
