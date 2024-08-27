export interface ServiceCall {
  id: string;
  date: Date;
  location: string;
  whoCalled: string;
  machine: string;
  reportedProblem: string;
  takenBy: string;
  notes: string;
  status: string;
  updatedAt: Date;
  createdAt?: Date;
}

export const dayNames: { [key: number]: string } = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
};

export enum Status {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  CLOSED = "CLOSED",
}
