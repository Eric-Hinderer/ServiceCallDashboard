"use server";

import db from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { ServiceCall } from "../(definitions)/definitions";
import { toCentralTime, toFirestoreDateRange } from "@/lib/dateTimeUtils";
import {
  FIRESTORE_COLLECTION,
  UNASSIGNED_VALUE,
  AFTER_HOURS_START,
  AFTER_HOURS_END,
} from "@/lib/constants";

interface CallsByDay {
  callCount: number;
  serviceCalls: any[];
}

function buildDateRangeQuery(startDate: Date, endDate: Date) {
  const { startTimestamp, endTimestamp } = toFirestoreDateRange(startDate, endDate);
  const serviceCallsRef = collection(db, FIRESTORE_COLLECTION);
  return query(
    serviceCallsRef,
    where("date", ">=", startTimestamp),
    where("date", "<=", endTimestamp)
  );
}

export async function getWeekendServiceCalls(startDate: Date, endDate: Date) {
  const q = buildDateRangeQuery(startDate, endDate);
  const querySnapshot = await getDocs(q);

  const weekendServiceCalls = querySnapshot.docs
    .map((doc) => {
      const data = doc.data();
      const serviceCallDateInCentralTime = toCentralTime(data.date.toDate());

      return {
        ...data,
        date: serviceCallDateInCentralTime.toJSDate(),
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
        id: doc.id,
      } as ServiceCall;
    })
    .filter((serviceCall) => {
      const centralTime = toCentralTime(serviceCall.date);
      const dayOfWeek = centralTime.weekday;
      return dayOfWeek === 6 || dayOfWeek === 7;
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
  const q = buildDateRangeQuery(startDate, endDate);
  const querySnapshot = await getDocs(q);

  const callsByDayOfWeek: { [key: string]: CallsByDay } = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const localDate = toCentralTime(data.date.toDate());

    const hourOfDay = localDate.hour;
    const dayOfWeek = localDate.weekday;

    if (
      (hourOfDay >= AFTER_HOURS_START || hourOfDay < AFTER_HOURS_END) &&
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
        date: localDate.toJSDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      });
    }
  });

  return Object.keys(callsByDayOfWeek)
    .map((day: string) => ({
      dayOfWeek: Number(day),
      callCount: callsByDayOfWeek[day].callCount,
      serviceCalls: callsByDayOfWeek[day].serviceCalls,
    }))
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

function countByField(querySnapshot: any, fieldName: string, fallback?: string) {
  const counts: { [key: string]: number } = {};
  querySnapshot.forEach((doc: any) => {
    const value = doc.data()[fieldName] || fallback || "";
    counts[value] = (counts[value] || 0) + 1;
  });
  return counts;
}

export async function getCallsPerLocation(startDate: Date, endDate: Date) {
  const q = buildDateRangeQuery(startDate, endDate);
  const querySnapshot = await getDocs(q);
  return countByField(querySnapshot, "location");
}

export async function getCallsPerTakenBy(startDate: Date, endDate: Date) {
  const q = buildDateRangeQuery(startDate, endDate);
  const querySnapshot = await getDocs(q);
  return countByField(querySnapshot, "takenBy", UNASSIGNED_VALUE);
}

export async function getCallsPerMachine(startDate: Date, endDate: Date) {
  const q = buildDateRangeQuery(startDate, endDate);
  const querySnapshot = await getDocs(q);
  return countByField(querySnapshot, "machine");
}
