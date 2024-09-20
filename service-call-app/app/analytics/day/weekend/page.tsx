"use client";
import { DataTable } from "../../data-table";
import { columns } from "./columns";

import { useEffect, useState } from "react";

export default function WeekendServiceCallsPage() {
  const [serviceCalls, setServiceCalls] = useState<any[]>([]);

  useEffect(() => {
    const storedServiceCalls = sessionStorage.getItem("weekendServiceCalls");
    if (storedServiceCalls) {
      setServiceCalls(JSON.parse(storedServiceCalls));
    }
  }, []);

  return (
    <div className="px-6 pb-20">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-10">
        Weekend Service Calls
      </h1>
      <DataTable columns={columns} data={serviceCalls} />
    </div>
  );
}
