import { Timestamp } from "@firebase/firestore";


export interface ServiceCall {
  id: string;
  date: Timestamp;
  location: string;
  whoCalled: string;
  machine: string;
  reportedProblem: string;
  takenBy: string;
  notes: string;
  status: string;
  updatedAt: Timestamp;
}

export const dayNames: { [key: number]: string } = {
  2: "Monday",
  3: "Tuesday",
  4: "Wednesday",
  5: "Thursday",
  6: "Friday",
};

export enum Status {
  Open = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  CLOSED = "CLOSED",
}