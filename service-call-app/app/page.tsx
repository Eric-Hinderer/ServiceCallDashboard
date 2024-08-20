import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Status from "./dashboard/[id]/Status";

// Server Component for data fetching
export default async function Home() {
  // Fetch Open and In Progress service calls
  const serviceCalls = await prisma.serviceCall.findMany({
    where: {
      status: {
        in: ["OPEN", "IN_PROGRESS"],
      },
    },
  });

  return (
    <main className="pt-20 px-8 max-w-7xl mx-auto space-y-16">
      {/* Welcome Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          Welcome to the Service Call Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Here you can track and manage ongoing service calls. Check below for
          service calls that are currently in progress or open.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/create">Create a New Service Call</Link>
        </Button>
      </section>

      {/* Table Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Open and In Progress Service Calls
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                  Date
                </th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                  Location
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
              {serviceCalls.length > 0 ? (
                serviceCalls.map((serviceCall) => (
                  <tr
                    key={serviceCall.id}
                    className="hover:bg-gray-50 border-t border-gray-200"
                  >
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {serviceCall.date?.toLocaleString() || "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {serviceCall.location || "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {serviceCall.machine || "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {serviceCall.reportedProblem || "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      <Status
                        id={serviceCall.id}
                        currentStatus={serviceCall.status}
                      />
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {serviceCall.takenBy || "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {serviceCall.notes || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-600">
                    No service calls found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Explanation Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How the Dashboard Works</h2>
        <p className="text-gray-600">
          The service call dashboard allows you to create and manage service
          calls. In the table above, you can view all service calls that are
          currently in an "Open" or "In Progress" status. You can also click the
          button above to create new service calls.
        </p>
        <p className="text-gray-600">
          Each service call includes details like the location, machine, and
          reported problem. You can track the status of each service call as it
          progresses from Open to In Progress and eventually to Done.
        </p>
      </section>
    </main>
  );
}
