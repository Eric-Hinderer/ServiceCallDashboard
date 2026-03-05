export enum Status {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface ServiceCall {
  id: string;
  date: Date;
  location: string;
  whoCalled: string;
  machine: string;
  reportedProblem: string;
  takenBy: string;
  notes: string;
  status: Status;
  updatedAt: Date;
  createdAt?: Date;
  overDue?: boolean;
}

export const dayNames: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};
