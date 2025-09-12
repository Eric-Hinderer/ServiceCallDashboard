"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import db from "@/lib/firebase";
import { ServiceCall, ServiceCallStatus } from "@/lib/types";

interface UseServiceCallsOptions {
  realTime?: boolean;
  status?: ServiceCallStatus[];
  orderByField?: string;
  orderDirection?: "asc" | "desc";
  startDate?: Date;
  endDate?: Date;
}

interface UseServiceCallsReturn {
  serviceCalls: ServiceCall[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useServiceCalls(
  options: UseServiceCallsOptions = {}
): UseServiceCallsReturn {
  const {
    realTime = false,
    status,
    orderByField = "date",
    orderDirection = "desc",
    startDate,
    endDate,
  } = options;

  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformServiceCall = (doc: any): ServiceCall => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date ? data.date.toDate() : null,
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
      createdAt: data.createdAt ? data.createdAt.toDate() : null,
    } as ServiceCall;
  };

  const buildQuery = () => {
    let q = query(collection(db, "ServiceCalls"));

    // Add status filter
    if (status && status.length > 0) {
      q = query(q, where("status", "in", status));
    }

    // Add date range filter
    if (startDate) {
      q = query(q, where("date", ">=", Timestamp.fromDate(startDate)));
    }
    if (endDate) {
      q = query(q, where("date", "<=", Timestamp.fromDate(endDate)));
    }

    // Add ordering
    q = query(q, orderBy(orderByField, orderDirection));

    return q;
  };

  const fetchServiceCalls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const q = buildQuery();
      const snapshot = await getDocs(q);
      
      const calls = snapshot.docs.map(transformServiceCall);
      setServiceCalls(calls);
    } catch (err) {
      console.error("Error fetching service calls:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch service calls");
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    if (!realTime) {
      fetchServiceCalls();
    }
  };

  useEffect(() => {
    if (realTime) {
      const q = buildQuery();
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const calls = snapshot.docs.map(transformServiceCall);
            setServiceCalls(calls);
            setLoading(false);
            setError(null);
          } catch (err) {
            console.error("Error processing service calls:", err);
            setError(err instanceof Error ? err.message : "Failed to process service calls");
            setLoading(false);
          }
        },
        (err) => {
          console.error("Error in service calls subscription:", err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } else {
      fetchServiceCalls();
    }
  }, [realTime, JSON.stringify(status), orderByField, orderDirection, startDate, endDate]);

  return { serviceCalls, loading, error, refetch };
}

// Specialized hooks for common use cases
export function useOpenServiceCalls(): UseServiceCallsReturn {
  return useServiceCalls({
    realTime: true,
    status: [ServiceCallStatus.OPEN, ServiceCallStatus.IN_PROGRESS],
    orderByField: "date",
    orderDirection: "desc",
  });
}

export function useAllServiceCallsRealTime(): UseServiceCallsReturn {
  return useServiceCalls({
    realTime: true,
    orderByField: "date",
    orderDirection: "desc",
  });
}

export function useServiceCallsByDateRange(
  startDate: Date,
  endDate: Date
): UseServiceCallsReturn {
  return useServiceCalls({
    startDate,
    endDate,
    orderByField: "date",
    orderDirection: "desc",
  });
}
