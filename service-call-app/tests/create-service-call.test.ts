import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitServiceCall } from "@/app/dashboard/create/action";
import { createServiceCall } from "@/lib/service-calls/repository";
import { sendServiceCallEmail } from "@/lib/service-calls/email.server";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/firebase", () => ({ default: {} }));
vi.mock("@/lib/service-calls/repository", () => ({
  createServiceCall: vi.fn(),
}));
vi.mock("@/lib/service-calls/email.server", () => ({
  sendServiceCallEmail: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

function form(email = true) {
  const data = new FormData();
  Object.entries({
    date: "2026-09-16T10:30",
    location: "Omaha",
    whoCalled: "Eric",
    machine: "Pinball",
    reportedProblem: "No power",
    sendEmail: String(email),
  }).forEach(([key, value]) => data.set(key, value));
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(createServiceCall).mockResolvedValue("saved-id");
  vi.mocked(sendServiceCallEmail).mockResolvedValue(undefined);
});

describe("create service-call action", () => {
  it("validates before writing or emailing", async () => {
    const data = form();
    data.set("location", " ");
    expect(await submitServiceCall(data)).toEqual({
      success: false,
      message: "Location is required.",
    });
    expect(createServiceCall).not.toHaveBeenCalled();
    expect(sendServiceCallEmail).not.toHaveBeenCalled();
  });

  it("returns a save failure without sending an email", async () => {
    vi.mocked(createServiceCall).mockRejectedValue(
      new Error("permission-denied"),
    );
    expect(await submitServiceCall(form())).toMatchObject({ success: false });
    expect(sendServiceCallEmail).not.toHaveBeenCalled();
  });

  it("waits for the save before sending the email", async () => {
    let commit!: (id: string) => void;
    vi.mocked(createServiceCall).mockReturnValue(
      new Promise((resolve) => {
        commit = resolve;
      }),
    );
    const result = submitServiceCall(form());
    expect(sendServiceCallEmail).not.toHaveBeenCalled();
    commit("saved-id");
    expect(await result).toEqual({
      success: true,
      id: "saved-id",
      email: "sent",
    });
    expect(createServiceCall).toHaveBeenCalledTimes(1);
    expect(sendServiceCallEmail).toHaveBeenCalledTimes(1);
  });

  it("reports email failure as a successful save without a second write", async () => {
    vi.mocked(sendServiceCallEmail).mockRejectedValue(
      new Error("SMTP unavailable"),
    );
    expect(await submitServiceCall(form())).toEqual({
      success: true,
      id: "saved-id",
      email: "failed",
    });
    expect(createServiceCall).toHaveBeenCalledTimes(1);
  });

  it("supports saving without email", async () => {
    expect(await submitServiceCall(form(false))).toEqual({
      success: true,
      id: "saved-id",
      email: "not-requested",
    });
    expect(sendServiceCallEmail).not.toHaveBeenCalled();
  });

  it("does not report a committed write as failed when revalidation fails", async () => {
    vi.mocked(revalidatePath).mockImplementation(() => {
      throw new Error("refresh failed");
    });
    expect(await submitServiceCall(form(false))).toMatchObject({
      success: true,
    });
  });
});
