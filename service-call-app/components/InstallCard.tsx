"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Smartphone,
} from "lucide-react";
import { useInstallState, type InstallPlatform } from "./useInstallState";

export default function InstallCard() {
  const { canPrompt, promptInstall, isInstalled, platform } = useInstallState();
  const [showInstructions, setShowInstructions] = useState(false);

  if (isInstalled) return null;

  return (
    <Card className="border-slate-900 bg-slate-50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Smartphone className="h-5 w-5 text-slate-700 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-slate-900">
              Install the app on this device
            </div>
            <div className="text-xs text-slate-600">
              Adds a home-screen icon and lets you work offline in the field.
            </div>
          </div>
        </div>

        {canPrompt ? (
          <Button onClick={promptInstall} className="w-full h-11 text-base">
            <Download className="h-4 w-4 mr-2" /> Install now
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setShowInstructions((s) => !s)}
              className="w-full h-11 text-base"
            >
              {showInstructions ? (
                <ChevronUp className="h-4 w-4 mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              How to install on this device
            </Button>
            {showInstructions && <Instructions platform={platform} />}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Instructions({ platform }: { platform: InstallPlatform }) {
  if (platform === "ios") {
    return (
      <div className="rounded-md bg-white border border-slate-200 p-3">
        <div className="text-sm font-medium mb-2">iPhone / iPad (Safari)</div>
        <ol className="text-sm text-slate-700 space-y-1.5 pl-5 list-decimal">
          <li>
            Make sure this page is open in <strong>Safari</strong> (not Chrome —
            iOS only allows Safari to install PWAs).
          </li>
          <li>
            Tap the <Share2 className="inline h-4 w-4 -mt-0.5" />{" "}
            <strong>Share</strong> button at the bottom of Safari.
          </li>
          <li>
            Scroll down and tap <strong>Add to Home Screen</strong>.
          </li>
          <li>
            Name it &ldquo;Service Calls&rdquo; and tap <strong>Add</strong>.
            The icon now appears on your home screen.
          </li>
        </ol>
      </div>
    );
  }

  if (platform === "android") {
    return (
      <div className="rounded-md bg-white border border-slate-200 p-3">
        <div className="text-sm font-medium mb-2">Android (Chrome)</div>
        <ol className="text-sm text-slate-700 space-y-1.5 pl-5 list-decimal">
          <li>Tap the Chrome menu (⋮) in the top right.</li>
          <li>
            Tap <strong>Install app</strong> (or{" "}
            <strong>Add to Home screen</strong>).
          </li>
          <li>
            Confirm <strong>Install</strong>.
          </li>
          <li>
            If you don&apos;t see the option yet, keep using the app for another
            minute and try again — Chrome only shows it after a little
            engagement.
          </li>
        </ol>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-white border border-slate-200 p-3">
      <div className="text-sm font-medium mb-2">Desktop</div>
      <ol className="text-sm text-slate-700 space-y-1.5 pl-5 list-decimal">
        <li>
          In the address bar, look for the install icon (⊕ / computer with an
          arrow).
        </li>
        <li>
          Click it, then confirm <strong>Install</strong>.
        </li>
        <li>
          Or open the browser menu and choose{" "}
          <strong>Install Service Call Dashboard</strong>.
        </li>
      </ol>
    </div>
  );
}
