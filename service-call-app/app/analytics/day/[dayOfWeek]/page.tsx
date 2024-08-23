"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { dayNames } from "@/app/(definitions)/definitions";

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
      <ul className="space-y-4">
        {serviceCalls.map((call: any) => (
          <li key={call._id} className="border p-4 rounded-md">
            <p>
              <strong>Date:</strong> {new Date(call.date).toLocaleString()}
            </p>
            <p>
              <strong>Location:</strong> {call.location}
            </p>
            <p>
              <strong>Who Called:</strong> {call.whoCalled}
            </p>
            <p>
              <strong>Machine:</strong> {call.machine}
            </p>
            <p>
              <strong>Reported Problem:</strong> {call.reportedProblem}
            </p>
            <p>
              <strong>Taken By:</strong> {call.takenBy}
            </p>
            <p>
              <strong>Status:</strong> {call.status}
            </p>
            <p>
              <strong>Notes:</strong> {call.notes}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
