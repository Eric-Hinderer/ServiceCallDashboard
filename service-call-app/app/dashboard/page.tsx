// app/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { DataTable } from "../testing/data-table";
import { columns } from "../testing/columns";
import { ServiceCall } from "@prisma/client";


async function getData(): Promise<ServiceCall[]> {
  // Fetch data from your API here.
  const res = await prisma.serviceCall.findMany();

  revalidatePath("/dashboard");

  return res;
}
// Server Component for data fetching
export default async function DashboardPage() {
  const data = await getData();


  return (
    <div className=" px-4 md:px-8">
      <div className="flex justify-between items-center mb-4"></div>

      <div className="container mx-auto py-10 pt-20">
        <Button asChild className="mt-4">
          <Link href="/dashboard/create">Create a New Service Call</Link>
        </Button>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
