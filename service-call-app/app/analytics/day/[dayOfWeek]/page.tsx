"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DAY_NAMES } from "@/lib/types";
import { columns } from "@/app/analytics/day/weekend/columns";
import { DataTable } from "../../data-table";


export default function DayAnalyticsPage() {
  const params = useParams();
  const { dayOfWeek } = params;
  const [serviceCalls, setServiceCalls] = useState<any[]>([]);

  useEffect(() => {

    const storedData = sessionStorage.getItem("serviceCalls");
    if (storedData) {
      setServiceCalls(JSON.parse(storedData));
    }
  }, []);

  return (
    <div className="px-6 pb-20">
      <h1 className="text-2xl font-semibold text-center mb-10">
        Service Calls for {DAY_NAMES[+dayOfWeek]}
      </h1>
      <DataTable columns={columns as any} data={serviceCalls} />
    </div>
  );
}
