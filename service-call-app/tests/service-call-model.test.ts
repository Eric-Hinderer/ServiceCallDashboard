import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import {
  deserializeServiceCall,
  parseCreateServiceCall,
  Status,
} from "@/lib/service-calls/model";

export function validForm() {
  const form = new FormData();
  Object.entries({
    date: "2026-09-16T10:30",
    location: " Omaha ",
    whoCalled: " Eric ",
    machine: " Pinball ",
    reportedProblem: " No power ",
    status: Status.OPEN,
  }).forEach(([key, value]) => form.set(key, value));
  return form;
}

describe("service-call model", () => {
  it("uses the document ID and preserves missing legacy timestamps as null", () => {
    const call = deserializeServiceCall("real-id", {
      id: "",
      date: Timestamp.fromDate(new Date("2026-09-16T15:30:00Z")),
    });
    expect(call.id).toBe("real-id");
    expect(call.date?.toISOString()).toBe("2026-09-16T15:30:00.000Z");
    expect(call.createdAt).toBeNull();
    expect(call.updatedAt).toBeNull();
    expect(call.notes).toBe("");
  });

  it("handles pending timestamps and invalid dates without making up dates", () => {
    expect(
      deserializeServiceCall("id", {
        date: new Date("invalid"),
        updatedAt: null,
      }).date,
    ).toBeNull();
    expect(deserializeServiceCall("id", { date: "invalid" }).date).toBeNull();
  });

  it.each([
    ["2026-09-16T10:30", "2026-09-16T15:30:00.000Z"],
    ["2026-01-16T10:30", "2026-01-16T16:30:00.000Z"],
  ])(
    "parses Chicago time %s independently of the server timezone",
    (local, utc) => {
      const form = validForm();
      form.set("date", local);
      const parsed = parseCreateServiceCall(form);
      expect(parsed.date.toISOString()).toBe(utc);
      expect(parsed.location).toBe("Omaha");
      expect(parsed.takenBy).toBe("Select...");
      expect(parsed.notes).toBe("");
    },
  );

  it.each(["location", "whoCalled", "machine", "reportedProblem"])(
    "rejects a whitespace-only %s",
    (field) => {
      const form = validForm();
      form.set(field, "   ");
      expect(() => parseCreateServiceCall(form)).toThrow();
    },
  );

  it("rejects invalid dates and statuses", () => {
    const form = validForm();
    form.set("date", "not-a-date");
    expect(() => parseCreateServiceCall(form)).toThrow("valid date");
    form.set("date", "2026-09-16T10:30");
    form.set("status", "INVALID");
    expect(() => parseCreateServiceCall(form)).toThrow();
  });
});
