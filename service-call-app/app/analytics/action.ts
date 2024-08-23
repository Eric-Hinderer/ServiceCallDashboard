"use server";

import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL || "";
const client = new MongoClient(uri);

export async function getWeekendServiceCalls(
  startDate: Date,
  endDate: Date
): Promise<{ count: number; serviceCalls: any[] }> {
  await client.connect();
  const db = client.db("your-database-name");
  const serviceCallsCollection = db.collection("ServiceCall");

  const weekendResult = await serviceCallsCollection
    .aggregate([
      {
        $addFields: {
          dayOfWeek: { $dayOfWeek: "$date" },
        },
      },
      {
        $match: {
          dayOfWeek: { $in: [1, 7] },
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $facet: {
          weekendCallsCount: [{ $count: "count" }],
          weekendCallsDocuments: [
            {
              $project: {
                _id: 1,
                date: 1,
                location: 1,
                machine: 1,
                reportedProblem: 1,
                whoCalled: 1,
                status: 1,
                takenBy: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
    ])
    .toArray();

  client.close();

  const count =
    weekendResult[0].weekendCallsCount.length > 0
      ? weekendResult[0].weekendCallsCount[0].count
      : 0;
  const serviceCalls = weekendResult[0].weekendCallsDocuments.map(
    (call: any) => ({
      _id: call._id.toString(),
      date: call.date ? call.date.toISOString() : null,
      location: call.location,
      machine: call.machine,
      reportedProblem: call.reportedProblem,
      whoCalled: call.whoCalled,
      status: call.status,
      takenBy: call.takenBy,
      createdAt: call.createdAt ? call.createdAt.toISOString() : null,
      updatedAt: call.updatedAt ? call.updatedAt.toISOString() : null,
    })
  );

  return { count, serviceCalls };
}

export async function getAfterHoursCallsByDayOfWeek(
  startDate: Date,
  endDate: Date
): Promise<{ _id: number; callCount: number; serviceCalls: any[] }[]> {
  await client.connect();
  const db = client.db("your-database-name");
  const serviceCallsCollection = db.collection("ServiceCall");

  const afterHoursResult = await serviceCallsCollection
    .aggregate([
      {
        // Convert the UTC date to CST (Central Time)
        $addFields: {
          localDate: {
            $dateAdd: {
              startDate: "$date",
              unit: "hour",
              amount: -5, 
            },
          },
        },
      },
      {
        
        $addFields: {
          hourOfDay: { $hour: "$localDate" },
          dayOfWeek: { $dayOfWeek: "$localDate" },  
        },
      },
      {
      
        $match: {
          $or: [
            { hourOfDay: { $gte: 17 } },  
            { hourOfDay: { $lt: 8 } },    
          ],
          dayOfWeek: { $gte: 2, $lte: 6 },  
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $facet: {
          countByDay: [
            {
              $group: {
                _id: "$dayOfWeek", 
                callCount: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],

          callsByDay: [
            {
              $group: {
                _id: "$dayOfWeek",
                serviceCalls: { $push: "$$ROOT" },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ])
    .toArray();

  // Convert complex objects to plain objects
  const plainAfterHoursResult = afterHoursResult[0].countByDay.map(
    (dayCount: any) => {
      const correspondingCalls = afterHoursResult[0].callsByDay.find(
        (dayCalls: any) => dayCalls._id === dayCount._id
      );

      const convertedServiceCalls = correspondingCalls
        ? correspondingCalls.serviceCalls.map((call: any) => ({
            ...call,
            _id: call._id.toString(),
            date: call.date.toISOString(),
            createdAt: call.createdAt?.toISOString(),
            updatedAt: call.updatedAt?.toISOString(), 
          }))
        : [];

      return {
        _id: dayCount._id,
        callCount: dayCount.callCount,
        serviceCalls: convertedServiceCalls,
      };
    }
  );

  client.close();

  return plainAfterHoursResult;
}

