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
import toast from "react-hot-toast";
import { TECHNICIANS, UNASSIGNED_VALUE, FIRESTORE_COLLECTION } from "@/lib/constants";

const predefinedNames = [...TECHNICIANS, UNASSIGNED_VALUE];

export default function TakenBy({ id, currentTakenBy }: { id: string; currentTakenBy: string }) {
  const [takenBy, setTakenBy] = useState<string>(currentTakenBy || UNASSIGNED_VALUE);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTakenBy(currentTakenBy); 
  }, [currentTakenBy]);

  const handleSelectChange = (newTakenBy: string) => {
    // Optimistic update
    setTakenBy(newTakenBy);

    startTransition(async () => {
      try {
        const serviceCallRef = doc(db, FIRESTORE_COLLECTION, id);
        await updateDoc(serviceCallRef, {
          takenBy: newTakenBy,
          updatedAt: Timestamp.now(),
        });
        toast.success(`Assigned to ${newTakenBy === UNASSIGNED_VALUE ? "unassigned" : newTakenBy}`);
      } catch (error) {
        setTakenBy(currentTakenBy);
        toast.error("Failed to update assignment");
      }
    });
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
        {!predefinedNames.includes(takenBy) && (
          <SelectItem key={takenBy} value={takenBy}>
            {takenBy}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
