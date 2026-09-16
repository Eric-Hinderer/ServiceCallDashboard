import { beforeEach, expect, it, vi } from "vitest";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
import {
  createServiceCall,
  subscribeToServiceCalls,
  updateServiceCall,
} from "@/lib/service-calls/repository";
import { Status } from "@/lib/service-calls/model";

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({ id: "new-id" })),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => "server-time"),
}));
const db = {} as Firestore;
const input = {
  date: new Date(),
  location: "Omaha",
  whoCalled: "Eric",
  machine: "Pinball",
  reportedProblem: "No power",
  takenBy: "Kurt",
  notes: "",
  status: Status.OPEN,
};

beforeEach(() => {
  vi.clearAllMocks();
});

it("creates a fully initialized document in one write", async () => {
  expect(await createServiceCall(db, input)).toBe("new-id");
  expect(setDoc).toHaveBeenCalledExactlyOnceWith(
    { id: "new-id" },
    {
      ...input,
      id: "new-id",
      createdAt: "server-time",
      updatedAt: "server-time",
    },
  );
  expect(updateDoc).not.toHaveBeenCalled();
});

it("propagates write failures to the caller", async () => {
  vi.mocked(setDoc).mockRejectedValueOnce(new Error("write failed"));
  await expect(createServiceCall(db, input)).rejects.toThrow("write failed");
});

it("validates patches and only stamps updatedAt", async () => {
  await updateServiceCall(db, "existing", { status: Status.DONE });
  expect(updateDoc).toHaveBeenCalledExactlyOnceWith(
    { id: "new-id" },
    { status: "DONE", updatedAt: "server-time" },
  );
  await expect(
    updateServiceCall(db, "existing", { status: "invalid" as Status }),
  ).rejects.toThrow();
  expect(updateDoc).toHaveBeenCalledTimes(1);
  expect(doc).toHaveBeenCalledWith(db, "ServiceCalls", "existing");
  expect(serverTimestamp).toHaveBeenCalled();
});

it("skips initial notifications, uses document IDs, and exposes unsubscribe", () => {
  const unsubscribe = vi.fn();
  vi.mocked(onSnapshot).mockReturnValue(unsubscribe);
  const onData = vi.fn();
  const onAdded = vi.fn();
  const onError = vi.fn();
  const stop = subscribeToServiceCalls(db, "active", onData, onError, onAdded);
  const receive = vi.mocked(onSnapshot).mock.calls[0][1] as (
    snapshot: unknown,
  ) => void;
  const record = { id: "real-id", data: () => ({ id: "", location: "Omaha" }) };
  const snapshot = {
    docs: [record],
    docChanges: () => [{ type: "added", doc: record }],
  };
  receive(snapshot);
  expect(onData.mock.calls[0][0][0].id).toBe("real-id");
  expect(onAdded).not.toHaveBeenCalled();
  receive(snapshot);
  expect(onAdded.mock.calls[0][0].id).toBe("real-id");
  stop();
  expect(unsubscribe).toHaveBeenCalledOnce();
});
