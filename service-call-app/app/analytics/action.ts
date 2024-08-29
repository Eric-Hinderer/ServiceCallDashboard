"use server";

import db from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import { DateTime } from "luxon";

import { ServiceCall } from "../(definitions)/definitions";

interface CallsByDay {
  callCount: number;
  serviceCalls: any[];
}

export async function getWeekendServiceCalls(startDate: Date, endDate: Date) {
  const serviceCallsRef = collection(db, "ServiceCalls");

  const startInCentralTime = DateTime.fromJSDate(startDate, {
    zone: "UTC",
  }).setZone("America/Chicago");
  const endInCentralTime = DateTime.fromJSDate(endDate, {
    zone: "UTC",
  }).setZone("America/Chicago");

  const q = query(
    serviceCallsRef,
    where("date", ">=", Timestamp.fromDate(startInCentralTime.toJSDate())),
    where("date", "<=", Timestamp.fromDate(endInCentralTime.toJSDate()))
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
      const serviceCallDateInCentralTime = DateTime.fromJSDate(serviceCall.date, {
        zone: "UTC",
      }).setZone("America/Chicago");
      const dayOfWeek = serviceCallDateInCentralTime.toJSDate().getDay();

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
): Promise<{ dayOfWeek: number; callCount: number; serviceCalls: any[] }[]> {
  const serviceCallsRef = collection(db, "ServiceCalls");

  const startInCentralTime = DateTime.fromJSDate(startDate, {
    zone: "UTC",
  }).setZone("America/Chicago");
  const endInCentralTime = DateTime.fromJSDate(endDate, {
    zone: "UTC",
  }).setZone("America/Chicago");

  const q = query(
    serviceCallsRef,
    where("date", ">=", Timestamp.fromDate(startInCentralTime.toJSDate())),
    where("date", "<=", Timestamp.fromDate(endInCentralTime.toJSDate()))
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const date: Date = doc.data().date.toDate();
    console.log(date.getTimezoneOffset());
  });

  const callsByDayOfWeek: { [key: string]: CallsByDay } = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    const utcDate = data.date.toDate();

    // Convert the UTC date to Central Time
    const localDate = DateTime.fromJSDate(utcDate, { zone: "UTC" }).setZone("America/Chicago");
  
    const hourOfDay = localDate.hour; 
    const dayOfWeek = localDate.weekday; 
  
  
    console.log(`UTC Date: ${utcDate.toISOString()}, Central Time Date: ${localDate.toISO()}, Day of Week: ${dayOfWeek}`);
  
   
    const afterHoursStart = 17; 
    const afterHoursEnd = 8;   
  
    if (
      ((hourOfDay >= afterHoursStart || hourOfDay < afterHoursEnd)) &&
      dayOfWeek >= 1 && dayOfWeek <= 5
    ) {
      if (!callsByDayOfWeek[dayOfWeek]) {
        callsByDayOfWeek[dayOfWeek] = { callCount: 0, serviceCalls: [] };
      }
      callsByDayOfWeek[dayOfWeek].callCount += 1;
      callsByDayOfWeek[dayOfWeek].serviceCalls.push({
        ...data,
        id: doc.id,
        date: localDate.toJSDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      });
    }
  });

  const result = Object.keys(callsByDayOfWeek)
    .map((day: string) => ({
      dayOfWeek: Number(day),
      callCount: callsByDayOfWeek[day].callCount,
      serviceCalls: callsByDayOfWeek[day].serviceCalls,
    }))
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return result;
}
