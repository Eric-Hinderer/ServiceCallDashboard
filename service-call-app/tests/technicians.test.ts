import { describe, expect, it } from "vitest";
import {
  DEFAULT_TECHNICIANS,
  normalizeTechnicianNames,
} from "@/lib/technicians";

describe("technicians", () => {
  it("includes Jesse and Mark K in the defaults", () => {
    expect(DEFAULT_TECHNICIANS).toEqual(
      expect.arrayContaining(["Jesse", "Mark K"])
    );
  });

  it("falls back to defaults when the doc is missing or empty", () => {
    expect(normalizeTechnicianNames(undefined)).toBe(DEFAULT_TECHNICIANS);
    expect(normalizeTechnicianNames({ names: "Kurt" })).toBe(DEFAULT_TECHNICIANS);
    expect(normalizeTechnicianNames({ names: [" ", 3] })).toBe(DEFAULT_TECHNICIANS);
  });

  it("trims, dedupes, and drops the placeholder", () => {
    expect(
      normalizeTechnicianNames({ names: [" Kurt ", "Kurt", "Select...", "Jesse"] })
    ).toEqual(["Kurt", "Jesse"]);
  });
});
