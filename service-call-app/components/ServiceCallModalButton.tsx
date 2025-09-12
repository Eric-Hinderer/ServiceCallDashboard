'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Phone, Wrench } from "lucide-react";
import CreateServiceCall from "./CreateServiceCall";

export default function ServiceCallModalButton({
  locations,
  machines,
}: {
  locations: string[];
  machines: string[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center gap-2 m-4" 
          onClick={openModal}
        >
          <Plus className="h-5 w-5" />
          Create New Service Call
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-4xl w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-0 shadow-2xl">
        <div className="p-6">
          <DialogHeader className="space-y-3 mb-6">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              Create New Service Call
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Fill out the details below to create a new service call. All required fields are marked and must be completed.
            </DialogDescription>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <Wrench className="h-4 w-4 text-blue-600" />
              <span>Tip: Use the dropdown lists for faster data entry when available</span>
            </div>
          </DialogHeader>
          <CreateServiceCall 
            locations={locations} 
            machines={machines} 
            closeModalAction={closeModal}
          />
        </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
