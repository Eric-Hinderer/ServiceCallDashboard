"use server";

import db from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { getDay, getHours } from "date-fns";

import { ServiceCall } from "../(definitions)/definitions";

const CENTRAL_TZ = "America/Chicago";

interface CallsByDay {
  callCount: number;
  serviceCalls: ServiceCall[];
}

export async function getWeekendServiceCalls(startDate: Date, endDate: Date) {
  const serviceCallsRef = collection(db, "ServiceCalls");

  const q = query(
    serviceCallsRef,
    where("date", ">=", Timestamp.fromDate(fromZonedTime(startDate, CENTRAL_TZ))),
    where("date", "<=", Timestamp.fromDate(fromZonedTime(endDate, CENTRAL_TZ)))
  );

  const querySnapshot = await getDocs(q);

  const weekendServiceCalls = querySnapshot.docs
    .map((doc) => {
      const data = doc.data();
      const utcDate = data.date.toDate();

      return {
        ...data,
        date: toZonedTime(utcDate, CENTRAL_TZ),
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
        id: doc.id,
      } as ServiceCall;
    })
    .filter((serviceCall) => {
      const day = getDay(serviceCall.date); // 0=Sunday, 6=Saturday
      return day === 0 || day === 6;
    });

  return {
    count: weekendServiceCalls.length,
    serviceCalls: weekendServiceCalls,
  };
}

export async function getAfterHoursCallsByDayOfWeek(
  startDate: Date,
  endDate: Date
): Promise<{ dayOfWeek: number; callCount: number; serviceCalls: ServiceCall[] }[]> {
  const serviceCallsRef = collection(db, "ServiceCalls");

  const q = query(
    serviceCallsRef,
    where("date", ">=", Timestamp.fromDate(fromZonedTime(startDate, CENTRAL_TZ))),
    where("date", "<=", Timestamp.fromDate(fromZonedTime(endDate, CENTRAL_TZ)))
  );

  const querySnapshot = await getDocs(q);

  const callsByDayOfWeek: { [key: string]: CallsByDay } = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const localDate = toZonedTime(data.date.toDate(), CENTRAL_TZ);

    const hourOfDay = getHours(localDate);
    const dayOfWeek = getDay(localDate); // 0=Sunday, 6=Saturday

    const afterHoursStart = 17;
    const afterHoursEnd = 8;

    // Weekdays only (Mon=1 through Fri=5)
    if (
      (hourOfDay >= afterHoursStart || hourOfDay < afterHoursEnd) &&
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
        date: localDate,
        createdAt: data.createdAt?.toDate() ?? null,
        updatedAt: data.updatedAt?.toDate() ?? null,
      } as ServiceCall);
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

export async function getCallsPerLocation(startDate: Date, endDate: Date) {
  const serviceCallsRef = collection(db, "ServiceCalls");
  const q = query(
    serviceCallsRef,
    where("date", ">=", Timestamp.fromDate(fromZonedTime(startDate, CENTRAL_TZ))),
    where("date", "<=", Timestamp.fromDate(fromZonedTime(endDate, CENTRAL_TZ)))
  );

  const querySnapshot = await getDocs(q);

  const callsPerLocation: { [key: string]: number } = {};
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const location = data.location;

    if (!callsPerLocation[location]) {
      callsPerLocation[location] = 0;
    }
    callsPerLocation[location] += 1;
  });

  return callsPerLocation;
}

export async function getCallsPerTakenBy(startDate: Date, endDate: Date) {
  const serviceCallsRef = collection(db, "ServiceCalls");
  const q = query(
    serviceCallsRef,
    where("date", ">=", Timestamp.fromDate(fromZonedTime(startDate, CENTRAL_TZ))),
    where("date", "<=", Timestamp.fromDate(fromZonedTime(endDate, CENTRAL_TZ)))
  );

  const querySnapshot = await getDocs(q);

  const callsPerTakenBy: { [key: string]: number } = {};
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    let takenBy = data.takenBy;
    if (!takenBy) {
      takenBy = "Select...";
    }

    if (!callsPerTakenBy[takenBy]) {
      callsPerTakenBy[takenBy] = 0;
    }
    callsPerTakenBy[takenBy] += 1;
  });
  return callsPerTakenBy;
}

export async function getCallsPerMachine(startDate: Date, endDate: Date) {
  const serviceCallsRef = collection(db, "ServiceCalls");
  const q = query(
    serviceCallsRef,
    where("date", ">=", Timestamp.fromDate(fromZonedTime(startDate, CENTRAL_TZ))),
    where("date", "<=", Timestamp.fromDate(fromZonedTime(endDate, CENTRAL_TZ)))
  );

  const querySnapshot = await getDocs(q);

  const callsPerMachine: { [key: string]: number } = {};
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const machine = data.machine;

    if (!callsPerMachine[machine]) {
      callsPerMachine[machine] = 0;
    }
    callsPerMachine[machine] += 1;
  });

  return callsPerMachine;
 
}
