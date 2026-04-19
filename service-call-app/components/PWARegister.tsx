"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, WifiOff, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_WINDOW_MS = 1000 * 60 * 60 * 24 * 14;

export default function PWARegister() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    if ("serviceWorker" in navigator) {
      const onLoad = () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch((err) => console.warn("SW registration failed:", err));
      };
      if (document.readyState === "complete") onLoad();
      else window.addEventListener("load", onLoad, { once: true });
    }

    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    setOffline(!navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - dismissedAt < DISMISS_WINDOW_MS) return;
      setInstallEvent(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const onInstalled = () => {
      setInstallEvent(null);
      setShowInstall(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setShowInstall(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowInstall(false);
  };

  return (
    <>
      {offline && (
        <div
          role="status"
          className="fixed top-16 inset-x-0 z-[1300] mx-auto max-w-md px-4"
        >
          <div className="flex items-center gap-2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-4 py-2 shadow-md text-sm font-medium">
            <WifiOff className="h-4 w-4" />
            <span>Offline — changes will sync when you reconnect.</span>
          </div>
        </div>
      )}

      {showInstall && (
        <div className="fixed bottom-4 inset-x-0 z-[1300] mx-auto max-w-md px-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl">
            <Download className="h-5 w-5 shrink-0" />
            <div className="flex-1 text-sm">
              <div className="font-semibold">Install Service Call app</div>
              <div className="text-slate-300 text-xs">
                Adds a home-screen icon so you can work offline in the field.
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleInstall}
              className="bg-white text-slate-900 hover:bg-slate-100"
            >
              Install
            </Button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
