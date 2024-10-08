"use client";
import {
  ColumnDef,
  flexRender,
  getPaginationRowModel,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { AiOutlineClose } from "react-icons/ai";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/PaginationTable";
import { ServiceCall } from "../(definitions)/definitions"; 

interface DataTableProps {
  columns: ColumnDef<any, any>[];
  data: ServiceCall[];
}

export function DataTable({ columns, data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data, 
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      <div className="flex py-4 items-center justify-center">
        {/* Search Inputs */}
        <div className="relative max-w-sm mr-4">
          <Input
            placeholder="Search Location"
            value={(table.getColumn("location")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("location")?.setFilterValue(event.target.value)}
            className="w-full pr-10"
          />
          <AiOutlineClose
            onClick={() => table.getColumn("location")?.setFilterValue("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
          />
        </div>
        <div className="relative max-w-sm mr-4">
          <Input
            placeholder="Search Machine"
            value={(table.getColumn("machine")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("machine")?.setFilterValue(event.target.value)}
            className="w-full pr-10"
          />
          <AiOutlineClose
            onClick={() => table.getColumn("machine")?.setFilterValue("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
          />
        </div>
        <div className="relative max-w-sm mr-4">
          <Input
            placeholder="Search Problem"
            value={(table.getColumn("reportedProblem")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("reportedProblem")?.setFilterValue(event.target.value)}
            className="w-full pr-10"
          />
          <AiOutlineClose
            onClick={() => table.getColumn("reportedProblem")?.setFilterValue("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
          />
        </div>
        <div className="relative max-w-sm mr-4">
          <Input
            placeholder="Search Notes"
            value={(table.getColumn("notes")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("notes")?.setFilterValue(event.target.value)}
            className="w-full pr-10"
          />
          <AiOutlineClose
            onClick={() => table.getColumn("notes")?.setFilterValue("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
