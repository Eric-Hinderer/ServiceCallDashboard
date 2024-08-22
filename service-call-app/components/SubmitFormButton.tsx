"use client";

import { createFromForm, emailGroup } from "@/app/dashboard/create/action";
import { useFormStatus } from "react-dom";

export function SubmitFormButtonEmail() {
  const { pending } = useFormStatus();
  return (
    <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" type="submit" disabled={pending} formAction={emailGroup}>
      {pending ? "Please Wait..." : "Create Service Call & Email"}
    </button>
  );
}

export function SubmitFormButton() {
  const { pending } = useFormStatus();
  return (
    <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" type="submit" disabled={pending} formAction={createFromForm}>
      {pending ? "Please Wait..." : "Create Service Call No Email"}
    </button>
  );
}

