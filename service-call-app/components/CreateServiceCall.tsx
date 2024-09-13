import { SubmitFormButton, SubmitFormButtonEmail } from "./SubmitFormButton";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function CreateServiceCall() {
  return (
    <div className="space-y-4 bg-white p-6 shadow rounded-lg">
      <form className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date" className="block text-sm font-medium text-gray-700">
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
            <Label htmlFor="location" className="block text-sm font-medium text-gray-700">
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
            <Label htmlFor="whoCalled" className="block text-sm font-medium text-gray-700">
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
            <Label htmlFor="machine" className="block text-sm font-medium text-gray-700">
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
            <Label htmlFor="reportedProblem" className="block text-sm font-medium text-gray-700">
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
            <Label htmlFor="takenBy" className="block text-sm font-medium text-gray-700">
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
          <Label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes:
          </Label>
          <Textarea
            id="notes"
            name="notes"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <SubmitFormButtonEmail />
        <SubmitFormButton />
      </form>
    </div>
  );
}
