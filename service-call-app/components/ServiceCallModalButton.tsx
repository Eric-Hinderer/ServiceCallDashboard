import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import CreateServiceCall from "./CreateServiceCall";

export default function ServiceCallModalButton() {
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="m-4">Create a New Service Call</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Service Call</DialogTitle>
            <DialogDescription>Fill out the details to create a new service call.</DialogDescription>
          </DialogHeader>
          <CreateServiceCall /> 
        </DialogContent>
      </Dialog>
    </div>
  );
}
