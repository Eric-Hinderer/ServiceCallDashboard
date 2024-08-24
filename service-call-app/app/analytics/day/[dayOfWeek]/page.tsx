"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { dayNames } from "@/app/(definitions)/definitions";
import { columns } from "@/app/analytics/day/weekend/columns";
import { DataTable } from "@/app/testing/data-table";

export default function DayAnalyticsPage() {
  const params = useParams();
  const { dayOfWeek } = params;
  const [serviceCalls, setServiceCalls] = useState<any[]>([]);

  useEffect(() => {
    // Retrieve the serviceCalls from sessionStorage
    const storedData = sessionStorage.getItem("serviceCalls");
    if (storedData) {
      setServiceCalls(JSON.parse(storedData));
    }
  }, []);

  return (
    <div className="pt-20 px-6 pb-20">
      <h1 className="text-2xl font-semibold text-center mb-10">
        Service Calls for {dayNames[+dayOfWeek]}
      </h1>
      <DataTable columns={columns} data={serviceCalls} />
    </div>
  );
}
