"use client";

import { useEffect, useState, useTransition } from "react";
import { changeStatus } from "../app/dashboard/[id]/action";
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
  { value: "OPEN", label: "Open", color: "text-blue-500", icon: Circle },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    color: "text-yellow-500",
    icon: Clock,
  },
  { value: "DONE", label: "Done", color: "text-green-500", icon: CheckCircle },
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

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);

    startTransition(() => {
      changeStatus(id, newStatus);
    });
  };

  const selectedOption = statusOptions.find(
    (option) => option.value === status
  );

  return (
    <Select onValueChange={handleStatusChange} value={status}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select status">
          {selectedOption && (
            <div className={`flex items-center ${selectedOption.color}`}>
              {React.createElement(selectedOption.icon, {
                className: "mr-2 h-4 w-4",
              })}
              {selectedOption.label}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className={`flex items-center ${option.color}`}>
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
