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
import {
  Typography,
  Container,
  Box,
  useMediaQuery,
  IconButton,
  TextField,
} from "@mui/material";

import Grid from "@mui/material/Grid2";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/PaginationTable";

import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import db from "@/lib/firebase";
import { ServiceCall } from "../(definitions)/definitions";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

interface DataTableProps {
  columns: ColumnDef<ServiceCall, any>[];
}

export function DataTable({ columns }: DataTableProps) {
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const q = query(collection(db, "ServiceCalls"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedServiceCalls = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date ? data.date.toDate() : null,
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
          createdAt: data.createdAt ? data.createdAt.toDate() : null,
        } as ServiceCall;
      });
      setServiceCalls(updatedServiceCalls);
    });

    return () => unsubscribe();
  }, []);

  const handleClickCurrent = async () => {
    const renderedData = table.getRowModel().rows.map((row) => row.original);

    const data = renderedData.map((serviceCall) => ({
      Date: serviceCall.date?.toLocaleDateString(),
      Location: serviceCall.location,
      "Who Called": serviceCall.whoCalled,
      Machine: serviceCall.machine,
      "Reported Problem": serviceCall.reportedProblem,
      "Taken By": serviceCall.takenBy,
      Notes: serviceCall.notes,
      Status: serviceCall.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rendered Data");

    XLSX.writeFile(wb, "service-calls.xlsx");
  };

  const handleClickAll = async () => {
    const data = serviceCalls.map((serviceCall) => ({
      Date: serviceCall.date?.toLocaleDateString(),
      Location: serviceCall.location,
      "Who Called": serviceCall.whoCalled,
      Machine: serviceCall.machine,
      "Reported Problem": serviceCall.reportedProblem,
      "Taken By": serviceCall.takenBy,
      Notes: serviceCall.notes,
      Status: serviceCall.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "All Data");

    XLSX.writeFile(wb, "service-calls-all.xlsx");
  };

  const table = useReactTable({
    data: serviceCalls,
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
      <Box sx={{ padding: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            pb: 4,
          }}
        >
          <Button

            color="primary"
            onClick={handleClickCurrent}
            className="mr-4"
          >
            Export Current Table to Excel
          </Button>

          <Button
            color="secondary"
            onClick={handleClickAll}
          >
            Export All to Excel
          </Button>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Search Location"
              value={
                (table.getColumn("location")?.getFilterValue() as string) ?? ""
              }
              onChange={(event: any) =>
                table.getColumn("location")?.setFilterValue(event.target.value)
              }
              variant="outlined"
              size="small"
              sx={{ width: "100%" }}
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        table.getColumn("location")?.setFilterValue("")
                      }
                      edge="end"
                      size="small"
                    >
                      <AiOutlineClose />
                    </IconButton>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Search Machine"
              value={
                (table.getColumn("machine")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("machine")?.setFilterValue(event.target.value)
              }
              variant="outlined"
              size="small"
              sx={{ width: "100%" }}
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        table.getColumn("machine")?.setFilterValue("")
                      }
                      edge="end"
                      size="small"
                    >
                      <AiOutlineClose />
                    </IconButton>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Search Problem"
              value={
                (table
                  .getColumn("reportedProblem")
                  ?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table
                  .getColumn("reportedProblem")
                  ?.setFilterValue(event.target.value)
              }
              variant="outlined"
              size="small"
              sx={{ width: "100%" }}
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        table.getColumn("reportedProblem")?.setFilterValue("")
                      }
                      edge="end"
                      size="small"
                    >
                      <AiOutlineClose />
                    </IconButton>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Search Notes"
              value={
                (table.getColumn("notes")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("notes")?.setFilterValue(event.target.value)
              }
              variant="outlined"
              size="small"
              sx={{ width: "100%" }}
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        table.getColumn("notes")?.setFilterValue("")
                      }
                      edge="end"
                      size="small"
                    >
                      <AiOutlineClose />
                    </IconButton>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>
      </Box>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
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
