"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { EditFormSubmitButton } from "./SubmitFormButton";

type SaveResult = { success: true } | { success: false; message: string };

export default function EditServiceCallForm({
  children,
  saveAction,
  returnTo,
}: {
  children: ReactNode;
  saveAction: (formData: FormData) => Promise<SaveResult>;
  returnTo: "/dashboard" | "/technician";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || !event.currentTarget.reportValidity()) return;
    const formData = new FormData(event.currentTarget);
    submitting.current = true;
    setPending(true);
    setError(null);
    try {
      const result = await saveAction(formData);
      if (!result.success) {
        setError(result.message);
        return;
      }
      toast.success("Changes saved.");
      router.push(returnTo);
      router.refresh();
    } catch {
      setError(
        "Couldn't confirm the save. Your entries are still here; check the dashboard before retrying.",
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={pending}>
      <fieldset disabled={pending} className="space-y-8">
        {children}
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <EditFormSubmitButton pending={pending} cancelFallback={returnTo} />
      </fieldset>
    </form>
  );
}
