"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subDays } from "date-fns";
import {
  getWeekendServiceCalls,
  getAfterHoursCallsByDayOfWeek,
  getCallsPerLocation,
  getCallsPerTakenBy,
} from "./action";
import Link from "next/link";
import { dayNames, ServiceCall } from "../(definitions)/definitions";
import Chart from "chart.js/auto";

interface DayData {
  dayOfWeek: number;
  callCount: number;
  serviceCalls: any[];
}

interface WeekendData {
  count: number;
  serviceCalls: ServiceCall[];
}

export default function AnalyticsPage() {
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    subDays(new Date(), 30)
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());
  const [weekendData, setWeekendData] = React.useState<WeekendData | undefined>(
    { count: 0, serviceCalls: [] }
  );
  const [afterHoursCallsByDayOfWeek, setAfterHoursCallsByDayOfWeek] =
    React.useState<DayData[]>([]);

  const [callsPerLocation, setCallsPerLocation] = React.useState<{
    [key: string]: number;
  }>({});

  const [callsPerTakenBy, setCallsPerTakenBy] = React.useState<{
    [key: string]: number;
  }>({});

  const chartRef = React.useRef<HTMLCanvasElement | null>(null);
  const chartInstance = React.useRef<Chart | null>(null);

  const chartPerTakenByRef = React.useRef<HTMLCanvasElement | null>(null);
  const chartPerTakenByInstance = React.useRef<Chart | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      if (!startDate || !endDate) return;

      try {
        const weekendResult = await getWeekendServiceCalls(startDate, endDate);
        setWeekendData(weekendResult);

        const afterHoursCalls = await getAfterHoursCallsByDayOfWeek(
          startDate,
          endDate
        );
        setAfterHoursCallsByDayOfWeek(afterHoursCalls);

        const temp = await getCallsPerLocation(startDate, endDate);
        setCallsPerLocation(temp);

        const tempTakenBy = await getCallsPerTakenBy(startDate, endDate);
        setCallsPerTakenBy(tempTakenBy);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  React.useEffect(() => {
    if (!chartRef.current) return;

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
  }, [callsPerLocation]);

  React.useEffect(() => {
    if (!chartPerTakenByRef.current) return;

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
  }, [callsPerTakenBy]);

  const totalAfterHoursCalls = afterHoursCallsByDayOfWeek.reduce(
    (total, dayData) => total + dayData.callCount,
    0
  );

  const handleDayClick = (dayData: DayData) => {
    sessionStorage.setItem(
      "serviceCalls",
      JSON.stringify(dayData.serviceCalls)
    );
  };

  const handleWeekendClick = async (weekendData: WeekendData) => {
    sessionStorage.setItem(
      "weekendServiceCalls",
      JSON.stringify(weekendData.serviceCalls)
    );
  };

  return (
    <div className="px-6 pb-20">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-10">
        Dashboard Charts
      </h1>

      {/* After-Hours Calls and Weekend Service Calls Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="w-full">
          <CardContent>
            <h2 className="text-3xl font-bold text-center mb-4">
              After-Hours Calls by Day of the Week
            </h2>
            <div className="space-y-4">
              {afterHoursCallsByDayOfWeek.map((dayData) => (
                <div key={dayData.dayOfWeek} className="text-center">
                  <Link
                    href={{
                      pathname: `/analytics/day/${dayData.dayOfWeek}`,
                    }}
                    passHref
                    onClick={() => handleDayClick(dayData)}
                  >
                    {dayNames[dayData.dayOfWeek]}: {dayData.callCount} call(s)
                  </Link>
                </div>
              ))}
              <div className="text-center mt-6">
                <p className="text-2xl font-bold">
                  Total: {totalAfterHoursCalls} call(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Weekend Service Calls</h2>
              <Link
                href="/analytics/day/weekend"
                onClick={() => handleWeekendClick(weekendData!)}
                passHref
              >
                <p className="text-5xl font-semibold mt-4">
                  {weekendData!.count}
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Calls per Location</h2>
              <div className="mt-4">
                <canvas
                  ref={chartRef}
                  width={800}
                  height={400}
                  style={{ maxWidth: "100%", maxHeight: "500px" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Calls per Taken By</h2>
              <div className="mt-4">
                <canvas
                  ref={chartPerTakenByRef}
                  width={800}
                  height={400}
                  style={{ maxWidth: "100%", maxHeight: "500px" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Pickers */}
      <div className="flex justify-center space-x-6 mt-12">
        <div className="text-center">
          <label className="block text-gray-700 font-semibold mb-2 text-lg">
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date ?? undefined)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="p-3 border border-gray-300 rounded-lg shadow-md focus:ring focus:ring-indigo-500 w-full"
            placeholderText="Select start date"
          />
        </div>
        <div className="text-center">
          <label className="block text-gray-700 font-semibold mb-2 text-lg">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date ?? undefined)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="p-3 border border-gray-300 rounded-lg shadow-md focus:ring focus:ring-indigo-500 w-full"
            placeholderText="Select end date"
          />
        </div>
      </div>
    </div>
  );
}
