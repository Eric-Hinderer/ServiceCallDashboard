"use client";

import { createFromForm, emailGroup } from "@/app/dashboard/create/action";
import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import Link from "next/link";

export function SubmitFormButtonEmail({
  closeModalAction,
}: {
  closeModalAction: () => void;
}) {
  const [pending, setPending] = useState(false);
  const handleSendEmail = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setPending(true);

    const form = event.currentTarget.closest("form");
    if (!form) {
      console.error("Form not found");
      setPending(false);
      return;
    }

    const formData = new FormData(form);
    try {
      await emailGroup(formData);
    } catch (err) {
      console.error("Error sending email", err);
    } finally {
      setPending(false);
      closeModalAction();
    }
  };

  return (
    <button
      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      type="submit"
      disabled={pending}
      onClick={handleSendEmail}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating & Sending Email...
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          Create Service Call & Send Email
        </>
      )}
    </button>
  );
}

export function SubmitFormButton({ closeModalAction }: { closeModalAction: () => void }) {
  const [pending, setPending] = useState(false);
  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setPending(true);

    const form = event.currentTarget.closest("form");
    if (!form) {
      console.error("Form not found");
      setPending(false);
      return;
    }

    const formData = new FormData(form);
    try {
      await createFromForm(formData);
    } catch (err) {
      console.error("Error sending email", err);
    } finally {
      setPending(false);
      closeModalAction();
    }
  };

  return (
    <button
      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      type="submit"
      disabled={pending}
      onClick={handleSubmit}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating Service Call...
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          Create Service Call (No Email)
        </>
      )}
    </button>
  );
}

// Submit button specifically for the edit service call form
export function EditFormSubmitButton() {
  const { pending } = useFormStatus();
  
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
      <Link href="/dashboard">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
        >
          Cancel
        </Button>
      </Link>
    </div>
  );
}
