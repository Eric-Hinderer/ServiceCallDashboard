"use client";

import { useState, useTransition } from "react";
import {
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  Timestamp,
} from "firebase/firestore";
import db from "@/lib/firebase";
import { ServiceCall, ServiceCallFormData, ServiceCallStatus } from "@/lib/types";

interface UseServiceCallMutationsReturn {
  updateServiceCall: (id: string, data: Partial<ServiceCall>) => Promise<boolean>;
  createServiceCall: (data: ServiceCallFormData) => Promise<string | null>;
  deleteServiceCall: (id: string) => Promise<boolean>;
  updateStatus: (id: string, status: ServiceCallStatus) => Promise<boolean>;
  updateTakenBy: (id: string, takenBy: string) => Promise<boolean>;
  isPending: boolean;
  error: string | null;
}

export function useServiceCallMutations(): UseServiceCallMutationsReturn {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const updateServiceCall = async (
    id: string,
    data: Partial<ServiceCall>
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          setError(null);
          const serviceCallRef = doc(db, "ServiceCalls", id);
          
          const updateData: any = {
            ...data,
            updatedAt: Timestamp.now(),
          };

          // Convert Date objects to Timestamps
          if (data.date) {
            updateData.date = Timestamp.fromDate(data.date);
          }

          await updateDoc(serviceCallRef, updateData);
          resolve(true);
        } catch (err) {
          console.error("Error updating service call:", err);
          setError(err instanceof Error ? err.message : "Failed to update service call");
          resolve(false);
        }
      });
    });
  };

  const createServiceCall = async (data: ServiceCallFormData): Promise<string | null> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          setError(null);
          const serviceCallData = {
            ...data,
            date: Timestamp.now(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          const docRef = await addDoc(collection(db, "ServiceCalls"), serviceCallData);
          resolve(docRef.id);
        } catch (err) {
          console.error("Error creating service call:", err);
          setError(err instanceof Error ? err.message : "Failed to create service call");
          resolve(null);
        }
      });
    });
  };

  const deleteServiceCall = async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          setError(null);
          await deleteDoc(doc(db, "ServiceCalls", id));
          resolve(true);
        } catch (err) {
          console.error("Error deleting service call:", err);
          setError(err instanceof Error ? err.message : "Failed to delete service call");
          resolve(false);
        }
      });
    });
  };

  const updateStatus = async (id: string, status: ServiceCallStatus): Promise<boolean> => {
    return updateServiceCall(id, { status });
  };

  const updateTakenBy = async (id: string, takenBy: string): Promise<boolean> => {
    return updateServiceCall(id, { takenBy });
  };

  return {
    updateServiceCall,
    createServiceCall,
    deleteServiceCall,
    updateStatus,
    updateTakenBy,
    isPending,
    error,
  };
}

interface UseOptimisticUpdatesReturn<T> {
  optimisticData: T[];
  addOptimisticUpdate: (id: string, data: Partial<T>) => void;
  removeOptimisticUpdate: (id: string) => void;
  clearOptimisticUpdates: () => void;
}

export function useOptimisticUpdates<T extends { id: string }>(
  originalData: T[]
): UseOptimisticUpdatesReturn<T> {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, Partial<T>>>(
    new Map()
  );

  const optimisticData = originalData.map((item) => {
    const update = optimisticUpdates.get(item.id);
    return update ? { ...item, ...update } : item;
  });

  const addOptimisticUpdate = (id: string, data: Partial<T>) => {
    setOptimisticUpdates((prev) => new Map(prev).set(id, data));
  };

  const removeOptimisticUpdate = (id: string) => {
    setOptimisticUpdates((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  const clearOptimisticUpdates = () => {
    setOptimisticUpdates(new Map());
  };

  return {
    optimisticData,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    clearOptimisticUpdates,
  };
}
