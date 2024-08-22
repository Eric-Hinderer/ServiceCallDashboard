'use client';

import { useEffect, useState, useTransition } from "react";
import { changeStatus } from "../action";

export default function Status({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  

  useEffect(() => {
    setStatus(currentStatus); // Sync the local state when the prop changes

  }, [currentStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    // Trigger the server action to update the status, using transition to prevent blocking the UI
    startTransition(() => {
      changeStatus(id, newStatus);
    });
  };

  return (
    <div>
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>
    </div>
  );
}
