"use server";

import db from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { MongoClient } from "mongodb";
import { ServiceCall } from "../(definitions)/definitions";


const uri = process.env.DATABASE_URL || "";
const client = new MongoClient(uri);

export async function getWeekendServiceCalls(startDate: Date, endDate: Date) {
  const serviceCallsRef = collection(db, "ServiceCalls");



  const q = query(
    serviceCallsRef,
    where("date", ">=", Timestamp.fromDate(startDate)),
    where("date", "<=", Timestamp.fromDate(endDate))
  );

  const querySnapshot = await getDocs(q);

  const weekendServiceCalls = querySnapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        ...data,
        date: data.date ? data.date.toDate() : null, 
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
        id: doc.id,
      } as ServiceCall;
    })
    .filter((serviceCall) => {
      const dayOfWeek = serviceCall.date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    });


  return {
    count: weekendServiceCalls.length,
    serviceCalls: weekendServiceCalls,
  };
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
          $or: [{ hourOfDay: { $gte: 17 } }, { hourOfDay: { $lt: 8 } }],
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

function convertFirestoreTimestamps(serviceCall: any) {
  return {
    ...serviceCall,
    createdAt: serviceCall.createdAt?.toDate(),
    updatedAt: serviceCall.updatedAt?.toDate(),
    date: serviceCall.date?.toDate(),
  };
}
