"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import toast from "react-hot-toast";
import {
  disablePush,
  enablePush,
  ensureSupported,
  getExistingToken,
  getPermission,
  onForegroundMessage,
  type PushPermission,
} from "@/lib/messaging";
import { useAuth } from "./AuthContext";

interface Props {
  technicianName: string;
}

export default function PushNotifications({ technicianName }: Props) {
  const { user } = useAuth();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<PushPermission>("default");
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await ensureSupported();
      if (cancelled) return;
      setSupported(ok);
      setPermission(getPermission());
      if (ok) {
        const existing = await getExistingToken();
        if (!cancelled) setToken(existing);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      unsub = await onForegroundMessage(({ title, body }) => {
        toast(
          (t) => (
            <div
              onClick={() => toast.dismiss(t.id)}
              className="flex items-start gap-2"
            >
              <BellRing className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <div className="font-semibold text-sm">
                  {title || "Service call update"}
                </div>
                {body && <div className="text-xs text-slate-600">{body}</div>}
              </div>
            </div>
          ),
          { duration: 6000 }
        );
      });
    })();
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const handleEnable = useCallback(async () => {
    if (!technicianName) {
      toast.error("Pick your name first, then enable notifications.");
      return;
    }
    setBusy(true);
    try {
      const { token: newToken } = await enablePush({
        technicianName,
        uid: user?.uid,
        email: user?.email,
      });
      setToken(newToken);
      setPermission("granted");
      toast.success("Push notifications enabled");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Couldn't enable notifications";
      toast.error(msg);
      setPermission(getPermission());
    } finally {
      setBusy(false);
    }
  }, [technicianName, user?.uid, user?.email]);

  const handleDisable = useCallback(async () => {
    setBusy(true);
    try {
      await disablePush(token);
      setToken(null);
      toast.success("Push notifications disabled on this device");
    } catch {
      toast.error("Couldn't disable notifications");
    } finally {
      setBusy(false);
    }
  }, [token]);

  if (supported === null) return null;

  if (!supported) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
        <BellOff className="h-3.5 w-3.5" />
        <span>
          Push not supported here. On iPhone, install the app to the home
          screen first.
        </span>
      </div>
    );
  }

  const enabled = permission === "granted" && !!token;

  if (enabled) {
    return (
      <button
        type="button"
        onClick={handleDisable}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full bg-green-600 text-white px-3 py-1.5 text-xs font-semibold active:scale-95 transition disabled:opacity-60"
        aria-label="Turn off push notifications"
      >
        <BellRing className="h-3.5 w-3.5" />
        Notifications on
      </button>
    );
  }

  if (permission === "denied") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 text-xs">
        <BellOff className="h-3.5 w-3.5" />
        Notifications blocked — enable in browser settings
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleEnable}
      disabled={busy || !technicianName}
      className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold active:scale-95 transition disabled:opacity-60"
      aria-label="Turn on push notifications"
    >
      <Bell className="h-3.5 w-3.5" />
      {busy ? "Enabling…" : "Turn on notifications"}
    </button>
  );
}
