"use client";
import db from "@/lib/firebase";
import { useState, useEffect } from "react";

import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { ServiceCall } from "../(definitions)/definitions";
import TakenBy from "../dashboard/[id]/TakenBy";
import Status from "../dashboard/[id]/Status";
import Link from "next/link";

const fetchOverdueCalls = async () => {
  try {
    // Create a query to get ServiceCalls where overDue is true and order by date in descending order
    const q = query(
      collection(db, "ServiceCalls"),
      where("overDue", "==", true)
    );

    // Fetch the documents matching the query
    const querySnapshot = await getDocs(q);

    const calls = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            date: data.date ? data.date.toDate() : null,
            location: data.location,
            whoCalled: data.whoCalled,
            machine: data.machine,
            reportedProblem: data.reportedProblem,
            takenBy: data.takenBy,
            notes: data.notes,
            status: data.status,
            updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
        } as ServiceCall;
        });

    return calls;
  } catch (error) {
    console.error("Error fetching overdue calls:", error);
    return [];
  }
};

const OverdueCallsPage = () => {
  const [overDueCalls, setOverDueCalls] = useState<ServiceCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverdueCalls = async () => {
      const calls = await fetchOverdueCalls();
      setOverDueCalls(calls);
      setLoading(false);
    };

    loadOverdueCalls();
  }, []);

  if (loading) {
    return <p className="pt-20">Loading overdue calls...</p>;
  }

  return (
    <div className="p-8 pt-20">
      <h1 className="text-2xl font-semibold mb-4">Overdue Calls</h1>
      {overDueCalls.length === 0 ? (
        <p>No overdue calls found.</p>
      ) : (
        <div className="p-4 md:p-8">
          <div className="hidden md:block mx-auto max-w-6xl">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                    Updated At
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                    Location
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                    Who Called
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                    Machine
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                    Reported Problem
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                    Taken By
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                    Notes
                  </th>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {overDueCalls.map((serviceCall) => (
                  <tr
                    key={serviceCall.id}
                    className="hover:bg-gray-50 border-t border-gray-200"
                  >
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {serviceCall.date
                        ? serviceCall.date.toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {serviceCall.updatedAt
                        ? serviceCall.updatedAt.toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {serviceCall.location || "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {serviceCall.whoCalled || "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {serviceCall.machine || "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {serviceCall.reportedProblem || "N/A"}
                    </td>
                    <td
                      className="py-2 px-4 text-sm text-gray-700 break-words"
                      style={{ width: "125px" }}
                    >
                      {serviceCall.id && (
                        <Status
                          id={serviceCall.id}
                          currentStatus={serviceCall.status}
                        />
                      )}
                    </td>
                    <td
                      className="py-2 px-4 text-sm text-gray-700 "
                      style={{ width: "125px" }}
                    >
                      <TakenBy
                        id={serviceCall.id!}
                        currentTakenBy={serviceCall.takenBy}
                      />
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700 break-words">
                      {serviceCall.notes || "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      <Link href={`/dashboard/${serviceCall.id}/edit`} passHref>
                        <button className="text-blue-500 hover:underline">
                          Edit
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverdueCallsPage;
