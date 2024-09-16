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

import Link from "next/link";

import Status from "../../components/Status";
import { ServiceCall } from "../(definitions)/definitions";
import TakenBy from "@/components/TakenBy";

export const columns: ColumnDef<ServiceCall>[] = [
  {
  
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.original.date.toLocaleString()
      return date; 
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
    cell: ({ row }) => {
      const serviceCall = row.original;
      return <TakenBy id={serviceCall.id.toString()} currentTakenBy={serviceCall.takenBy!} />;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const serviceCall = row.original;
      return <Status id={serviceCall.id.toString()} currentStatus={serviceCall.status} />;
    },
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
      const date = row.original.updatedAt.toLocaleString()
      return date;  // Format the date to locale string
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const serviceCall = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/dashboard/${serviceCall.id}/edit`}>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
