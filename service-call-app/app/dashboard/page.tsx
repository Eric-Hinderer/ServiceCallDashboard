// app/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DataTable } from "../testing/data-table";
import { columns } from "../testing/columns";
import ServiceCallModalButton from "@/components/ServiceCallModalButton";



// Server Component for data fetching
export default async function DashboardPage() {


  return (
    <div className=" px-4 md:px-8">
      <div className="flex justify-between items-center mb-4"></div>

      <div className="container mx-auto py-10 pt-20">
       <ServiceCallModalButton />
        <DataTable columns={columns} />
      </div>
    </div>
  );
}
