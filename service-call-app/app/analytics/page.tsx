"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, subDays } from "date-fns";
import { CalendarIcon, BarChart3, TrendingUp, Users, MapPin, Wrench, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getWeekendServiceCalls,
  getAfterHoursCallsByDayOfWeek,
  getCallsPerLocation,
  getCallsPerTakenBy,
  getCallsPerMachine,
} from "./action";
import Link from "next/link";
import { dayNames, ServiceCall } from "../(definitions)/definitions";
import Chart from "chart.js/auto";
import toast from "react-hot-toast";

interface DayData {
  dayOfWeek: number;
  callCount: number;
  serviceCalls: any[];
}

interface WeekendData {
  count: number;
  serviceCalls: ServiceCall[];
}

interface ChartData {
  [key: string]: number;
}

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [weekendData, setWeekendData] = useState<WeekendData>({ count: 0, serviceCalls: [] });
  const [afterHoursCallsByDayOfWeek, setAfterHoursCallsByDayOfWeek] = useState<DayData[]>([]);
  const [callsPerLocation, setCallsPerLocation] = useState<ChartData>({});
  const [callsPerTakenBy, setCallsPerTakenBy] = useState<ChartData>({});
  const [callsPerMachine, setCallsPerMachine] = useState<ChartData>({});

  // Chart refs - moved to useRef hooks
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const chartPerTakenByRef = useRef<HTMLCanvasElement | null>(null);
  const chartPerTakenByInstance = useRef<Chart | null>(null);
  const chartPerMachineRef = useRef<HTMLCanvasElement | null>(null);
  const chartPerMachineInstance = useRef<Chart | null>(null);

  // Memoized calculations for performance
  const totalAfterHoursCalls = useMemo(() => 
    afterHoursCallsByDayOfWeek.reduce((total, dayData) => total + dayData.callCount, 0),
    [afterHoursCallsByDayOfWeek]
  );

  const totalCalls = useMemo(() => 
    Object.values(callsPerLocation).reduce((sum, count) => sum + count, 0),
    [callsPerLocation]
  );

  // Optimized data fetching
  const fetchAnalyticsData = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const [weekendResult, afterHoursCalls, locationData, takenByData, machineData] = 
        await Promise.all([
          getWeekendServiceCalls(startDate, endDate),
          getAfterHoursCallsByDayOfWeek(startDate, endDate),
          getCallsPerLocation(startDate, endDate),
          getCallsPerTakenBy(startDate, endDate),
          getCallsPerMachine(startDate, endDate),
        ]);

      setWeekendData(weekendResult);
      setAfterHoursCallsByDayOfWeek(afterHoursCalls);
      setCallsPerLocation(locationData);
      setCallsPerTakenBy(takenByData);
      setCallsPerMachine(machineData);
      
      toast.success("Analytics data updated successfully");
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Failed to fetch analytics data");
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Chart creation effects
  useEffect(() => {
    if (!chartRef.current || Object.keys(callsPerLocation).length === 0) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(callsPerLocation),
        datasets: [
          {
            label: "Calls per Location",
            data: Object.values(callsPerLocation),
            backgroundColor: "#3B82F6",
            borderColor: "#1D4ED8",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 8,
              maxRotation: 45,
              minRotation: 0,
              font: { size: 11 },
            },
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [callsPerLocation]);

  useEffect(() => {
    if (!chartPerTakenByRef.current || Object.keys(callsPerTakenBy).length === 0) return;

    if (chartPerTakenByInstance.current) {
      chartPerTakenByInstance.current.destroy();
    }

    chartPerTakenByInstance.current = new Chart(chartPerTakenByRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(callsPerTakenBy),
        datasets: [
          {
            label: "Calls per Person",
            data: Object.values(callsPerTakenBy),
            backgroundColor: "#10B981",
            borderColor: "#059669",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 8,
              maxRotation: 45,
              minRotation: 0,
              font: { size: 11 },
            },
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
          },
        },
      },
    });

    return () => {
      if (chartPerTakenByInstance.current) {
        chartPerTakenByInstance.current.destroy();
      }
    };
  }, [callsPerTakenBy]);

  useEffect(() => {
    if (!chartPerMachineRef.current || Object.keys(callsPerMachine).length === 0) return;

    if (chartPerMachineInstance.current) {
      chartPerMachineInstance.current.destroy();
    }

    chartPerMachineInstance.current = new Chart(chartPerMachineRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(callsPerMachine),
        datasets: [
          {
            label: "Calls per Machine",
            data: Object.values(callsPerMachine),
            backgroundColor: "#F59E0B",
            borderColor: "#D97706",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 8,
              maxRotation: 45,
              minRotation: 0,
              font: { size: 11 },
            },
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
          },
        },
      },
    });

    return () => {
      if (chartPerMachineInstance.current) {
        chartPerMachineInstance.current.destroy();
      }
    };
  }, [callsPerMachine]);

  // Helper functions
  const handleDayClick = useCallback((dayData: DayData) => {
    sessionStorage.setItem("serviceCalls", JSON.stringify(dayData.serviceCalls));
  }, []);

  const handleWeekendClick = useCallback((weekendData: WeekendData) => {
    sessionStorage.setItem("weekendServiceCalls", JSON.stringify(weekendData.serviceCalls));
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-6"
      style={{
        paddingBottom:
          "calc(1.5rem + var(--bottom-nav-h) + env(safe-area-inset-bottom))",
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive service call insights and performance metrics
          </p>
        </div>

        {/* Date Range and Controls */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Date Range Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  value={format(startDate, 'yyyy-MM-dd')}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <Input
                  type="date"
                  value={format(endDate, 'yyyy-MM-dd')}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                  className="w-full"
                />
              </div>
              <Button
                onClick={fetchAnalyticsData}
                disabled={loading}
                className="flex items-center gap-2 min-w-[120px]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{totalCalls}</div>
              <p className="text-xs text-blue-600 mt-1">In selected period</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                After Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{totalAfterHoursCalls}</div>
              <p className="text-xs text-amber-600 mt-1">Outside normal hours</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Weekend Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{weekendData.count}</div>
              <p className="text-xs text-purple-600 mt-1">Saturday & Sunday</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Unique Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {Object.keys(callsPerLocation).length}
              </div>
              <p className="text-xs text-green-600 mt-1">Different sites</p>
            </CardContent>
          </Card>
        </div>
        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* After-Hours Calls by Day */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                After-Hours Calls by Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {afterHoursCallsByDayOfWeek.map((dayData) => (
                  <Link
                    key={dayData.dayOfWeek}
                    href={`/analytics/day/${dayData.dayOfWeek}`}
                    onClick={() => handleDayClick(dayData)}
                    className="block p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors border hover:border-blue-200"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">
                        {dayNames[dayData.dayOfWeek]}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{dayData.callCount} call(s)</span>
                        <div 
                          className="w-8 h-2 bg-blue-200 rounded-full overflow-hidden"
                          title={`${dayData.callCount} calls`}
                        >
                          <div 
                            className="h-full bg-blue-500 transition-all"
                            style={{
                              width: `${totalAfterHoursCalls > 0 ? (dayData.callCount / totalAfterHoursCalls) * 100 : 0}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {totalAfterHoursCalls > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center font-semibold text-gray-800">
                      <span>Total After-Hours Calls:</span>
                      <span className="text-lg">{totalAfterHoursCalls}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekend Service Calls */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                Weekend Service Calls
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <Link
                href="/analytics/day/weekend"
                onClick={() => handleWeekendClick(weekendData)}
                className="text-center group hover:bg-purple-50 p-6 rounded-lg transition-colors"
              >
                <div className="text-6xl font-bold text-purple-600 group-hover:text-purple-700 transition-colors">
                  {weekendData.count}
                </div>
                <p className="text-gray-600 mt-2 group-hover:text-gray-700">
                  Weekend calls in selected period
                </p>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6">
          {/* Calls per Location Chart */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Calls by Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <canvas ref={chartRef} className="w-full h-full" />
              </div>
            </CardContent>
          </Card>

          {/* Calls per Taken By Chart */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Calls by Technician
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <canvas ref={chartPerTakenByRef} className="w-full h-full" />
              </div>
            </CardContent>
          </Card>

          {/* Calls per Machine Chart */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-600" />
                Calls by Machine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <canvas ref={chartPerMachineRef} className="w-full h-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {totalCalls === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-gray-100 p-4">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">No Data Available</h3>
                  <p className="text-gray-500 mt-1">
                    No service calls found in the selected date range. Try adjusting your date selection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
