// app/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DataTable } from "../testing/data-table";
import { columns } from "../testing/columns";
import ServiceCallModalButton from "@/components/ServiceCallModalButton";
import { getLocations, getMachines } from "./action";

// Server Component for data fetching
export default async function DashboardPage() {
  const locations = await getLocations();
  const machines = await getMachines();

  return (
    <div className="container mx-auto py-10">
      <ServiceCallModalButton locations={locations} machines={machines} />
      <DataTable columns={columns} />
    </div>
  );
}
