"use client";

import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import SmartBack from "@/components/SmartBack";

export function CreateFormSubmitButtons({ pending }: { pending: boolean }) {
  return (
    <div className="space-y-3 pt-6 border-t border-gray-200">
      <Button
        type="submit"
        name="sendEmail"
        value="true"
        disabled={pending}
        className="w-full bg-green-700 hover:bg-green-800 text-white"
      >
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        {pending ? "Saving..." : "Create Service Call & Send Email"}
      </Button>
      <Button
        type="submit"
        name="sendEmail"
        value="false"
        disabled={pending}
        className="w-full"
      >
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        {pending ? "Saving..." : "Create Service Call (No Email)"}
      </Button>
    </div>
  );
}

// Submit button specifically for the edit service call form
export function EditFormSubmitButton({
  cancelFallback = "/dashboard",
  pending = false,
}: {
  cancelFallback?: string;
  pending?: boolean;
} = {}) {
  return (
    <div className="flex gap-4 pt-6 border-t border-gray-200">
      <Button
        type="submit"
        disabled={pending}
        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving Changes...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
      <SmartBack
        fallback={cancelFallback}
        variant="outline"
        className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
      >
        Cancel
      </SmartBack>
    </div>
  );
}
