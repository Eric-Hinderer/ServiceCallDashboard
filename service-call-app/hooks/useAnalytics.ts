"use client";

import { useState, useEffect } from "react";
import {
  getWeekendServiceCalls,
  getAfterHoursCallsByDayOfWeek,
  getCallsPerLocation,
  getCallsPerTakenBy,
  getCallsPerMachine,
} from "@/app/analytics/action";
import { DayData, WeekendData } from "@/lib/types";

interface UseAnalyticsDataOptions {
  startDate: Date;
  endDate: Date;
  autoFetch?: boolean;
}

interface UseAnalyticsDataReturn {
  weekendData: WeekendData | null;
  afterHoursCallsByDayOfWeek: DayData[];
  callsPerLocation: { [key: string]: number };
  callsPerTakenBy: { [key: string]: number };
  callsPerMachine: { [key: string]: number };
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAnalyticsData({
  startDate,
  endDate,
  autoFetch = true,
}: UseAnalyticsDataOptions): UseAnalyticsDataReturn {
  const [weekendData, setWeekendData] = useState<WeekendData | null>(null);
  const [afterHoursCallsByDayOfWeek, setAfterHoursCallsByDayOfWeek] = useState<DayData[]>([]);
  const [callsPerLocation, setCallsPerLocation] = useState<{ [key: string]: number }>({});
  const [callsPerTakenBy, setCallsPerTakenBy] = useState<{ [key: string]: number }>({});
  const [callsPerMachine, setCallsPerMachine] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    if (!startDate || !endDate) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [
        weekendResult,
        afterHoursCalls,
        locationCalls,
        takenByCalls,
        machineCalls,
      ] = await Promise.all([
        getWeekendServiceCalls(startDate, endDate),
        getAfterHoursCallsByDayOfWeek(startDate, endDate),
        getCallsPerLocation(startDate, endDate),
        getCallsPerTakenBy(startDate, endDate),
        getCallsPerMachine(startDate, endDate),
      ]);

      setWeekendData(weekendResult);
      setAfterHoursCallsByDayOfWeek(afterHoursCalls);
      setCallsPerLocation(locationCalls);
      setCallsPerTakenBy(takenByCalls);
      setCallsPerMachine(machineCalls);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchAnalyticsData();
  };

  useEffect(() => {
    if (autoFetch) {
      fetchAnalyticsData();
    }
  }, [startDate, endDate, autoFetch]);

  return {
    weekendData,
    afterHoursCallsByDayOfWeek,
    callsPerLocation,
    callsPerTakenBy,
    callsPerMachine,
    loading,
    error,
    refetch,
  };
}

interface UseWeekendDataReturn {
  weekendData: WeekendData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWeekendData(startDate: Date, endDate: Date): UseWeekendDataReturn {
  const [weekendData, setWeekendData] = useState<WeekendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeekendData = async () => {
    if (!startDate || !endDate) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await getWeekendServiceCalls(startDate, endDate);
      setWeekendData(result);
    } catch (err) {
      console.error("Error fetching weekend data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch weekend data");
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchWeekendData();
  };

  useEffect(() => {
    fetchWeekendData();
  }, [startDate, endDate]);

  return { weekendData, loading, error, refetch };
}

interface UseAfterHoursDataReturn {
  afterHoursData: DayData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAfterHoursData(startDate: Date, endDate: Date): UseAfterHoursDataReturn {
  const [afterHoursData, setAfterHoursData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAfterHoursData = async () => {
    if (!startDate || !endDate) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await getAfterHoursCallsByDayOfWeek(startDate, endDate);
      setAfterHoursData(result);
    } catch (err) {
      console.error("Error fetching after hours data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch after hours data");
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchAfterHoursData();
  };

  useEffect(() => {
    fetchAfterHoursData();
  }, [startDate, endDate]);

  return { afterHoursData, loading, error, refetch };
}
