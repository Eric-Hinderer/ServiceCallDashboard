"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, ExternalLink, MapPin, User, Wrench } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/DataColumnHeader";
import Link from "next/link";

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'CLOSED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date & Time" />
    ),
    cell: ({ row }) => {
      const dateValue = row.original.date;
      if (!dateValue) return <span className="text-muted-foreground">N/A</span>;
      
      const date = new Date(dateValue);
      return (
        <div className="space-y-1">
          <div className="font-medium">{format(date, 'MMM dd, yyyy')}</div>
          <div className="text-sm text-muted-foreground">
            {format(date, 'h:mm a')} • {formatDistanceToNow(date, { addSuffix: true })}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.getValue("location") || "N/A"}</span>
      </div>
    ),
  },
  {
    accessorKey: "whoCalled",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Caller" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        {row.getValue("whoCalled") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "machine",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Machine" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-muted-foreground" />
        {row.getValue("machine") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "reportedProblem",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Problem" />
    ),
    cell: ({ row }) => {
      const problem = row.getValue("reportedProblem") as string;
      return (
        <div className="max-w-xs">
          <div 
            className="truncate" 
            title={problem || "N/A"}
          >
            {problem || "N/A"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "takenBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned To" />
    ),
    cell: ({ row }) => {
      const takenBy = row.getValue("takenBy") as string;
      const isUnassigned = !takenBy || takenBy === "Select...";
      
      return (
        <span 
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isUnassigned 
              ? "bg-gray-100 text-gray-800" 
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {isUnassigned ? "Unassigned" : takenBy}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status || "Unknown"}
        </span>
      );
    },
  },
  {
    accessorKey: "notes",
    filterFn: "includesString",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string;
      return (
        <div className="max-w-xs">
          <div 
            className="truncate text-sm text-muted-foreground" 
            title={notes || "No notes"}
          >
            {notes || "No notes"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      const dateValue = row.original.updatedAt;
      if (!dateValue) return <span className="text-muted-foreground">N/A</span>;
      
      const date = new Date(dateValue);
      return (
        <div className="text-sm">
          <div>{format(date, 'MMM dd')}</div>
          <div className="text-muted-foreground">
            {formatDistanceToNow(date, { addSuffix: true })}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const serviceCall = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href={`/dashboard/${serviceCall.id}/edit`}>
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit Service Call
              </DropdownMenuItem>
            </Link>
            <Link href={`/dashboard/${serviceCall.id}`}>
              <DropdownMenuItem className="cursor-pointer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
