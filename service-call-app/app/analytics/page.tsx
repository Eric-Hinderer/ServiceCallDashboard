"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { subDays } from "date-fns";
import { getWeekendCallCount, getAfterHoursCallsByDayOfWeek } from "./action"; // Import your functions

// Mapping dayOfWeek numbers to day names
const dayNames: { [key: number]: string } = {
  2: "Monday",
  3: "Tuesday",
  4: "Wednesday",
  5: "Thursday",
  6: "Friday",
};

interface DayData {
  _id: number;
  callCount: number;
}

export default function AnalyticsPage() {
  const [startDate, setStartDate] = React.useState<Date | undefined>(subDays(new Date(), 30)); 
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());
  const [weekendCallCount, setWeekendCallCount] = React.useState<number>(0);
  const [afterHoursCallsByDayOfWeek, setAfterHoursCallsByDayOfWeek] = React.useState<DayData[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      if (!startDate || !endDate) return; 

      try {
        const weekendCount = await getWeekendCallCount(startDate, endDate);
        setWeekendCallCount(weekendCount);

        const afterHoursCalls = await getAfterHoursCallsByDayOfWeek(startDate, endDate);
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
      <div className="flex justify-center mb-8 space-x-4">
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
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date ?? undefined)} 
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="p-2 border rounded"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

        {afterHoursCallsByDayOfWeek.length > 0 && (
          <Card className="w-full">
            <CardContent>
              <h2 className="text-3xl font-bold text-center mb-4">
                After-Hours Calls by Day of the Week
              </h2>
              <div className="space-y-4">
                {afterHoursCallsByDayOfWeek.map((dayData) => (
                  <div key={dayData._id} className="text-center">
                    <p className="text-xl">
                      {dayNames[dayData._id]}: {dayData.callCount} call(s)
                    </p>
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
        )}

        <Card className="w-full">
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Weekend Service Calls</h2>
              <p className="text-5xl font-semibold mt-4">{weekendCallCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
