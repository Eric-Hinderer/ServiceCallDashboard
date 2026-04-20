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
import { Box, IconButton, TextField } from "@mui/material";

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
import { DataTablePagination } from "@/components/PaginationTable";

import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import db from "@/lib/firebase";
import { ServiceCall } from "../(definitions)/definitions";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import Status from "@/components/Status";
import TakenBy from "@/components/TakenBy";
import ServiceCallRowActions from "@/components/ServiceCallRowActions";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Clock, MapPin } from "lucide-react";

interface DataTableProps {
  columns: ColumnDef<ServiceCall, any>[];
}

export function DataTable({ columns }: DataTableProps) {
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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

  const exportToExcel = async (
    rows: ServiceCall[],
    sheetName: string,
    fileName: string
  ) => {
    const data = rows.map((serviceCall) => ({
      Date: serviceCall.date?.toLocaleDateString(),
      Location: serviceCall.location,
      "Who Called": serviceCall.whoCalled,
      Machine: serviceCall.machine,
      "Reported Problem": serviceCall.reportedProblem,
      "Taken By": serviceCall.takenBy,
      Notes: serviceCall.notes,
      Status: serviceCall.status,
    }));

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(sheetName);

    const headerKeys = Object.keys(data[0] || {});
    ws.columns = headerKeys.map((key) => ({ header: key, key }));
    data.forEach((row) => ws.addRow(row));

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClickCurrent = async () => {
    const renderedData = table.getRowModel().rows.map((row) => row.original);
    await exportToExcel(renderedData, "Rendered Data", "service-calls.xlsx");
  };

  const handleClickAll = async () => {
    await exportToExcel(serviceCalls, "All Data", "service-calls-all.xlsx");
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
      <Box sx={{ padding: { xs: 0, sm: 2 }, pb: { xs: 2, sm: 2 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "stretch", md: "flex-end" },
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            pb: { xs: 2, sm: 4 },
            gap: 2,
          }}
        >
          <Button
            className="text-white px-4 py-2 rounded-md hover:bg-primary-dark transition mb-2 sm:mb-0"
            onClick={handleClickCurrent}
          >
            Export Current Table to Excel
          </Button>

          <Button
            className="text-white px-4 py-2 rounded-md hover:bg-secondary-dark transition"
            onClick={handleClickAll}
          >
            Export All to Excel
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
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

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
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

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
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

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
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
      <div className="hidden md:block rounded-md border">
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

      {/* Mobile card list */}
      <div className="md:hidden">
        {table.getRowModel().rows?.length ? (
          <ul className="space-y-2">
            {table.getRowModel().rows.map((row) => {
              const call = row.original;
              return (
                <li
                  key={row.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 truncate">
                        <MapPin
                          className="h-4 w-4 text-slate-500 shrink-0"
                          aria-hidden
                        />
                        <span className="truncate">
                          {call.location || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Clock className="h-3 w-3" aria-hidden />
                        {call.date
                          ? formatDistanceToNow(call.date, { addSuffix: true })
                          : "No date"}
                        {call.overDue && (
                          <span className="ml-1 inline-flex items-center gap-0.5 text-red-700 font-medium">
                            <AlertCircle className="h-3 w-3" aria-hidden />
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                    <ServiceCallRowActions serviceCall={call} />
                  </div>

                  <div className="text-sm text-slate-800 mt-2">
                    <span className="font-medium text-slate-700">Problem:</span>{" "}
                    {call.reportedProblem || "—"}
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-600 mt-2">
                    <div className="truncate">
                      <span className="font-medium text-slate-700">
                        Machine:
                      </span>{" "}
                      {call.machine || "—"}
                    </div>
                    <div className="truncate">
                      <span className="font-medium text-slate-700">
                        Caller:
                      </span>{" "}
                      {call.whoCalled || "—"}
                    </div>
                  </div>

                  {call.notes && (
                    <div className="text-xs bg-slate-50 rounded-md p-2 text-slate-700 border border-slate-100 mt-2">
                      {call.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100">
                    <div className="min-w-0">
                      <TakenBy
                        id={call.id.toString()}
                        currentTakenBy={call.takenBy!}
                      />
                    </div>
                    <Status
                      id={call.id.toString()}
                      currentStatus={call.status}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No results.
          </div>
        )}
        <div className="mt-3">
          <DataTablePagination table={table} />
        </div>
      </div>
    </div>
  );
}
