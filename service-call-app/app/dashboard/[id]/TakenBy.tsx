"use client";

import { useState } from "react";
import { changeTakenBy } from "../action";

export default function TakenBy({
  id,
  currentTakenBy,
}: {
  id: string;
  currentTakenBy: string;
}) {
  // Ensure `currentTakenBy` is not null or undefined by defaulting to an empty string
  const [takenBy, setTakenBy] = useState(currentTakenBy || "Choose a technician");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTakenBy = e.target.value;
    setTakenBy(newTakenBy);

    // Trigger the server action to update the status
    changeTakenBy(id, newTakenBy);
  };

  return (
    <div>
      <select
        value={takenBy || "Select..."} // Ensure value is not null
        onChange={handleChange}
        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="Kurt">Kurt</option>
        <option value="Chris">Chris</option>
        <option value="Mike">Mike</option>
        <option value="Dean">Dean</option>
        <option value="Damon">Damon</option>
        <option value="John">John</option>
        <option value="Select...">Select...</option>
      </select>
    </div>
  );
}
