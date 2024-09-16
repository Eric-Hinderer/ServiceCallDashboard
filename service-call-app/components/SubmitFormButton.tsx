"use client";

import { createFromForm, emailGroup } from "@/app/dashboard/create/action";
import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

export function SubmitFormButtonEmail({
  closeModal,
}: {
  closeModal: () => void;
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
      closeModal();
    }
  };

  return (
    <button
      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      type="submit"
      disabled={pending}
      onClick={handleSendEmail}
    >
      {pending ? "Please Wait..." : "Create Service Call & Email"}
    </button>
  );
}

export function SubmitFormButton({ closeModal }: { closeModal: () => void }) {
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
      closeModal();
    }
  };

  return (
    <button
      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      type="submit"
      disabled={pending}
      onClick={handleSubmit}
    >
      {pending ? "Please Wait..." : "Create Service Call No Email"}
    </button>
  );
}
