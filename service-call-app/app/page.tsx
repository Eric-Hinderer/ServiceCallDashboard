
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RealTimeOpenInProgress from "./(Real Time Data)/RealTimeOpen";




export default async function Home() {
  return (
    <main className="pt-20 px-8 max-w-7xl mx-auto space-y-16">
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

      {/* Explanation Section */}
      <section className="space-y-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold">How the Dashboard Works</h2>
        <p className="text-gray-600 leading-relaxed">
          The service call dashboard allows you to create and manage service
          calls. In the table above, you can view all service calls that are
          currently in an "Open" or "In Progress" status. You can also click the
          button above to create new service calls.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Each service call includes details like the location, machine, and
          reported problem. You can track the status of each service call as it
          progresses from Open to In Progress and eventually to Done.
        </p>
      </section>
    </main>
  );

}


