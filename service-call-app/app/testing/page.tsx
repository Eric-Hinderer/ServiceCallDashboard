import {
  SubmitFormButton,
  SubmitFormButtonEmail,
} from "@/components/SubmitFormButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import db from "@/lib/firebase";
import { Status } from "@prisma/client";
import { collection, addDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


async function testForm(formData: FormData) {
  "use server";

  const dateString = formData.get("date") as string;
  const date = dateString ? new Date(dateString) : new Date();
  const location = (formData.get("location") as string) || undefined;
  const whoCalled = (formData.get("whoCalled") as string) || undefined;
  const machine = (formData.get("machine") as string) || undefined;
  const reportedProblem =
    (formData.get("reportedProblem") as string) || undefined;
  const takenBy = (formData.get("takenBy") as string) || undefined;
  const notes = (formData.get("notes") as string) || undefined;
  const status = (formData.get("status") as Status) || Status.OPEN;

  try {
    const docRef = await addDoc(collection(db, "serviceCalls"), {
        date,
        location,
        whoCalled,
        machine,
        reportedProblem,
        takenBy,
        notes,
        status,
    });
    console.log("Document written with ID: ", docRef.id);
    revalidatePath("/testing/dashboard");
   
  } catch (e) {
    console.error("Error adding document: ", e);
  }
  redirect("/testing/dashboard");
}

export default function Page() {
  return (
    <div className="pt-20 max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Create Service Call
      </h1>
      <form
        action={testForm}
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
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            />
          </div>
          <div>
            <Label
              htmlFor="takenBy"
              className="block text-sm font-medium text-gray-700"
            >
              Taken By:
            </Label>
            <select
              id="takenBy"
              name="takenBy"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              defaultValue="Select..."
            >
              <option value="Kurt">Kurt</option>
              <option value="Chris">Chris</option>
              <option value="Mike">Mike</option>
              <option value="Dean">Dean</option>
              <option value="Damon">Damon</option>
              <option value="John">John</option>
              <option value="Select...">Select...</option>
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
            defaultValue={Status.OPEN}
          >
            <option value={Status.OPEN}>Open</option>
            <option value={Status.IN_PROGRESS}>In Progress</option>
            <option value={Status.DONE}>Done</option>
          </select>
        </div>

        <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" type="submit">
            Create Service Call No Email
        </button>
      </form>
    </div>
  );
}
