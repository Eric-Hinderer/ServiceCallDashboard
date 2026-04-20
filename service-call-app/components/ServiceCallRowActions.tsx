"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/components/AuthContext";
import { deleteServiceCall } from "@/app/dashboard/action";
import { ServiceCall } from "@/app/(definitions)/definitions";

const DELETE_ALLOWED_USERS = ["Joe Hinderer", "Eric Hinderer"];

export default function ServiceCallRowActions({
  serviceCall,
}: {
  serviceCall: ServiceCall;
}) {
  const { user } = useAuth();
  const canDelete = DELETE_ALLOWED_USERS.includes(user?.displayName ?? "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

  const handleDelete = async () => {
    try {
      const response = await deleteServiceCall(serviceCall.id);
      if (!response.success) {
        console.error("Failed to delete service call:", response.message);
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          ref={dropdownTriggerRef}
          aria-label="Row actions"
          className="h-9 w-9 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={`/dashboard/${serviceCall.id}/edit`}>
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </Link>
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDialogOpen(true);
                dropdownTriggerRef.current?.blur();
              }}
            >
              Delete
            </DropdownMenuItem>

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
                    You are about to delete the service call for the machine:{" "}
                    <strong>{serviceCall.machine}</strong> at{" "}
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
}
