import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Status } from "@prisma/client";
import { revalidatePath } from "next/cache";

export default async function ServiceEditPage({
  params,
}: {
  params: { id: string };
}) {
  const key = params.id;


  const call = await prisma.serviceCall.findUnique({
    where: { id: key },
  });


  if (!call) {
    notFound();
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
    revalidatePath("/dashboard");
    redirect(`/dashboard`);
  }

  return (
    <div className="pt-20 max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Edit Service Call
      </h1>
      <form action={editCall} className="space-y-4 bg-white p-6 shadow rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location" className="block text-sm font-medium text-gray-700">
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
            <Label htmlFor="whoCalled" className="block text-sm font-medium text-gray-700">
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="machine" className="block text-sm font-medium text-gray-700">
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
            <Label htmlFor="reportedProblem" className="block text-sm font-medium text-gray-700">
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="takenBy" className="block text-sm font-medium text-gray-700">
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
            <Label htmlFor="status" className="block text-sm font-medium text-gray-700">
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
        </div>
        <div>
          <Label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes:
          </Label>
          <Textarea
            id="notes"
            name="notes"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue={call.notes ?? ""}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit
        </Button>
      </form>
    </div>
  );
}
