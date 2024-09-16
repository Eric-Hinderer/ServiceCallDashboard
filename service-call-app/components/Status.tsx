"use client";

import { useEffect, useState, useTransition } from "react";
import { changeStatus } from "../app/dashboard/[id]/action";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <Select
    value={status}
    onValueChange={handleStatusChange}
    disabled={isPending}
  >
    <SelectTrigger className="text-left min-w-[121px] py-1 px-2 h-8"> {/* Reduced padding and height */}
      <SelectValue placeholder="Select status..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="OPEN">Open</SelectItem>
      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
      <SelectItem value="DONE">Done</SelectItem>
    </SelectContent>
  </Select>
  
  );
}
