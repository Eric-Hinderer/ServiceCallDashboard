
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RealTimeOpenInProgress from "./(Real Time Data)/RealTimeOpen";




export default async function Home() {
  return (
    <main className="pt-20 px-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold leading-tight">
          Welcome to the Service Call Dashboard
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Here you can track and manage ongoing service calls. Check below for
          service calls that are currently in progress or open.
        </p>
      </section>

      {/* Service Calls Table */}
      <RealTimeOpenInProgress  />

    </main>
  );

}


