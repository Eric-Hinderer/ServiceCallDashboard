// app/dashboard/page.tsx
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Status from "./[id]/Status";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import TakenBy from "./[id]/TakenBy";
import RealTimeData from "../(Real Time Data)/RealTimeData";

// Server Component for data fetching
export default async function DashboardPage() {
  const data = await prisma.serviceCall.findMany();

  return (
    <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">
          Welcome to the Service Call Dashboard
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Here you can track and manage ongoing service calls. Check below for
          service calls that are currently in progress or open.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/create">Create a New Service Call</Link>
        </Button>
      </section>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">Service Calls</h2>
      </div>

      {/* Service Calls Table */}
      <RealTimeData />
    </div>
  );
}
