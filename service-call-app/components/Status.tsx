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
import { STATUS_OPTIONS, ServiceCallStatus } from "@/lib/types";

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

  const selectedOption = STATUS_OPTIONS.find(
    (option) => option.value === status
  );

  const getStatusClasses = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? `${option.color} ${option.bgColor}` : 'text-gray-700 bg-gray-100';
  };

  return (
    <Select onValueChange={handleStatusChange} value={status}>
      <SelectTrigger
        className={`w-auto rounded-full px-2 py-1 flex items-center whitespace-nowrap ${getStatusClasses(status)}`}
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
