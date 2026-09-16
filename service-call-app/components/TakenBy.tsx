"use client";

import { useEffect, useState } from "react";
import { updateServiceCall } from "@/lib/service-calls/repository";
import db from "@/lib/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

const predefinedNames = [
  "Kurt", "Chris", "Mike", "Dean", "Damon", "John", "Aaron", "Select..."
];

export default function TakenBy({ id, currentTakenBy }: { id: string; currentTakenBy: string }) {
  const [takenBy, setTakenBy] = useState<string>(currentTakenBy || "Select...");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setTakenBy(currentTakenBy || "Select...");
  }, [currentTakenBy]);

  const handleSelectChange = async (newTakenBy: string) => {
    if (isPending) return;
    // Optimistic update
    setTakenBy(newTakenBy);

    setIsPending(true);
    try {
      await updateServiceCall(db, id, { takenBy: newTakenBy });
      toast.success(`Assigned to ${newTakenBy === "Select..." ? "unassigned" : newTakenBy}`);
    } catch (error) {
      // Revert on error
      setTakenBy(currentTakenBy);
      toast.error("Failed to update assignment");
      console.error("Failed to update takenBy:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Select 
      value={takenBy} 
      onValueChange={handleSelectChange} 
      disabled={isPending}
    >
      <SelectTrigger className={`w-auto rounded-full pr-3 ${isPending ? 'opacity-75' : ''}`}>
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {predefinedNames.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
        {takenBy.trim() !== "" && !predefinedNames.includes(takenBy) && (
          <SelectItem key={takenBy} value={takenBy}>
            {takenBy}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
