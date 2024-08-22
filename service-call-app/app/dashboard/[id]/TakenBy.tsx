"use client";

import { useEffect, useState, useTransition } from "react";
import { changeTakenBy } from "../action";


const predefinedNames = ["Kurt", "Chris", "Mike", "Dean", "Damon", "John", "Select..."];

export default function TakenBy({ id, currentTakenBy }: { id: string; currentTakenBy: string }) {
  const [takenBy, setTakenBy] = useState<string>(currentTakenBy || "Select...");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTakenBy(currentTakenBy); // Sync the local state when the prop changes
    console.log("TakenBy updated to:", currentTakenBy); // Debugging log
  }, [currentTakenBy]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTakenBy = e.target.value;
    setTakenBy(newTakenBy);

    changeTakenBy(id, newTakenBy);
  };

  return (
    <div>
      <select
        value={takenBy}
        onChange={handleSelectChange}
        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        disabled={isPending}
      >
        {!predefinedNames.includes(takenBy) && (
          <option value={takenBy} disabled>
            {takenBy}
          </option>
        )}

        {predefinedNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
