"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function PWARegister() {
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

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed top-16 inset-x-0 z-[1300] mx-auto max-w-md px-4"
    >
      <div className="flex items-center gap-2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-4 py-2 shadow-md text-sm font-medium">
        <WifiOff className="h-4 w-4" />
        <span>Offline — changes will sync when you reconnect.</span>
      </div>
    </div>
  );
}
