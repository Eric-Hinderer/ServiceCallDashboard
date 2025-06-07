"use client";

import { useEffect, useState, useTransition } from "react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import db from "@/lib/firebase";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Circle, Clock, CheckCircle } from "lucide-react";
import React from "react";

const statusOptions = [
  {
    value: "OPEN",
    label: "Open",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: Circle,
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: Clock,
  },
  {
    value: "DONE",
    label: "Done",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
];

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

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    try {
      const serviceCallRef = doc(db, "ServiceCalls", id);
      await updateDoc(serviceCallRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      // Optionally handle error (e.g., show a toast)
      console.error("Failed to update status:", error);
    }
  };

  const selectedOption = statusOptions.find(
    (option) => option.value === status
  );

  return (
    <Select onValueChange={handleStatusChange} value={status}>
      <SelectTrigger
        className={`w-auto rounded-full ${
          selectedOption
            ? `${selectedOption.color} ${selectedOption.bgColor}`
            : ""
        } px-2 py-1 flex items-center whitespace-nowrap`}
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
          {statusOptions.map((option) => (
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
