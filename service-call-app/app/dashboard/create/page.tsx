import { getLocations, getMachines } from "@/app/dashboard/action";
import CreateServiceCallPage from "./CreateServiceCallPage";

export const metadata = {
  title: "New Service Call",
};

export default async function Page() {
  const [locations, machines] = await Promise.all([
    getLocations(),
    getMachines(),
  ]);
  return (
    <CreateServiceCallPage
      locations={locations as string[]}
      machines={machines as string[]}
    />
  );
}
