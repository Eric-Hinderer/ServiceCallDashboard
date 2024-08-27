// app/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DataTable } from "../testing/data-table";
import { columns } from "../testing/columns";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";


// Server Component for data fetching
export default withPageAuthRequired(async function DashboardPage() {


  return (
    <div className=" px-4 md:px-8">
      <div className="flex justify-between items-center mb-4"></div>

      <div className="container mx-auto py-10 pt-20">
        <Button asChild className="mt-4">
          <Link href="/dashboard/create">Create a New Service Call</Link>
        </Button>
        <DataTable columns={columns} />
      </div>
    </div>
  );
});
