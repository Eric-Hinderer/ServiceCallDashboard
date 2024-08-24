"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

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
import { ServiceCall } from "@prisma/client";
import Link from "next/link";


export const columns: ColumnDef<ServiceCall>[] = [
  {
  
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.date?.toString() || "");
      return date.toLocaleString(); 
    }
    
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
  },
  {
    accessorKey: "whoCalled",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Who Called" />
    ),
  },
  {
    accessorKey: "machine",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Machine" />
    ),
  },
  {
    accessorKey: "reportedProblem",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reported Problem" />
    ),
  },
  {
    accessorKey: "takenBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Taken By" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    accessorKey: "notes",
    filterFn: 'includesString',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const date = new Date(row.original.updatedAt?.toString() || "");
      return date.toLocaleString(); // Format the date to locale string
    }
  },
];
