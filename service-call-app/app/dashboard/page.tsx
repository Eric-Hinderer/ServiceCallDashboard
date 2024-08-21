// app/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Status from "./[id]/Status";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

// Server Component for data fetching
export default async function DashboardPage() {
  const data = await prisma.serviceCall.findMany();

  return (
    <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">
          Welcome to the Service Call Dashboard
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Here you can track and manage ongoing service calls. Check below for
          service calls that are currently in progress or open.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/create">Create a New Service Call</Link>
        </Button>
      </section>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">Service Calls</h2>
      </div>

      {/* Card Layout for Mobile */}
      <div className="space-y-4 md:hidden">
        {" "}
        {/* Hidden on medium and up */}
        {data.reverse().map((serviceCall) => (
          <Card key={serviceCall.id}>
            <CardHeader>
              <CardTitle>
                {serviceCall.location || "Unknown Location"}
              </CardTitle>
              <div>{serviceCall.date?.toLocaleString() || "N/A"}</div>
            </CardHeader>
            <CardContent>
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
                <strong>Taken By:</strong> {serviceCall.takenBy || "N/A"}
              </div>
              <div>
                <strong>Notes:</strong>{" "}
                <div className="py-2 px-4 text-sm text-gray-700 max-w-xs break-words">
                  {serviceCall.notes || "N/A"}
                </div>
              </div>
              <div>
                <strong>Status:</strong>
                <Status
                  id={serviceCall.id}
                  currentStatus={serviceCall.status}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/dashboard/${serviceCall.id}/edit`} passHref>
                <button className="text-blue-500 hover:underline">Edit</button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Table Layout for Desktop */}
      <div className="hidden md:block">
        {" "}
        {/* Hidden on mobile */}
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 max-w-xs">
                Date
              </th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 max-w-xs">
                Updated At
              </th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 max-w-xs">
                Location
              </th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 max-w-xs">
                Who Called
              </th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 max-w-xs">
                Machine
              </th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 max-w-xs">
                Reported Problem
              </th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 max-w-xs">
                Status
              </th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 max-w-xs">
                Taken By
              </th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 max-w-xs">
                Notes
              </th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 max-w-xs">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((serviceCall) => (
                <tr
                  key={serviceCall.id}
                  className="hover:bg-gray-50 border-t border-gray-200"
                >
                  <td className="py-2 px-4 text-sm text-gray-700 max-w-xs">
                    {serviceCall.date?.toLocaleString() || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700 max-w-xs">
                    {serviceCall.updatedAt?.toLocaleString() || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700 max-w-xs">
                    {serviceCall.location || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700 max-w-xs">
                    {serviceCall.whoCalled || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700 max-w-xs">
                    {serviceCall.machine || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700 max-w-xs">
                    {serviceCall.reportedProblem || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700 max-w-xs">
                    <Status
                      id={serviceCall.id}
                      currentStatus={serviceCall.status}
                    />
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700 max-w-xs">
                    {serviceCall.takenBy || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700 max-w-xs break-words">
                    {serviceCall.notes || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700 max-w-xs">
                    <Link href={`/dashboard/${serviceCall.id}/edit`} passHref>
                      <button className="text-blue-500 hover:underline">
                        Edit
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-2 px-4 text-sm text-gray-700 text-center">
                  No service calls found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
