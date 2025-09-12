"use client";

import { useEffect, useState, useTransition } from "react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import db from "@/lib/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PREDEFINED_NAMES } from "@/lib/types";

export default function TakenBy({ id, currentTakenBy }: { id: string; currentTakenBy: string }) {
  const [takenBy, setTakenBy] = useState<string>(currentTakenBy || "Select...");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTakenBy(currentTakenBy); 
  }, [currentTakenBy]);

  const handleSelectChange = async (newTakenBy: string) => {
    setTakenBy(newTakenBy);

    try {
      const serviceCallRef = doc(db, "ServiceCalls", id);
      await updateDoc(serviceCallRef, {
        takenBy: newTakenBy,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      // Optionally handle error (e.g., show a toast)
      console.error("Failed to update takenBy:", error);
    }
  };

  return (
    <Select 
      value={takenBy} 
      onValueChange={handleSelectChange} 
      disabled={isPending}
    >
      <SelectTrigger className="w-auto rounded-full pr-3">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {PREDEFINED_NAMES.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
        {!PREDEFINED_NAMES.includes(takenBy) && (
          <SelectItem key={takenBy} value={takenBy}>
            {takenBy}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
