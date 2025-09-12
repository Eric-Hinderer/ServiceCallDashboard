// Example: Service Call Management Component using custom hooks
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAllServiceCallsRealTime, useServiceCallFilters, useServiceCallMutations } from "@/hooks";
import { ServiceCallStatus, PREDEFINED_NAMES } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

export default function ServiceCallManagerRefactored() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use custom hooks for data and operations
  const { serviceCalls, loading, error } = useAllServiceCallsRealTime();
  const { updateStatus, updateTakenBy, deleteServiceCall, isPending } = useServiceCallMutations();
  
  // Filter service calls based on search term
  const filteredCalls = serviceCalls.filter(call =>
    call.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.whoCalled.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.reportedProblem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (id: string, newStatus: ServiceCallStatus) => {
    const success = await updateStatus(id, newStatus);
    if (success) {
      toast.success("Status updated successfully");
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleTakenByChange = async (id: string, newTakenBy: string) => {
    const success = await updateTakenBy(id, newTakenBy);
    if (success) {
      toast.success("Assigned successfully");
    } else {
      toast.error("Failed to update assignment");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service call?")) {
      const success = await deleteServiceCall(id);
      if (success) {
        toast.success("Service call deleted successfully");
      } else {
        toast.error("Failed to delete service call");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading service calls...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Service Call Management</h1>
        <div className="text-sm text-gray-500">
          Total: {serviceCalls.length} | Filtered: {filteredCalls.length}
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Search service calls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Service Calls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCalls.map((serviceCall) => (
          <Card key={serviceCall.id} className="relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex justify-between items-start">
                <span>{serviceCall.location}</span>
                <div className="flex gap-1">
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    serviceCall.status === ServiceCallStatus.OPEN 
                      ? 'bg-blue-100 text-blue-800'
                      : serviceCall.status === ServiceCallStatus.IN_PROGRESS
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {serviceCall.status}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Called by:</span>
                  <div>{serviceCall.whoCalled}</div>
                </div>
                <div>
                  <span className="font-medium">Machine:</span>
                  <div>{serviceCall.machine}</div>
                </div>
              </div>

              <div className="text-sm">
                <span className="font-medium">Problem:</span>
                <div className="text-gray-600 mt-1">{serviceCall.reportedProblem}</div>
              </div>

              <div className="text-sm">
                <span className="font-medium">Age:</span>
                <div>{formatDistanceToNow(new Date(serviceCall.date), { addSuffix: true })}</div>
              </div>

              {/* Status Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status:</label>
                <Select
                  value={serviceCall.status}
                  onValueChange={(value) => handleStatusChange(serviceCall.id, value as ServiceCallStatus)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ServiceCallStatus.OPEN}>Open</SelectItem>
                    <SelectItem value={ServiceCallStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={ServiceCallStatus.DONE}>Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Taken By Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned to:</label>
                <Select
                  value={serviceCall.takenBy}
                  onValueChange={(value) => handleTakenByChange(serviceCall.id, value)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_NAMES.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`/dashboard/${serviceCall.id}/edit`, '_blank')}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(serviceCall.id)}
                  disabled={isPending}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCalls.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "No service calls match your search." : "No service calls found."}
        </div>
      )}
    </div>
  );
}
