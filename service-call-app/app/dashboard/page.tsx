// app/dashboard/page.tsx

import { DataTable } from "../testing/data-table";
import { columns } from "../testing/columns";
import ServiceCallModalButton from "@/components/ServiceCallModalButton";
import { getLocations, getMachines } from "./action";

// Server Component for data fetching
export default async function DashboardPage() {
  const locations = await getLocations();
  const machines = await getMachines();

  return (
    <div className="container mx-auto">
      <ServiceCallModalButton locations={locations} machines={machines} />
      <DataTable columns={columns} />
    </div>
  );
}
