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

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-left">Payment ID</div>, // Ensure this returns JSX or ReactNode
    cell: ({ row }) => {
      const id = row.getValue("id") as string; // Ensure correct type casting
      return <div className="text-left">{id}</div>; // Ensure valid ReactNode is returned
    },
  },
  {
    accessorKey: "email",
    header: () => <div className="text-left">Email</div>, // JSX is a valid ReactNode
    cell: ({ row }) => {
      const email = row.getValue("email") as string; // Type casting to string
      return <div className="text-left">{email}</div>; // Ensure valid ReactNode is returned
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>, // Ensure this returns JSX or ReactNode
    cell: ({ row }) => {
      const status = row.getValue("status") as string; // Ensure the type is string
      return <div className="text-center capitalize">{status}</div>; // Ensure valid ReactNode is returned
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>, // JSX is a valid ReactNode
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount") as string); // Cast to string and then to float
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>; // Ensure valid ReactNode is returned
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];