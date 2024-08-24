// app/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { DataTable } from "../testing/data-table";
import { columns } from "../testing/columns";
import { ServiceCall } from "@prisma/client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

function timeout(ms: number) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Request timed out"));
    }, ms);
  });
}


async function getData(): Promise<ServiceCall[]> {
  const dbQuery = prisma.serviceCall.findMany();

  try {
    const res = await Promise.race([
      dbQuery,
      timeout(9000) // 10 seconds timeout
    ]);

    revalidatePath("/dashboard");

    return res as ServiceCall[];
  } catch (error) {
    throw new Error("Failed to retrieve service calls within 10 seconds.");
  }
}
// Server Component for data fetching
export default withPageAuthRequired( async function DashboardPage() {
  let data: ServiceCall[] = [];
  try {
     data = await getData();
    
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div className="pt-20">Error fetching data</div>;
  }


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
});
