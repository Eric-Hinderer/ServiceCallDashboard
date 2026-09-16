"use client";

import { useEffect, useState } from "react";
import { updateServiceCall } from "@/lib/service-calls/repository";
import { Status as CallStatus } from "@/lib/service-calls/model";
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
import toast from "react-hot-toast";

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
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = async (newStatus: string) => {
    if (isPending) return;
    // Optimistic update
    setStatus(newStatus);
    
    setIsPending(true);
    try {
      await updateServiceCall(db, id, { status: newStatus as CallStatus });
      const statusLabel = statusOptions.find(opt => opt.value === newStatus)?.label || newStatus;
      toast.success(`Status updated to ${statusLabel}`);
    } catch (error) {
      // Revert on error
      setStatus(currentStatus);
      toast.error("Failed to update status");
      console.error("Failed to update status:", error);
    } finally {
      setIsPending(false);
    }
  };

  const selectedOption = statusOptions.find(
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
