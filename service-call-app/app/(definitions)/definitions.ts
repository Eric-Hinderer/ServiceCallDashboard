

export interface ServiceCall {
  id: string;
  date: { seconds: number; nanoseconds: number };
  location: string;
  whoCalled: string;
  machine: string;
  reportedProblem: string;
  takenBy: string;
  notes: string;
  status: string;
  updatedAt: { seconds: number; nanoseconds: number };
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