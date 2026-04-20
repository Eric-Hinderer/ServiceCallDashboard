// app/dashboard/page.tsx

import { DataTable } from "../testing/data-table";
import { columns } from "../testing/columns";
import ServiceCallModalButton from "@/components/ServiceCallModalButton";
import { getLocations, getMachines, getServiceCalls } from "./action";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [locations, machines, totalServiceCalls] = await Promise.all([
    getLocations(),
    getMachines(),
    getServiceCalls(),
  ]);

  const resolvedToday = totalServiceCalls.filter(
    (serviceCall) =>
      serviceCall.status === "DONE" &&
      serviceCall.updatedAt &&
      serviceCall.updatedAt.toDateString() === new Date().toDateString()
  ).length;

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const resolvedYesterday = totalServiceCalls.filter(
    (serviceCall) =>
      serviceCall.status === "DONE" &&
      serviceCall.updatedAt &&
      serviceCall.updatedAt.toDateString() === yesterday.toDateString()
  ).length;

  let trend = null;
  if (resolvedToday > resolvedYesterday) {
    trend = { icon: "▲", color: "text-green-600", label: "Up" };
  } else if (resolvedToday < resolvedYesterday) {
    trend = { icon: "▼", color: "text-red-600", label: "Down" };
  } else {
    trend = { icon: "▬", color: "text-gray-400", label: "No Change" };
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-100"
      style={{ paddingBottom: "var(--bottom-nav-h)" }}
    >
      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-md py-4 px-4 sm:px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard Overview</h1>
          <ServiceCallModalButton locations={locations} machines={machines} />
        </header>

        {/* Main Dashboard Cards */}
        <div className="px-4 sm:px-6 py-4 sm:py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h2 className="text-lg font-medium">
              Service Calls Resolved Today
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-2xl">{resolvedToday}</p>
              <span
                className={`ml-2 ${trend.color} text-lg flex items-center`}
                title={`Compared to yesterday: ${trend.label}`}
                aria-label={`Trend: ${trend.label}`}
              >
                {trend.icon}
              </span>
            </div>
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
        <section className="px-4 sm:px-6 pb-4 sm:pb-8">
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-4">Service Call Overview</h2>
            <DataTable columns={columns} />
          </div>
        </section>
      </main>
    </div>
  );
}
