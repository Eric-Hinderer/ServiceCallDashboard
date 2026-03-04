import { DateTime } from "luxon";
import { Timestamp } from "firebase/firestore";
import { TIMEZONE } from "./constants";

/**
 * Converts a JS Date (assumed UTC) to Central Time.
 */
export function toCentralTime(date: Date): DateTime {
  return DateTime.fromJSDate(date, { zone: "UTC" }).setZone(TIMEZONE);
}

/**
 * Converts a Firestore Timestamp to a Central Time DateTime.
 */
export function firestampToCentralTime(timestamp: { toDate: () => Date }): DateTime {
  return toCentralTime(timestamp.toDate());
}

/**
 * Creates a Firestore date range query pair from start/end dates,
 * converting through Central Time.
 */
export function toFirestoreDateRange(
  startDate: Date,
  endDate: Date
): { startTimestamp: Timestamp; endTimestamp: Timestamp } {
  const startInCentralTime = toCentralTime(startDate);
  const endInCentralTime = toCentralTime(endDate);

  return {
    startTimestamp: Timestamp.fromDate(startInCentralTime.toJSDate()),
    endTimestamp: Timestamp.fromDate(endInCentralTime.toJSDate()),
  };
}
