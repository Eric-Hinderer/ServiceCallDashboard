"use server";
// action.ts

import { MongoClient } from "mongodb";
import { revalidatePath } from "next/cache";

const uri = process.env.DATABASE_URL || "";
const client = new MongoClient(uri);


export async function getWeekendCallCount(startDate: Date, endDate: Date): Promise<number> {
  await client.connect();
  const db = client.db("your-database-name");
  const serviceCallsCollection = db.collection("ServiceCall");

  const weekendResult = await serviceCallsCollection.aggregate([
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
      $count: "weekendCallsCount",
    },
  ]).toArray();
  client.close();

  return weekendResult.length > 0 ? weekendResult[0].weekendCallsCount : 0;
}


export async function getAfterHoursCallsByDayOfWeek(startDate: Date, endDate: Date): Promise<{ _id: number, callCount: number }[]> {
  await client.connect();
  const db = client.db("your-database-name");
  const serviceCallsCollection = db.collection("ServiceCall");

  const afterHoursResult = await serviceCallsCollection.aggregate([
    {
      $addFields: {
        hourOfDay: { $hour: "$date" },
        dayOfWeek: { $dayOfWeek: "$date" },
      },
    },
    {
      $match: {
        $or: [
          { hourOfDay: { $lt: 8 } },
          { hourOfDay: { $gte: 17 } },
        ],
        dayOfWeek: { $gte: 2, $lte: 6 },
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: "$dayOfWeek",
        callCount: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]).toArray();
  client.close();

  return afterHoursResult as { _id: number, callCount: number }[];
}
