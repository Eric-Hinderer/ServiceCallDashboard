import * as React from "react";
import { MongoClient } from "mongodb";
import { Card, CardContent } from "@/components/ui/card";

// Mapping dayOfWeek numbers to day names
const dayNames: { [key: number]: string } = {
  2: "Monday",
  3: "Tuesday",
  4: "Wednesday",
  5: "Thursday",
  6: "Friday",
};

// Define the structure of afterHoursCallsByDayOfWeek data
interface DayData {
  _id: number;
  callCount: number;
}

// Server component - no useEffect needed, we can perform the query directly
export default async function AnalyticsPage() {
  const client = new MongoClient(process.env.DATABASE_URL || "");

  // Fetch the count of weekend service calls and after-hours calls by day of the week
  let weekendCallCount = 0;
  let afterHoursCallsByDayOfWeek: DayData[] = [];

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    const db = client.db("your-database-name"); // Ensure correct DB name
    console.log("Connected to database:", db.databaseName);

    const serviceCallsCollection = db.collection("ServiceCall");

    // Fetch weekend service calls
    console.log("Starting aggregation pipeline for weekend service calls...");
    const weekendResult = await serviceCallsCollection
      .aggregate([
        {
          $addFields: {
            dayOfWeek: { $dayOfWeek: "$date" },
          },
        },
        {
          $match: {
            dayOfWeek: { $in: [1, 7] }, // 1 is Sunday, 7 is Saturday
          },
        },
        {
          $count: "weekendCallsCount",
        },
      ])
      .toArray();

    if (weekendResult.length > 0) {
      weekendCallCount = weekendResult[0].weekendCallsCount;
      console.log("Weekend Call Count:", weekendCallCount);
    } else {
      console.log("No weekend calls found.");
      weekendCallCount = 0;
    }

    // Fetch after-hours calls grouped by day of the week
    console.log(
      "Starting aggregation pipeline for after-hours calls grouped by day of the week..."
    );
    afterHoursCallsByDayOfWeek = await serviceCallsCollection
      .aggregate([
        {
          $addFields: {
            hourOfDay: { $hour: "$date" },
            dayOfWeek: { $dayOfWeek: "$date" },
          },
        },
        {
          $match: {
            $or: [{ hourOfDay: { $lt: 8 } }, { hourOfDay: { $gte: 17 } }],
            dayOfWeek: { $gte: 2, $lte: 6 }, // Monday (2) to Friday (6)
          },
        },
        {
          $group: {
            _id: "$dayOfWeek", // Group by day of the week
            callCount: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by day of the week
        },
      ])
      .toArray();

    console.log(
      "After-hours calls grouped by day of the week:",
      afterHoursCallsByDayOfWeek
    );
  } catch (error) {
    console.error("Error during MongoDB query:", error);
  } finally {
    console.log("Closing MongoDB connection...");
    await client.close(); // Ensure the client is closed after querying
    console.log("MongoDB connection closed.");
  }

  // Calculate the total after-hours calls
  const totalAfterHoursCalls = afterHoursCallsByDayOfWeek.reduce(
    (total, dayData) => total + dayData.callCount,
    0
  );

  // Render the component with the data fetched on the server side
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
      {" "}
      {/* Added padding bottom for spacing */}
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-10">
        Dashboard Charts
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Card for displaying the weekend service calls count */}

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

        {/* Display after-hours calls grouped by day of the week */}
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
