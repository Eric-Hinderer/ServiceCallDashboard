// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateServiceCall from "@/components/CreateServiceCall";
import EditServiceCallForm from "@/components/EditServiceCallForm";
import { submitServiceCall } from "@/app/dashboard/create/action";
import type { CreateServiceCallResult } from "@/lib/service-calls/model";
import toast from "react-hot-toast";

const { refresh, push } = vi.hoisted(() => ({
  refresh: vi.fn(),
  push: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push, back: vi.fn() }),
}));
vi.mock("@/app/dashboard/create/action", () => ({
  submitServiceCall: vi.fn(),
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
});

async function createForm() {
  const close = vi.fn();
  const user = userEvent.setup();
  render(
    <CreateServiceCall locations={[]} machines={[]} closeModalAction={close} />,
  );
  await user.type(screen.getByLabelText("Location"), "Omaha");
  await user.type(screen.getByLabelText("Who Called"), "Eric");
  await user.type(screen.getByLabelText("Machine/Equipment"), "Pinball");
  await user.type(screen.getByLabelText("Reported Problem"), "No power");
  return { close, user };
}

it("preserves the form and shows a failed-save message", async () => {
  vi.mocked(submitServiceCall).mockResolvedValue({
    success: false,
    message: "Save failed. Please try again.",
  });
  const { close, user } = await createForm();
  await user.click(
    screen.getByRole("button", { name: "Create Service Call (No Email)" }),
  );
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Save failed",
  );
  expect((screen.getByLabelText("Location") as HTMLInputElement).value).toBe(
    "Omaha",
  );
  expect(close).not.toHaveBeenCalled();
  expect(refresh).not.toHaveBeenCalled();
  expect(vi.mocked(submitServiceCall).mock.calls[0][0].get("sendEmail")).toBe(
    "false",
  );
});

it("uses native validation before attempting a save", async () => {
  const user = userEvent.setup();
  render(
    <CreateServiceCall
      locations={[]}
      machines={[]}
      closeModalAction={vi.fn()}
    />,
  );
  await user.click(
    screen.getByRole("button", { name: "Create Service Call (No Email)" }),
  );
  expect(submitServiceCall).not.toHaveBeenCalled();
});

it("shares pending state across buttons and guards duplicate submissions", async () => {
  let finish!: (result: CreateServiceCallResult) => void;
  vi.mocked(submitServiceCall).mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const { user } = await createForm();
  await user.click(
    screen.getByRole("button", { name: "Create Service Call & Send Email" }),
  );
  const buttons = screen.getAllByRole("button", {
    name: "Saving...",
  }) as HTMLButtonElement[];
  expect(buttons).toHaveLength(2);
  expect(buttons.every((button) => button.disabled)).toBe(true);
  fireEvent.submit(buttons[0].closest("form")!);
  expect(submitServiceCall).toHaveBeenCalledTimes(1);
  expect(vi.mocked(submitServiceCall).mock.calls[0][0].get("sendEmail")).toBe(
    "true",
  );
  finish({ success: true, id: "id", email: "sent" });
  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
});

it("closes after a committed save and clearly warns when email fails", async () => {
  vi.mocked(submitServiceCall).mockResolvedValue({
    success: true,
    id: "id",
    email: "failed",
  });
  const { close, user } = await createForm();
  await user.click(
    screen.getByRole("button", { name: "Create Service Call & Send Email" }),
  );
  expect(close).toHaveBeenCalledOnce();
  expect(toast.error).toHaveBeenCalledWith(
    expect.stringContaining("Service call saved"),
    expect.any(Object),
  );
  expect(submitServiceCall).toHaveBeenCalledTimes(1);
});

it("preserves input after a transport failure and warns about uncertain saves", async () => {
  vi.mocked(submitServiceCall).mockRejectedValue(
    new Error("network disconnected"),
  );
  const { close, user } = await createForm();
  await user.click(
    screen.getByRole("button", { name: "Create Service Call (No Email)" }),
  );
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Check the dashboard before retrying",
  );
  expect((screen.getByLabelText("Location") as HTMLInputElement).value).toBe(
    "Omaha",
  );
  expect(close).not.toHaveBeenCalled();
});

it("preserves edited fields on failure and navigates only after success", async () => {
  const saveAction = vi
    .fn()
    .mockResolvedValueOnce({ success: false, message: "Update failed" })
    .mockResolvedValueOnce({ success: true });
  const user = userEvent.setup();
  render(
    <EditServiceCallForm saveAction={saveAction} returnTo="/technician">
      <label>
        Notes
        <input name="notes" defaultValue="Initial" />
      </label>
    </EditServiceCallForm>,
  );
  await user.type(screen.getByLabelText("Notes"), " edited");
  await user.click(screen.getByRole("button", { name: "Save Changes" }));
  expect((await screen.findByRole("alert")).textContent).toBe("Update failed");
  expect((screen.getByLabelText("Notes") as HTMLInputElement).value).toBe(
    "Initial edited",
  );
  expect(push).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Save Changes" }));
  expect(push).toHaveBeenCalledExactlyOnceWith("/technician");
});
