"use client";

import { useState } from "react";
import { changeTakenBy } from "../action";

// Predefined technician names
const predefinedNames = ["Kurt", "Chris", "Mike", "Dean", "Damon", "John", "Select..."];

export default function TakenBy({ id, currentTakenBy }: { id: string; currentTakenBy: string }) {
  const [takenBy, setTakenBy] = useState<string>(currentTakenBy || "Select...");

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTakenBy = e.target.value;
    setTakenBy(newTakenBy);
    // Add your logic to update `takenBy`, e.g., a server call
    changeTakenBy(id, newTakenBy);
  };

  return (
    <div>
      <select
        value={takenBy}
        onChange={handleSelectChange}
        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        {/* If the current takenBy is not in predefinedNames, display it as the first option */}
        {!predefinedNames.includes(takenBy) && (
          <option value={takenBy} disabled>
            {takenBy}
          </option>
        )}
        {/* Render predefined names */}
        {predefinedNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
