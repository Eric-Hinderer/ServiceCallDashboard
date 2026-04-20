import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Calendar, MapPin, User, Wrench, AlertCircle, FileText, UserCheck } from "lucide-react";
import { doc, getDoc, Timestamp, updateDoc } from "@firebase/firestore";
import db from "@/lib/firebase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getData } from "./action";
import { getLocations, getMachines } from "@/app/dashboard/action";
import { Status } from "@/app/(definitions)/definitions";
import { EditFormSubmitButton } from "@/components/SubmitFormButton";
import ComboboxInput from "@/components/ComboboxInput";
import SmartBack from "@/components/SmartBack";

const ALLOWED_RETURN_PATHS = ["/dashboard", "/technician"] as const;
type ReturnPath = (typeof ALLOWED_RETURN_PATHS)[number];

function resolveReturnPath(raw: string | undefined): ReturnPath {
  if (raw === "technician" || raw === "/technician") return "/technician";
  return "/dashboard";
}

export default async function ServiceEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id: key } = await params;
  const { from } = await searchParams;
  const returnTo = resolveReturnPath(from);
  const [data, locations, machines] = await Promise.all([getData(key), getLocations(), getMachines()]);

  // Redirect if no data found
  if (!data) {
    redirect(returnTo);
  }

  async function editServiceCall(formData: FormData) {
    "use server";

    const submittedReturn = formData.get("returnTo")?.toString();
    const destination: ReturnPath = ALLOWED_RETURN_PATHS.includes(
      submittedReturn as ReturnPath
    )
      ? (submittedReturn as ReturnPath)
      : "/dashboard";

    try {
      const docRef = doc(db, "ServiceCalls", key);

      const updateData: any = {
        location: formData.get("location")?.toString()?.trim() || "",
        whoCalled: formData.get("whoCalled")?.toString()?.trim() || "",
        machine: formData.get("machine")?.toString()?.trim() || "",
        reportedProblem: formData.get("reportedProblem")?.toString()?.trim() || "",
        takenBy: formData.get("takenBy")?.toString()?.trim() || "",
        status: formData.get("status")?.toString() || Status.OPEN,
        notes: formData.get("notes")?.toString()?.trim() || "",
        updatedAt: Timestamp.now(),
      };

      // Validate required fields
      if (!updateData.location || !updateData.whoCalled || !updateData.machine) {
        throw new Error("Location, Who Called, and Machine are required fields");
      }

      await updateDoc(docRef, updateData);

      revalidatePath("/dashboard");
      revalidatePath("/technician");
      revalidatePath(`/dashboard/${key}`);

    } catch (error) {
      console.error("Error updating service call:", error);
      throw error;
    }

    redirect(destination);
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case Status.OPEN:
        return "text-red-600 bg-red-50 border-red-200";
      case Status.IN_PROGRESS:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case Status.DONE:
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <SmartBack fallback={returnTo}>
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </SmartBack>
        </div>

        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Edit Service Call
            </h1>
            <p className="text-gray-600">
              Service Call ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{key}</span>
            </p>
            {data.createdAt && (
              <p className="text-sm text-gray-500">
                Created: {formatDate(data.createdAt)} • Last Updated: {formatDate(data.updatedAt)}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(data.status)} font-medium text-sm`}>
              <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
              {data.status === Status.OPEN && "Open"}
              {data.status === Status.IN_PROGRESS && "In Progress"}
              {data.status === Status.DONE && "Completed"}
            </div>
          </div>

          {/* Main Form Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-blue-600" />
                Service Call Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={editServiceCall} className="space-y-8">
                <input type="hidden" name="returnTo" value={returnTo} />
                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        Location
                      </Label>
                      <ComboboxInput
                        options={locations}
                        defaultValue={data?.location ?? ""}
                        name="location"
                        placeholder="Enter or select location"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the physical location where service is needed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whoCalled" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        Who Called
                      </Label>
                      <Input
                        id="whoCalled"
                        name="whoCalled"
                        placeholder="Enter caller name"
                        defaultValue={data?.whoCalled ?? ""}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        aria-describedby="whoCalled-description"
                      />
                      <p id="whoCalled-description" className="text-xs text-gray-500 mt-1">
                        Name of the person who reported the issue
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-indigo-600" />
                    Technical Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="machine" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-gray-500" />
                        Machine/Equipment
                      </Label>
                      <ComboboxInput
                        options={machines}
                        defaultValue={data?.machine ?? ""}
                        name="machine"
                        placeholder="Enter or select machine"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Equipment or machine that needs service
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reportedProblem" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                        Reported Problem
                      </Label>
                      <Input
                        id="reportedProblem"
                        name="reportedProblem"
                        placeholder="Brief description of the problem"
                        defaultValue={data?.reportedProblem ?? ""}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Assignment & Status Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-indigo-600" />
                    Assignment & Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="takenBy" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-gray-500" />
                        Assigned To
                      </Label>
                      <Input
                        id="takenBy"
                        name="takenBy"
                        placeholder="Enter technician name"
                        defaultValue={data?.takenBy ?? ""}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                        Status
                      </Label>
                      <Select name="status" defaultValue={data?.status ?? Status.OPEN}>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Status.OPEN} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              Open
                            </div>
                          </SelectItem>
                          <SelectItem value={Status.IN_PROGRESS} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              In Progress
                            </div>
                          </SelectItem>
                          <SelectItem value={Status.DONE} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Completed
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Additional Notes
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                      Notes & Comments
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Add any additional notes, comments, or details about the service call..."
                      defaultValue={data?.notes ?? ""}
                      rows={4}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <EditFormSubmitButton cancelFallback={returnTo} />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
