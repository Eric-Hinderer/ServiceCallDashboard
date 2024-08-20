'use client';

import { useState } from "react";
import { changeStatus } from "../action";

export default function Status({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    // Trigger the server action to update the status
    changeStatus(id, newStatus);
  };

  return (
    <div>
      <select
        value={status}
        onChange={handleChange}
        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>
    </div>
  );
}
