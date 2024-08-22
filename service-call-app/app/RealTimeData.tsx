"use client";
import { useState, useEffect } from "react";
import * as Realm from "realm-web";
import Link from "next/link";
import Status from "./dashboard/[id]/Status"; // Ensure path is correct
import TakenBy from "./dashboard/[id]/TakenBy";
 // Ensure path is correct

// Your Realm App ID
const app = new Realm.App({ id: "application-0-hpdeqzt" });

const RealTimeData = () => {
  const [user, setUser] = useState<Realm.User | null>(null);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  useEffect(() => {
    // Automatic login when the component mounts
    const loginAnonymous = async () => {
      const user: Realm.User = await app.logIn(Realm.Credentials.anonymous());
      setUser(user);
    };
    loginAnonymous().catch(console.error);
  }, []);

  useEffect(() => {
    const fetchDataAndWatchChanges = async () => {
      if (!user) return;
  
      const mongodb = app.currentUser?.mongoClient("mongodb-atlas");
      const collection = mongodb?.db("your-database-name").collection("ServiceCall");
  
      try {
        const initialData = await collection?.find({});
  
        // Sort the data by date in descending order
        const sortedData = initialData?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
        // Set the sorted data into state
        setRealTimeData(sortedData || []);
  
        // Open a change stream to listen for changes
        const changeStream = collection?.watch();
  
        // Listen for changes
        for await (const change of changeStream!) {
          console.log("Change detected:", change);
  
          setRealTimeData((prevData) => {
            switch (change.operationType) {
              case "insert":
                return [change.fullDocument, ...prevData];
              case "update":
                return prevData.map((doc) =>
                  doc._id.toString() === change.documentKey._id.toString()
                    ? { ...doc, ...change.updateDescription.updatedFields }
                    : doc
                );
              case "delete":
                return prevData.filter((doc) => doc._id !== change.documentKey._id);
              default:
                console.warn("Unsupported event type:", change.operationType);
                return prevData;
            }
          });
        }
      } catch (error) {
        console.error("Error fetching initial data or watching changes:", error);
      }
    };
  
    if (user) {
      fetchDataAndWatchChanges().catch(console.error);
    }
  }, [user]);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Real-time Service Calls</h2>

      {realTimeData.length > 0 && (
        <div className="md:block">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Updated At</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Location</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Who Called</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Machine</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Reported Problem</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Taken By</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Notes</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {realTimeData.map((serviceCall) => (
                <tr key={serviceCall._id.toString()} className="hover:bg-gray-50 border-t border-gray-200">
                  <td className="py-2 px-4 text-sm text-gray-700">
                    {serviceCall.date ? new Date(serviceCall.date).toLocaleString() : "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700">
                    {serviceCall.updatedAt ? new Date(serviceCall.updatedAt).toLocaleString() : "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700">
                    {serviceCall.location || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700">
                    {serviceCall.whoCalled || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700">
                    {serviceCall.machine || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700">
                    {serviceCall.reportedProblem || "N/A"}
                  </td>
                  {/* Status Component */}
                  <td className="py-2 px-4 text-sm text-gray-700 break-words" style={{ width: "125px" }}>
                    <Status id={serviceCall._id.toString()} currentStatus={serviceCall.status} />
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700">
                  <TakenBy id={serviceCall._id.toString()} currentTakenBy={serviceCall.takenBy} />
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700 break-words">
                    {serviceCall.notes || "N/A"}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-700">
                    <Link href={`/dashboard/${serviceCall._id.toString()}/edit`} passHref>
                      <button className="text-blue-500 hover:underline">Edit</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RealTimeData;
