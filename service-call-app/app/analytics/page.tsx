"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subDays } from "date-fns";
import {
  getWeekendServiceCalls,
  getAfterHoursCallsByDayOfWeek,
} from "./action";
import Link from "next/link";
import { dayNames } from "../(definitions)/definitions";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";

interface DayData {
  _id: number;
  callCount: number;
  serviceCalls: any[];
}

interface WeekendData {
  count: number;
  serviceCalls: any[];
}

export default withPageAuthRequired(function AnalyticsPage() {
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    subDays(new Date(), 30)
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());
  const [weekendData, setWeekendData] = React.useState<WeekendData | undefined>(
    { count: 0, serviceCalls: [] }
  );
  const [afterHoursCallsByDayOfWeek, setAfterHoursCallsByDayOfWeek] =
    React.useState<DayData[]>([]);

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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [startDate, endDate]);

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

  const handleWeekendClick = (weekendData: WeekendData) => {
    sessionStorage.setItem(
      "weekendServiceCalls",
      JSON.stringify(weekendData.serviceCalls)
    );
  };

  const charts = [
    {
      src: "https://charts.mongodb.com/charts-project-0-umtdugs/embed/charts?id=66c818af-f79d-4326-8cd8-634c8d0a2d52&maxDataAge=3600&theme=dark&autoRefresh=true",
      style: {
        background: "#21313C",
      },
    },
    {
      src: "https://charts.mongodb.com/charts-project-0-umtdugs/embed/charts?id=66c81c6d-d25c-4df6-8654-a631eab1c9b5&maxDataAge=3600&theme=dark&autoRefresh=true",
      style: {
        background: "#21313C",
      },
    },
  ];

  return (
    <div className="pt-20 px-6 pb-20">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-10">
        Dashboard Charts
      </h1>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {charts.map((chart, index) => (
          <Card key={index} className="w-full">
            <CardContent className="flex items-center justify-center">
              <iframe
                style={{
                  ...chart.style,
                  border: "none",
                  borderRadius: "2px",
                  boxShadow: "0 2px 10px 0 rgba(70, 76, 79, .2)",
                }}
                width="640"
                height="480"
                src={chart.src}
                title={`MongoDB Chart ${index + 1}`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* After-Hours Calls and Weekend Service Calls Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="w-full">
          <CardContent>
            <h2 className="text-3xl font-bold text-center mb-4">
              After-Hours Calls by Day of the Week
            </h2>
            <div className="space-y-4">
              {afterHoursCallsByDayOfWeek.map((dayData) => (
                <div key={dayData._id} className="text-center">
                  <Link
                    href={{
                      pathname: `/analytics/day/${dayData._id}`,
                    }}
                    passHref
                    onClick={() => handleDayClick(dayData)}
                  >
                    {dayNames[dayData._id]}: {dayData.callCount} call(s)
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
      </div>

      {/* Date Pickers */}
      <div className="flex justify-center space-x-4 mt-8">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date ?? undefined)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="p-2 border rounded"
          />
        </div>
        <div className="w-full max-w-xs mx-auto">
          <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date ?? undefined)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="p-2 border rounded w-full sm:w-auto"
          />
        </div>
      </div>
    </div>
  );
});
