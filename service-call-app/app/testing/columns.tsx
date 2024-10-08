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
import { useAuth } from "@/components/AuthContext";
import { deleteServiceCall } from "../dashboard/action";
import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    cell: ({ row }) => {
      const serviceCall = row.original;
      const { user } = useAuth();
      const allowedUsers = ["Joe Hinderer", "Eric Hinderer"];
      const canDelete = allowedUsers.includes(user?.displayName ?? "");
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

      const handleDelete = async () => {
        try {
          const response = await deleteServiceCall(serviceCall.id);
          if (response.success) {
            console.log("Service call deleted successfully");
          } else {
            console.error("Failed to delete service call:", response.message);
          }
        } catch (error) {
          console.error("Error during deletion:", error);
        }
      };
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" ref={dropdownTriggerRef}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/dashboard/${serviceCall.id}/edit`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            {canDelete && (
              <>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDialogOpen(true); 
                    dropdownTriggerRef.current?.blur() 
                  }}
                >
                  Delete
                </DropdownMenuItem>

                {/* Alert Dialog for Deleting Confirmation */}
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <span />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      Are you sure you want to delete this service call?
                    </AlertDialogHeader>
                    <div>
                      <p>This action cannot be undone.</p>
                      <p>
                        You are about to delete the service call for the
                        machine: <strong>{serviceCall.machine}</strong> at{" "}
                        <strong>{serviceCall.location}</strong>.
                      </p>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          handleDelete();
                          setIsDialogOpen(false);
                        }}
                      >
                        Confirm Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
