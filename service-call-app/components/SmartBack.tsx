"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  fallback: string;
  children?: ReactNode;
  className?: string;
  variant?: "link" | "outline";
};

/**
 * Navigates back if there's history; otherwise pushes `fallback`.
 * Use for Back/Cancel buttons that should return to the previous page
 * (e.g. /technician) but still work if opened directly from a URL.
 */
export default function SmartBack({
  fallback,
  children,
  className,
  variant = "link",
}: Props) {
  const router = useRouter();

  const go = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  if (variant === "outline") {
    return (
      <Button type="button" variant="outline" onClick={go} className={className}>
        {children ?? (
          <>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </>
        )}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={go}
      className={
        className ??
        "inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      }
    >
      {children ?? (
        <>
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </>
      )}
    </button>
  );
}
