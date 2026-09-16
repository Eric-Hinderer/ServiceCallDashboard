import { DateTime } from "luxon";
import { z } from "zod";

export enum Status {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface ServiceCall {
  id: string;
  date: Date | null;
  location: string;
  whoCalled: string;
  machine: string;
  reportedProblem: string;
  takenBy: string;
  notes: string;
  status: string;
  updatedAt: Date | null;
  createdAt: Date | null;
  overDue: boolean;
}

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

export const serviceCallFieldsSchema = z.object({
  location: requiredText("Location"),
  whoCalled: requiredText("Who Called"),
  machine: requiredText("Machine"),
  reportedProblem: requiredText("Reported Problem"),
  takenBy: z.string().trim(),
  notes: z.string().trim(),
  status: z.nativeEnum(Status),
});

export const createServiceCallSchema = serviceCallFieldsSchema.extend({
  date: z.date(),
});
export const serviceCallPatchSchema = serviceCallFieldsSchema
  .partial()
  .strict();
export type CreateServiceCallInput = z.infer<typeof createServiceCallSchema>;
export type ServiceCallPatch = z.infer<typeof serviceCallPatchSchema>;

export type CreateServiceCallResult =
  | { success: false; message: string }
  | { success: true; id: string; email: "not-requested" | "sent" | "failed" };

export function parseServiceCallFields(formData: FormData) {
  return serviceCallFieldsSchema.parse({
    location: formData.get("location"),
    whoCalled: formData.get("whoCalled"),
    machine: formData.get("machine"),
    reportedProblem: formData.get("reportedProblem"),
    takenBy: formData.get("takenBy") ?? "Select...",
    notes: formData.get("notes") ?? "",
    status: formData.get("status") || Status.OPEN,
  });
}

export function parseCreateServiceCall(
  formData: FormData,
): CreateServiceCallInput {
  const fields = parseServiceCallFields(formData);
  const dateString = formData.get("date");
  const date =
    typeof dateString === "string"
      ? DateTime.fromISO(dateString, { zone: "America/Chicago" })
      : null;
  if (!date?.isValid) throw new Error("Enter a valid date and time.");
  return { ...fields, date: date.toJSDate() };
}

function toDate(value: unknown): Date | null {
  let date: unknown = value;
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    date = value.toDate();
  }
  return date instanceof Date && Number.isFinite(date.getTime()) ? date : null;
}

const text = (value: unknown) => (typeof value === "string" ? value : "");

// The document ID is authoritative, including for legacy records with an empty id field.
export function deserializeServiceCall(
  id: string,
  data: Record<string, unknown>,
): ServiceCall {
  return {
    id,
    date: toDate(data.date),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    location: text(data.location),
    whoCalled: text(data.whoCalled),
    machine: text(data.machine),
    reportedProblem: text(data.reportedProblem),
    takenBy: text(data.takenBy),
    notes: text(data.notes),
    status: text(data.status),
    overDue: data.overDue === true,
  };
}
