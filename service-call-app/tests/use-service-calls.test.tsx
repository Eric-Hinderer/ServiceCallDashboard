// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useServiceCalls } from "@/lib/service-calls/useServiceCalls";
import { subscribeToServiceCalls } from "@/lib/service-calls/repository";
import { deserializeServiceCall } from "@/lib/service-calls/model";

vi.mock("@/lib/firebase", () => ({ default: {} }));
vi.mock("@/lib/service-calls/repository", () => ({
  subscribeToServiceCalls: vi.fn(),
}));
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
});

it("does not subscribe while signed out, clears old data, and ignores stale callbacks", () => {
  const stop = vi.fn();
  vi.mocked(subscribeToServiceCalls).mockReturnValue(stop);
  const { result, rerender, unmount } = renderHook(
    ({ uid }: { uid: string | null }) => useServiceCalls("active", uid),
    { initialProps: { uid: null } as { uid: string | null } },
  );
  expect(subscribeToServiceCalls).not.toHaveBeenCalled();
  rerender({ uid: "first" });
  const receiveFirst = vi.mocked(subscribeToServiceCalls).mock.calls[0][2];
  act(() => receiveFirst([deserializeServiceCall("first-call", {})]));
  expect(result.current.calls[0].id).toBe("first-call");
  rerender({ uid: "second" });
  expect(stop).toHaveBeenCalledOnce();
  expect(result.current.calls).toEqual([]);
  act(() => receiveFirst([deserializeServiceCall("stale-call", {})]));
  expect(result.current.calls).toEqual([]);
  const receiveSecond = vi.mocked(subscribeToServiceCalls).mock.calls[1][2];
  act(() => receiveSecond([deserializeServiceCall("second-call", {})]));
  expect(result.current.calls[0].id).toBe("second-call");
  rerender({ uid: null });
  expect(result.current.calls).toEqual([]);
  expect(stop).toHaveBeenCalledTimes(2);
  unmount();
});

it("surfaces subscription failures instead of claiming there are no calls", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(subscribeToServiceCalls).mockReturnValue(vi.fn());
  const { result } = renderHook(() => useServiceCalls("all", "user"));
  act(() =>
    vi
      .mocked(subscribeToServiceCalls)
      .mock.calls[0][3](new Error("permission-denied")),
  );
  expect(result.current.error).toBe("Couldn't load service calls.");
  expect(result.current.loading).toBe(false);
});
