"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/DataColumnHeader";

import Status from "../../components/Status";
import { ServiceCall } from "../(definitions)/definitions";
import TakenBy from "@/components/TakenBy";
import ServiceCallRowActions from "@/components/ServiceCallRowActions";

export const columns: ColumnDef<ServiceCall>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.original.date.toLocaleString();
      return date;
    },
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
      return (
        <TakenBy
          id={serviceCall.id.toString()}
          currentTakenBy={serviceCall.takenBy!}
        />
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const serviceCall = row.original;
      return (
        <Status
          id={serviceCall.id.toString()}
          currentStatus={serviceCall.status}
        />
      );
    },
  },
  {
    accessorKey: "notes",
    filterFn: "includesString",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const date = row.original.updatedAt.toLocaleString();
      return date;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ServiceCallRowActions serviceCall={row.original} />,
  },
];
