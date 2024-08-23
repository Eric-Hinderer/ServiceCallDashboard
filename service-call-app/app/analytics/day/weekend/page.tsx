"use client";

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
    <div className="pt-20 px-6 pb-20">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-10">
        Weekend Service Calls
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
