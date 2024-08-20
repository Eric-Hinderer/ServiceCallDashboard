// app/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Status from "./[id]/Status";

// Server Component for data fetching
export default async function DashboardPage() {
  const data = await prisma.serviceCall.findMany();

  return (
    <div className="pt-20 px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-8 text-gray-600">Welcome to the dashboard!</p>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Service Calls</h2>
        <Link href="/dashboard/create" passHref>
          <Button>
            Create Service Call
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
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
            </tr>
          </thead>
          <tbody>
            {data.map((serviceCall) => (
              <tr
                key={serviceCall.id}
                className="hover:bg-gray-50 border-t border-gray-200"
              >
                <td className="py-2 px-4 text-sm text-gray-700">
                  {serviceCall.date?.toLocaleString() || "N/A"}
                </td>
                <td className="py-2 px-4 text-sm text-gray-700">
                  {serviceCall.updatedAt?.toLocaleString() || "N/A"}
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
                <td className="py-2 px-4 text-sm text-gray-700">
                  <Status id={serviceCall.id} currentStatus={serviceCall.status} />
                </td>
                <td className="py-2 px-4 text-sm text-gray-700">
                  {serviceCall.takenBy || "N/A"}
                </td>
                <td className="py-2 px-4 text-sm text-gray-700">
                  {serviceCall.notes || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
