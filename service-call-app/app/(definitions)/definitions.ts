import { Status } from "@prisma/client";

export interface ServiceCall {
  date?: Date;
  location?: string;
  whoCalled?: string;
  machine?: string;
  reportedProblem?: string;
  takenBy?: string;
  status: Status;
  notes?: string;
}

export const dayNames: { [key: number]: string } = {
  2: "Monday",
  3: "Tuesday",
  4: "Wednesday",
  5: "Thursday",
  6: "Friday",
};