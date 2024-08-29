"use server";

import db from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import { ServiceCall } from "../(definitions)/definitions";

interface CallsByDay {
  callCount: number;
  serviceCalls: any[];
}

export async function getWeekendServiceCalls(startDate: Date, endDate: Date) {
  const serviceCallsRef = collection(db, "ServiceCalls");
  const toCentralTime = (date: Date) => {
    const centralTimeOffset = -5; // Central Standard Time is UTC-6
    const centralDate = new Date(date.getTime() + centralTimeOffset * 60 * 60 * 1000);
    return centralDate;
  };
  const centralStartDate = toCentralTime(startDate);
  const centralEndDate = toCentralTime(endDate);


  const q = query(
    serviceCallsRef,
    where("date", ">=", Timestamp.fromDate(centralStartDate)),
    where("date", "<=", Timestamp.fromDate(centralEndDate))
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
): Promise<{ dayOfWeek: number; callCount: number; serviceCalls: any[] }[]> {
  const serviceCallsRef = collection(db, "ServiceCalls");

  const toCentralTime = (date: Date) => {
    const centralTimeOffset = -5; // Central Standard Time is UTC-6
    const centralDate = new Date(date.getTime() + centralTimeOffset * 60 * 60 * 1000);
    return centralDate;
  };
  const centralStartDate = toCentralTime(startDate);
  const centralEndDate = toCentralTime(endDate);

  const q = query(
    serviceCallsRef,
    where("date", ">=", Timestamp.fromDate(centralStartDate)),
    where("date", "<=", Timestamp.fromDate(centralEndDate))
  );

  const querySnapshot = await getDocs(q);

 
  const callsByDayOfWeek: { [key: string]: CallsByDay } = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();

  
    const localDate = new Date(data.date.toDate());

    const hourOfDay = localDate.getHours();
    const dayOfWeek = localDate.getDay(); 


    if (
      (hourOfDay >= 17 || hourOfDay < 8) &&
      dayOfWeek >= 1 &&
      dayOfWeek <= 5
    ) {
      if (!callsByDayOfWeek[dayOfWeek]) {
        callsByDayOfWeek[dayOfWeek] = { callCount: 0, serviceCalls: [] };
      }


      callsByDayOfWeek[dayOfWeek].callCount += 1;


      callsByDayOfWeek[dayOfWeek].serviceCalls.push({
        ...data,
        id: doc.id,
        date: localDate.toISOString(),
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
