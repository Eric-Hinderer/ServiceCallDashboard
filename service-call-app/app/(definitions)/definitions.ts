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