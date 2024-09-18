// app/dashboard/page.tsx

import { DataTable } from "../testing/data-table";
import { columns } from "../testing/columns";
import ServiceCallModalButton from "@/components/ServiceCallModalButton";
import { getLocations, getMachines, getServiceCalls } from "./action";

export default async function DashboardPage() {
  const locations = await getLocations();
  const machines = await getMachines();
  const totalServiceCalls = await getServiceCalls();

  const resolvedToday = totalServiceCalls.filter(
    (serviceCall) =>
      serviceCall.status === "DONE" &&
      serviceCall.updatedAt &&
      serviceCall.updatedAt.toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="flex h-screen bg-gray-100">
     

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard Overview</h1>
          <ServiceCallModalButton locations={locations} machines={machines} />
        </header>

        {/* Main Dashboard Cards */}
        <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h2 className="text-lg font-medium">Service Calls Resolved Today</h2>
            <p className="mt-2 text-2xl">{resolvedToday}</p>
          </div>
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h2 className="text-lg font-medium">Total Locations</h2>
            <p className="mt-2 text-2xl">{locations.length}</p>
          </div>
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h2 className="text-lg font-medium">Service Calls</h2>
            <p className="mt-2 text-2xl">{totalServiceCalls.length}</p>
          </div>
        </div>

        {/* Data Table */}
        <section className="px-6 pb-8">
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-4">Machines Overview</h2>
            <DataTable columns={columns} />
          </div>
        </section>
      </main>
    </div>
  );
}
