"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Status from "../dashboard/[id]/Status";
import TakenBy from "../dashboard/[id]/TakenBy";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { ServiceCall } from "../(definitions)/definitions";
import db from "@/lib/firebase";
import { User } from "firebase/auth";
import { onAuthStateChanged, signInWithGoogle } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const RealTimeOpenInProgress = () => {
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user: User) => {
      setCurrentUser(user);
    });

    return () => unsubscribe(); // Clean up the subscription on component unmount
  }, []);

  useEffect(() => {
    const q = query(collection(db, "ServiceCalls"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
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
      },
      (error) => {
        console.error("Error fetching Firestore data: ", error);
      }
    );

    return () => unsubscribe();
  }, []);
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center mt-12 space-y-6">
        <p className="text-xl text-gray-700 text-center">
          Please sign in to start managing your service calls.
        </p>
        <Button
          onClick={signInWithGoogle}
          className="bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-3 px-8 rounded-md shadow-lg transition-transform transform hover:scale-105"
        >
          Sign In with Google
        </Button>
      </div>
    );
  }

  const filteredServiceCalls = serviceCalls.filter(
    (serviceCall) =>
      serviceCall.status === "OPEN" || serviceCall.status === "IN_PROGRESS"
  );

  return (
    <div className="p-4 md:p-8">
      <Button asChild className="mt-4">
        <Link href="/dashboard/create">Create a New Service Call</Link>
      </Button>
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
                  {serviceCall.date ? serviceCall.date.toLocaleString() : "N/A"}
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
                {serviceCall.date ? serviceCall.date.toLocaleString() : "N/A"}
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
