"use client";

import { createFromForm, emailGroup } from "@/app/dashboard/create/action";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface CreateButtonProps {
  closeModalAction: () => void;
}

function CreateFormButton({
  closeModalAction,
  action,
  pendingLabel,
  label,
  gradientClasses,
}: CreateButtonProps & {
  action: (formData: FormData) => Promise<void>;
  pendingLabel: string;
  label: string;
  gradientClasses: string;
}) {
  const [pending, setPending] = useState(false);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setPending(true);

    const form = event.currentTarget.closest("form");
    if (!form) {
      setPending(false);
      return;
    }

    const formData = new FormData(form);
    try {
      await action(formData);
    } catch (err) {
      console.error("Error submitting form:", err);
    } finally {
      setPending(false);
      closeModalAction();
    }
  };

  return (
    <button
      className={`w-full ${gradientClasses} text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
      type="submit"
      disabled={pending}
      onClick={handleClick}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}

export function SubmitFormButtonEmail({ closeModalAction }: CreateButtonProps) {
  return (
    <CreateFormButton
      closeModalAction={closeModalAction}
      action={emailGroup}
      pendingLabel="Creating & Sending Email..."
      label="Create Service Call & Send Email"
      gradientClasses="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
    />
  );
}

export function SubmitFormButton({ closeModalAction }: CreateButtonProps) {
  return (
    <CreateFormButton
      closeModalAction={closeModalAction}
      action={createFromForm}
      pendingLabel="Creating Service Call..."
      label="Create Service Call (No Email)"
      gradientClasses="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
    />
  );
}

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
