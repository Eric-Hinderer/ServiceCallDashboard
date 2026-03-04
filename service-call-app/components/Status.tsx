"use client";

import { useEffect, useState, useTransition } from "react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import db from "@/lib/firebase";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import React from "react";
import toast from "react-hot-toast";
import { STATUS_OPTIONS, FIRESTORE_COLLECTION } from "@/lib/constants";

export default function Status({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState<string>(currentStatus);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);

    startTransition(async () => {
      try {
        const serviceCallRef = doc(db, FIRESTORE_COLLECTION, id);
        await updateDoc(serviceCallRef, {
          status: newStatus,
          updatedAt: Timestamp.now(),
        });
        const statusLabel = STATUS_OPTIONS.find(opt => opt.value === newStatus)?.label || newStatus;
        toast.success(`Status updated to ${statusLabel}`);
      } catch (error) {
        setStatus(currentStatus);
        toast.error("Failed to update status");
      }
    });
  };

  const selectedOption = STATUS_OPTIONS.find(
    (option) => option.value === status
  );

  return (
    <Select onValueChange={handleStatusChange} value={status} disabled={isPending}>
      <SelectTrigger
        className={`w-auto rounded-full ${
          selectedOption
            ? `${selectedOption.color} ${selectedOption.bgColor}`
            : ""
        } px-2 py-1 flex items-center whitespace-nowrap ${isPending ? 'opacity-75' : ''}`}
      >
        {selectedOption && (
          <div className="flex items-center">
            {React.createElement(selectedOption.icon, {
              className: "mr-2 h-4 w-4",
            })}
            {selectedOption.label}
          </div>
        )}
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div
                className={`flex items-center ${option.color} whitespace-nowrap`}
              >
                {React.createElement(option.icon, {
                  className: "mr-2 h-4 w-4",
                })}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
