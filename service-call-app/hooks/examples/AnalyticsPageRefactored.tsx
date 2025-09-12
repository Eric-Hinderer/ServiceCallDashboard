// Example: Refactored Analytics Page using custom hooks
"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subDays } from "date-fns";
import Link from "next/link";
import { DAY_NAMES } from "@/lib/types";
import Chart from "chart.js/auto";

// Import our custom hooks
import { useAnalyticsData } from "@/hooks";

export default function AnalyticsPageRefactored() {
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    subDays(new Date(), 30)
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());

  // Use custom analytics hook
  const {
    weekendData,
    afterHoursCallsByDayOfWeek,
    callsPerLocation,
    callsPerTakenBy,
    callsPerMachine,
    loading,
    error,
    refetch,
  } = useAnalyticsData({
    startDate: startDate || new Date(),
    endDate: endDate || new Date(),
    autoFetch: true,
  });

  // Chart refs
  const chartRef = React.useRef<HTMLCanvasElement | null>(null);
  const chartInstance = React.useRef<Chart | null>(null);
  const chartPerTakenByRef = React.useRef<HTMLCanvasElement | null>(null);
  const chartPerTakenByInstance = React.useRef<Chart | null>(null);
  const chartPerMachineRef = React.useRef<HTMLCanvasElement | null>(null);
  const chartPerMachineInstance = React.useRef<Chart | null>(null);

  // Chart setup effects (same as before but cleaner data source)
  React.useEffect(() => {
    if (!chartRef.current || loading || !callsPerLocation) return;

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
          },
        ],
      },
      options: {
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 90,
              minRotation: 90,
              font: {
                size: 10,
              },
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [callsPerLocation, loading]);

  React.useEffect(() => {
    if (!chartPerTakenByRef.current || loading || !callsPerTakenBy) return;

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
            backgroundColor: "#3B82F6",
          },
        ],
      },
      options: {
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 90,
              minRotation: 90,
              font: {
                size: 10,
              },
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartPerTakenByInstance.current) {
        chartPerTakenByInstance.current.destroy();
      }
    };
  }, [callsPerTakenBy, loading]);

  React.useEffect(() => {
    if (!chartPerMachineRef.current || loading || !callsPerMachine) return;

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
            backgroundColor: "#3B82F6",
          },
        ],
      },
      options: {
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 90,
              minRotation: 90,
              font: {
                size: 10,
              },
            },
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartPerMachineInstance.current) {
        chartPerMachineInstance.current.destroy();
      }
    };
  }, [callsPerMachine, loading]);

  const handleWeekendClick = (data: any) => {
    sessionStorage.setItem("weekendServiceCalls", JSON.stringify(data.serviceCalls));
  };

  const handleDayClick = (dayData: any) => {
    sessionStorage.setItem("serviceCalls", JSON.stringify(dayData.serviceCalls));
  };

  if (error) {
    return (
      <div className="px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">
            Error Loading Analytics
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-8">
        Service Call Analytics
      </h1>

      {/* Date Range Picker */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center items-center">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date || undefined)}
            className="border border-gray-300 rounded px-3 py-2"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date || undefined)}
            className="border border-gray-300 rounded px-3 py-2"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 self-end"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading analytics data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* After Hours Calls by Day of Week */}
          <Card className="w-full rounded-lg shadow-lg bg-white">
            <CardContent className="flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                  After Hours Calls by Day of Week
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {afterHoursCallsByDayOfWeek.map((dayData) => (
                    <Link
                      key={dayData.dayOfWeek}
                      href={`/analytics/day/${dayData.dayOfWeek}`}
                      passHref
                      className="block hover:text-blue-600 transition"
                      onClick={() => handleDayClick(dayData)}
                    >
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h3 className="text-lg font-medium">
                          {DAY_NAMES[dayData.dayOfWeek]}
                        </h3>
                        <p className="text-2xl font-bold text-blue-500 mt-2">
                          {dayData.callCount}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekend Calls */}
          <Card className="w-full rounded-lg shadow-lg bg-white">
            <CardContent className="flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700">
                  Weekend Service Calls
                </h2>
                <Link
                  href="/analytics/day/weekend"
                  passHref
                  className="hover:text-blue-600 transition"
                  onClick={() => handleWeekendClick(weekendData!)}
                >
                  <p className="text-4xl font-bold text-blue-500 mt-4">
                    {weekendData?.count || 0}
                  </p>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <Card className="w-full rounded-lg shadow-lg bg-white">
            <CardContent className="flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700">
                  Calls per Location
                </h2>
                <div className="mt-6">
                  <canvas
                    ref={chartRef}
                    width={800}
                    height={400}
                    style={{ maxWidth: "100%", maxHeight: "400px" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full rounded-lg shadow-lg bg-white">
            <CardContent className="flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700">
                  Calls per Taken By
                </h2>
                <div className="mt-6">
                  <canvas
                    ref={chartPerTakenByRef}
                    width={800}
                    height={400}
                    style={{ maxWidth: "100%", maxHeight: "400px" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full rounded-lg shadow-lg bg-white col-span-full">
            <CardContent className="flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700">
                  Calls per Machine
                </h2>
                <div className="mt-6">
                  <canvas
                    ref={chartPerMachineRef}
                    width={800}
                    height={400}
                    style={{ maxWidth: "100%", maxHeight: "400px" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
