"use client";

import { useEffect, useState, useTransition } from "react";
import { changeTakenBy } from "../app/dashboard/[id]/action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const predefinedNames = [
  "Kurt", "Chris", "Mike", "Dean", "Damon", "John", "Select..."
];

export default function TakenBy({ id, currentTakenBy }: { id: string; currentTakenBy: string }) {
  const [takenBy, setTakenBy] = useState<string>(currentTakenBy || "Select...");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTakenBy(currentTakenBy); 
  }, [currentTakenBy]);

  const handleSelectChange = (newTakenBy: string) => {
    setTakenBy(newTakenBy);

    startTransition(() => {
      changeTakenBy(id, newTakenBy);
    });
  };

  return (
    <Select 
      value={takenBy} 
      onValueChange={handleSelectChange} 
      disabled={isPending}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {predefinedNames.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
        {!predefinedNames.includes(takenBy) && (
          <SelectItem key={takenBy} value={takenBy}>
            {takenBy}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
