import { prisma } from "@/lib/prisma"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { ServiceCall } from "@prisma/client";
import { revalidatePath } from "next/cache";


async function getData(): Promise<ServiceCall[]> {
  // Fetch data from your API here.
  const res = await prisma.serviceCall.findMany();
  revalidatePath("/testing");
  return res;
}


export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10 pt-20">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
