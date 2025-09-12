"use client";

import { useState, useEffect } from "react";
import { ServiceCall, ServiceCallStatus } from "@/lib/types";

interface UseDashboardStatsReturn {
  totalServiceCalls: number;
  openServiceCalls: number;
  inProgressServiceCalls: number;
  completedServiceCalls: number;
  resolvedToday: number;
  resolvedYesterday: number;
  unassignedServiceCalls: number;
  trend: {
    icon: string;
    color: string;
    label: string;
  } | null;
  loading: boolean;
}

export function useDashboardStats(serviceCalls: ServiceCall[]): UseDashboardStatsReturn {
  const [stats, setStats] = useState({
    totalServiceCalls: 0,
    openServiceCalls: 0,
    inProgressServiceCalls: 0,
    completedServiceCalls: 0,
    resolvedToday: 0,
    resolvedYesterday: 0,
    unassignedServiceCalls: 0,
    trend: null as any,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceCalls) {
      setLoading(true);
      return;
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const totalServiceCalls = serviceCalls.length;
    const openServiceCalls = serviceCalls.filter(
      (call) => call.status === ServiceCallStatus.OPEN
    ).length;
    const inProgressServiceCalls = serviceCalls.filter(
      (call) => call.status === ServiceCallStatus.IN_PROGRESS
    ).length;
    const completedServiceCalls = serviceCalls.filter(
      (call) => call.status === ServiceCallStatus.DONE
    ).length;

    const resolvedToday = serviceCalls.filter(
      (call) =>
        call.status === ServiceCallStatus.DONE &&
        call.updatedAt &&
        call.updatedAt.toDateString() === today.toDateString()
    ).length;

    const resolvedYesterday = serviceCalls.filter(
      (call) =>
        call.status === ServiceCallStatus.DONE &&
        call.updatedAt &&
        call.updatedAt.toDateString() === yesterday.toDateString()
    ).length;

    const unassignedServiceCalls = serviceCalls.filter(
      (call) => call.takenBy === "Select..." || !call.takenBy
    ).length;

    let trend = null;
    if (resolvedToday > resolvedYesterday) {
      trend = { icon: "▲", color: "text-green-600", label: "Up" };
    } else if (resolvedToday < resolvedYesterday) {
      trend = { icon: "▼", color: "text-red-600", label: "Down" };
    } else {
      trend = { icon: "▬", color: "text-gray-400", label: "No Change" };
    }

    setStats({
      totalServiceCalls,
      openServiceCalls,
      inProgressServiceCalls,
      completedServiceCalls,
      resolvedToday,
      resolvedYesterday,
      unassignedServiceCalls,
      trend,
    });
    setLoading(false);
  }, [serviceCalls]);

  return { ...stats, loading };
}

interface UseServiceCallFiltersReturn {
  filteredServiceCalls: ServiceCall[];
  filters: {
    status: ServiceCallStatus | "";
    location: string;
    takenBy: string;
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
  };
  setStatusFilter: (status: ServiceCallStatus | "") => void;
  setLocationFilter: (location: string) => void;
  setTakenByFilter: (takenBy: string) => void;
  setDateRangeFilter: (start: Date | null, end: Date | null) => void;
  clearFilters: () => void;
}

export function useServiceCallFilters(
  serviceCalls: ServiceCall[]
): UseServiceCallFiltersReturn {
  const [filters, setFilters] = useState({
    status: "" as ServiceCallStatus | "",
    location: "",
    takenBy: "",
    dateRange: {
      start: null as Date | null,
      end: null as Date | null,
    },
  });

  const [filteredServiceCalls, setFilteredServiceCalls] = useState<ServiceCall[]>([]);

  useEffect(() => {
    let filtered = [...serviceCalls];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((call) => call.status === filters.status);
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter((call) =>
        call.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by takenBy
    if (filters.takenBy) {
      filtered = filtered.filter((call) =>
        call.takenBy.toLowerCase().includes(filters.takenBy.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateRange.start) {
      filtered = filtered.filter((call) => {
        const callDate = new Date(call.date);
        return callDate >= filters.dateRange.start!;
      });
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter((call) => {
        const callDate = new Date(call.date);
        return callDate <= filters.dateRange.end!;
      });
    }

    setFilteredServiceCalls(filtered);
  }, [serviceCalls, filters]);

  const setStatusFilter = (status: ServiceCallStatus | "") => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const setLocationFilter = (location: string) => {
    setFilters((prev) => ({ ...prev, location }));
  };

  const setTakenByFilter = (takenBy: string) => {
    setFilters((prev) => ({ ...prev, takenBy }));
  };

  const setDateRangeFilter = (start: Date | null, end: Date | null) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { start, end },
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      location: "",
      takenBy: "",
      dateRange: { start: null, end: null },
    });
  };

  return {
    filteredServiceCalls,
    filters,
    setStatusFilter,
    setLocationFilter,
    setTakenByFilter,
    setDateRangeFilter,
    clearFilters,
  };
}
