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
        <Button className="m-4" onClick={openModal}>
          Create a New Service Call
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-6 sm:max-w-xl w-full">
        <DialogHeader>
          <DialogTitle>Create Service Call</DialogTitle>
          <DialogDescription>
            Fill out the details to create a new service call.
          </DialogDescription>
        </DialogHeader>
          <CreateServiceCall locations={locations} machines={machines} closeModal={closeModal}/>
        </DialogContent>
      </Dialog>
    </div>
  );
}
