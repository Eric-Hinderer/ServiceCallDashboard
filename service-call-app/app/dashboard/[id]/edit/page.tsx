import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { doc, getDoc, Timestamp, updateDoc } from "@firebase/firestore";
import db from "@/lib/firebase";
import { redirect } from "next/navigation";
import { getData } from "./action";

export default async function ServiceEditPage({
  params,
}: {
  params: { id: string };
}) {
  const key = params.id;
  const data = await getData(key);

  async function editServiceCall(formData: FormData) {
    "use server";
    const docRef = doc(db, "ServiceCalls", key);
    const dateString = formData.get("date") as string;
    const tempDate = dateString ? new Date(dateString) : new Date();
    const date = Timestamp.fromDate(tempDate);

    await updateDoc(docRef, {
      date: date,
      location: formData.get("location"),
      whoCalled: formData.get("whoCalled"),
      machine: formData.get("machine"),
      reportedProblem: formData.get("reportedProblem"),
      takenBy: formData.get("takenBy"),
      status: formData.get("status"),
      notes: formData.get("notes"),
      updatedAt: Timestamp.now(),
    });

    redirect("/dashboard");
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Edit Service Call
      </h1>
      <form
        action={editServiceCall}
        className="space-y-4 bg-white p-6 shadow rounded-lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date:
            </Label>
            <Input
              id="date"
              type="datetime-local"
              name="date"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

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
              defaultValue={data?.location ?? ""}
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
              defaultValue={data?.whoCalled ?? ""}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              defaultValue={data?.machine ?? ""}
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
              defaultValue={data?.reportedProblem ?? ""}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              defaultValue={data?.takenBy ?? ""}
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
              defaultValue={data?.status ?? ""}
            >
              <option value={"OPEN"}>Open</option>
              <option value={"IN_PROGRESS"}>In Progress</option>
              <option value={"DONE"}>Done</option>
            </select>
          </div>
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
            defaultValue={data?.notes ?? ""}
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
