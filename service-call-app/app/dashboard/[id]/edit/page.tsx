import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default async function ServiceEditPage({
  params,
}: {
  params: { id: string };
}) {
  const key = params.id;

  // Fetch the service call based on the key
  const call = await prisma.serviceCall.findUnique({
    where: { id: key },
  });

  // If no service call is found, display a 404 or a message
  if (!call) {
    notFound();
  }

  enum Status {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE",
  }

  // Function to handle form submission
  async function editCall(formData: FormData) {
    "use server";
    await prisma.serviceCall.update({
      where: { id: key },
      data: {
        location: formData.get("location") as string,
        whoCalled: formData.get("whoCalled") as string,
        machine: formData.get("machine") as string,
        reportedProblem: formData.get("reportedProblem") as string,
        takenBy: formData.get("takenBy") as string,
        notes: formData.get("notes") as string,
        status: formData.get("status") as Status,
      },
    });
    redirect(`/dashboard`);
  }

  return (
    <div className="pt-20 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Service Call</h1>
      <form action={editCall} className="space-y-6">
        <div>
          <Label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location:
          </Label>
          <Input
            id="location"
            type="text"
            name="location"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue={call.location ?? ""}
          />
        </div>
        <div>
          <Label
            htmlFor="whoCalled"
            className="block text-sm font-medium text-gray-700"
          >
            Who Called:
          </Label>
          <Input
            id="whoCalled"
            type="text"
            name="whoCalled"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue={call.whoCalled ?? ""}
          />
        </div>
        <div>
          <Label
            htmlFor="machine"
            className="block text-sm font-medium text-gray-700"
          >
            Machine:
          </Label>
          <Input
            id="machine"
            type="text"
            name="machine"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue={call.machine ?? ""}
          />
        </div>
        <div>
          <Label
            htmlFor="reportedProblem"
            className="block text-sm font-medium text-gray-700"
          >
            Reported Problem:
          </Label>
          <Input
            id="reportedProblem"
            type="text"
            name="reportedProblem"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue={call.reportedProblem ?? ""}
          />
        </div>
        <div>
          <Label
            htmlFor="takenBy"
            className="block text-sm font-medium text-gray-700"
          >
            Taken By:
          </Label>
          <Input
            id="takenBy"
            type="text"
            name="takenBy"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue={call.takenBy ?? ""}
          />
        </div>
        <div>
          <Label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Notes:
          </Label>
          <Textarea
            id="notes"
            name="notes"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue={call.notes ?? ""}
          />
        </div>
        <div>
          <Label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Status:
          </Label>
          <select
            id="status"
            name="status"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue={call.status}
          >
            <option value={"OPEN"}>Open</option>
            <option value={"IN_PROGRESS"}>In Progress</option>
            <option value={"DONE"}>Done</option>
          </select>
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit
        </Button>
      </form>
    </div>
  );
}
