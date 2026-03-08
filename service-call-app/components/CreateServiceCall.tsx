"use client";
import { useState } from "react";
import { SubmitFormButton, SubmitFormButtonEmail } from "./SubmitFormButton";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, MapPin, User, Wrench, AlertCircle, FileText, UserCheck, Clock } from "lucide-react";
import { Status } from "@/app/(definitions)/definitions";
import LocationCombobox from "./LocationCombobox";


export default function CreateServiceCall({
  locations,
  machines,
  closeModalAction,
}: {
  locations: string[];
  machines: string[];
  closeModalAction: () => void;
}) {
  const [selectedTechnician, setSelectedTechnician] = useState("Select...");
  const [selectedStatus, setSelectedStatus] = useState<string>(Status.OPEN);

  const technicians = ["Kurt", "Chris", "Mike", "Dean", "Damon", "John", "Aaron"];

  // Set current datetime as default
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          <form className="space-y-8">
            {/* Date and Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Service Call Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    Date & Time
                  </Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    name="date"
                    defaultValue={getCurrentDateTime()}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">When the service call was reported</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    Location
                  </Label>
                  <LocationCombobox
                    locations={locations}
                    name="location"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Physical location where service is needed</p>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="whoCalled" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    Who Called
                  </Label>
                  <Input
                    id="whoCalled"
                    type="text"
                    name="whoCalled"
                    placeholder="Enter caller name"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Name of the person reporting the issue</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="machine" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-gray-500" />
                    Machine/Equipment
                  </Label>
                  <Input
                    id="machine"
                    list="machines"
                    type="text"
                    name="machine"
                    placeholder="Enter or select machine"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <datalist id="machines">
                    {machines.map((machine, index) => (
                      <option key={index} value={machine} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">Equipment that needs service</p>
                </div>
              </div>
            </div>

            {/* Problem Description Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Problem Details
              </h3>
              <div className="space-y-2">
                <Label htmlFor="reportedProblem" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-500" />
                  Reported Problem
                </Label>
                <Input
                  id="reportedProblem"
                  type="text"
                  name="reportedProblem"
                  placeholder="Brief description of the problem"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Describe the issue that needs attention</p>
              </div>
            </div>

            {/* Assignment Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                Assignment & Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="takenBy" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-gray-500" />
                    Assign To
                  </Label>
                  <Select 
                    name="takenBy" 
                    value={selectedTechnician}
                    onValueChange={setSelectedTechnician}
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Select...">Select technician...</SelectItem>
                      {technicians.map((tech) => (
                        <SelectItem key={tech} value={tech}>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-gray-500" />
                            {tech}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Choose the technician for this service call</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Initial Status
                  </Label>
                  <Select 
                    name="status" 
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Status.OPEN}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          Open
                        </div>
                      </SelectItem>
                      <SelectItem value={Status.IN_PROGRESS}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          In Progress
                        </div>
                      </SelectItem>
                      <SelectItem value={Status.DONE}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Completed
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Current status of the service call</p>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Additional Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes & Comments
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add any additional notes, special instructions, or details..."
                  rows={4}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Optional additional information or special instructions</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <SubmitFormButtonEmail closeModalAction={closeModalAction} />
              <SubmitFormButton closeModalAction={closeModalAction} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
