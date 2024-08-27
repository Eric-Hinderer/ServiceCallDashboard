"use client";
import { useState, useEffect } from "react";
import * as Realm from "realm-web";
import Link from "next/link";
import Status from "../dashboard/[id]/Status";
import TakenBy from "../dashboard/[id]/TakenBy";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { ServiceCall } from "../(definitions)/definitions";
import db from "@/lib/firebase";

const app = new Realm.App({ id: "application-0-hpdeqzt" });

const RealTimeOpenInProgress = () => {
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);

  useEffect(() => {
    // Set up Firestore onSnapshot listener for real-time updates
    const q = query(collection(db, "ServiceCalls"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedServiceCalls = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id, // Include the document ID
            ...doc.data(), // Spread the document's data
          } as ServiceCall)
      ); // Ensure the returned object is typed as ServiceCall

      setServiceCalls(updatedServiceCalls); // Update state with new data
    });

    // Cleanup listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Filter and sort data client-side to show only 'OPEN' and 'IN_PROGRESS'
  const filteredServiceCalls = serviceCalls.filter(
    (serviceCall) =>
      serviceCall.status === "OPEN" || serviceCall.status === "IN_PROGRESS"
  );

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-xl font-semibold mb-6 text-center">
        Current Service Calls (Open/In Progress)
      </h2>

      {/* Table Layout for Desktop */}
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
            {filteredServiceCalls.map((serviceCall) => (
              <tr
                key={serviceCall.id}
                className="hover:bg-gray-50 border-t border-gray-200"
              >
                <td className="py-2 px-4 text-sm text-gray-700">
                  {serviceCall.date
                    ? new Date(serviceCall.date.seconds * 1000).toLocaleString()
                    : "N/A"}
                </td>
                <td className="py-2 px-4 text-sm text-gray-700">
                  {serviceCall.updatedAt
                    ? new Date(
                        serviceCall.updatedAt.seconds * 1000
                      ).toLocaleString()
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

      {/* Card Layout for Mobile */}
      <div className="space-y-4 md:hidden mx-auto max-w-2xl">
        {filteredServiceCalls.map((serviceCall) => (
          <div
            key={serviceCall.id}
            className="border border-gray-200 rounded-lg shadow-md p-6 bg-white"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">
                {serviceCall.location || "Unknown Location"}
              </h3>
              <div className="text-sm text-gray-600">
                {serviceCall.date
                  ? new Date(serviceCall.date.seconds * 1000).toLocaleString()
                  : "N/A"}
              </div>
            </div>
            <div className="mt-2 space-y-2">
              <div>
                <strong>Who Called:</strong> {serviceCall.whoCalled || "N/A"}
              </div>
              <div>
                <strong>Machine:</strong> {serviceCall.machine || "N/A"}
              </div>
              <div>
                <strong>Reported Problem:</strong>{" "}
                {serviceCall.reportedProblem || "N/A"}
              </div>
              <div>
                <strong>Taken By:</strong>{" "}
                <TakenBy
                  id={serviceCall.id!}
                  currentTakenBy={serviceCall.takenBy}
                />
              </div>
              <div>
                <strong>Notes:</strong>
                <div className="text-sm text-gray-700 max-w-xs break-words">
                  {serviceCall.notes || "N/A"}
                </div>
              </div>
              <div>
                <strong>Status:</strong>
                <Status
                  id={serviceCall.id!}
                  currentStatus={serviceCall.status}
                />
              </div>
            </div>
            <div className="mt-4 text-right">
              <Link href={`/dashboard/${serviceCall.id}/edit`} passHref>
                <button className="text-blue-500 hover:underline">Edit</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeOpenInProgress;
