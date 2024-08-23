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
import TakenBy from "../dashboard/[id]/TakenBy";
import Status from "../dashboard/[id]/Status";

export const columns: ColumnDef<ServiceCall>[] = [
  {
  
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.date?.toString() || "");
      return date.toLocaleString(); // Format the date to locale string
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
      const date = new Date(row.original.updatedAt?.toString() || "");
      return date.toLocaleString(); // Format the date to locale string
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
