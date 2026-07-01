import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useNetworkStatus } from "@/hooks/use-network-status";

describe("useNetworkStatus", () => {
  it("tracks offline and reconnect state", () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.status).toBe("online");

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.status).toBe("offline");
    expect(result.current.wasOffline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.status).toBe("online");
    expect(result.current.wasOffline).toBe(true);

    act(() => {
      result.current.clearReconnect();
    });

    expect(result.current.wasOffline).toBe(false);
  });
});
