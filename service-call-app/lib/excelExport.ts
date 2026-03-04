import * as XLSX from "xlsx";
import { ServiceCall } from "@/app/(definitions)/definitions";

function serviceCallToRow(serviceCall: ServiceCall) {
  return {
    Date: serviceCall.date?.toLocaleDateString(),
    Location: serviceCall.location,
    "Who Called": serviceCall.whoCalled,
    Machine: serviceCall.machine,
    "Reported Problem": serviceCall.reportedProblem,
    "Taken By": serviceCall.takenBy,
    Notes: serviceCall.notes,
    Status: serviceCall.status,
  };
}

export function exportToExcel(
  serviceCalls: ServiceCall[],
  filename: string,
  sheetName: string
) {
  const data = serviceCalls.map(serviceCallToRow);
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}
