import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Define your validation schema with zod
const formSchema = z.object({
  date: z.string().optional(),
  location: z.string().optional(),
  whoCalled: z.string().optional(),
  machine: z.string().optional(),
  reportedProblem: z.string().optional(),
  takenBy: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(), // Add status to the schema
});

interface ServiceCall {
  date?: Date;
  location?: string;
  whoCalled?: string;
  machine?: string;
  reportedProblem?: string;
  takenBy?: string;
  status: Status;
  notes?: string;
}

enum Status {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export default function CreateServiceCall() {
  async function createFromForm(formData: FormData) {
    "use server";
    const date = new Date();
    const location = formData.get("location") as string || undefined;
    const whoCalled = formData.get("whoCalled") as string || undefined;
    const machine = formData.get("machine") as string || undefined;
    const reportedProblem = formData.get("reportedProblem") as string || undefined;
    const takenBy = formData.get("takenBy") as string || undefined;
    const notes = formData.get("notes") as string || undefined;
    const status = formData.get("status") as Status || Status.OPEN; // Get the selected status or default to OPEN

    const newServiceCall: ServiceCall = {
      date,
      location,
      whoCalled,
      machine,
      reportedProblem,
      takenBy,
      status,
      notes,
    };

    await prisma.serviceCall.create({ data: newServiceCall });
    redirect("/dashboard");
  }

  return (
    <div className="pt-20 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Service Call</h1>
      <form action={createFromForm} className="space-y-6">
        <div>
          <Label htmlFor="location" className="block text-sm font-medium text-gray-700">Location:</Label>
          <Input id="location" type="text" name="location" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <Label htmlFor="whoCalled" className="block text-sm font-medium text-gray-700">Who Called:</Label>
          <Input id="whoCalled" type="text" name="whoCalled" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <Label htmlFor="machine" className="block text-sm font-medium text-gray-700">Machine:</Label>
          <Input id="machine" type="text" name="machine" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <Label htmlFor="reportedProblem" className="block text-sm font-medium text-gray-700">Reported Problem:</Label>
          <Input id="reportedProblem" type="text" name="reportedProblem" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <Label htmlFor="takenBy" className="block text-sm font-medium text-gray-700">Taken By:</Label>
          <Input id="takenBy" type="text" name="takenBy" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <Label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes:</Label>
          <Textarea id="notes" name="notes" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <Label htmlFor="status" className="block text-sm font-medium text-gray-700">Status:</Label>
          <select
            id="status"
            name="status"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue={Status.OPEN} // Set default value
          >
            <option value={Status.OPEN}>Open</option>
            <option value={Status.IN_PROGRESS}>In Progress</option>
            <option value={Status.DONE}>Done</option>
          </select>
        </div>
        <Button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Create Service Call</Button>
      </form>
    </div>
  );
}
