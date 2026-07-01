import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NetworkStatusBanner } from "@/components/shared/network-status-banner";

vi.mock("@/hooks/use-network-status", () => ({
  useNetworkStatus: vi.fn(),
}));

import { useNetworkStatus } from "@/hooks/use-network-status";

const mockUseNetworkStatus = vi.mocked(useNetworkStatus);

describe("NetworkStatusBanner", () => {
  it("shows offline banner when disconnected", () => {
    mockUseNetworkStatus.mockReturnValue({
      status: "offline",
      wasOffline: false,
      clearReconnect: vi.fn(),
    });

    render(<NetworkStatusBanner />);

    expect(screen.getByText("You are offline")).toBeInTheDocument();
  });

  it("shows reconnect banner after coming back online", async () => {
    const clearReconnect = vi.fn();
    mockUseNetworkStatus.mockReturnValue({
      status: "online",
      wasOffline: true,
      clearReconnect,
    });

    render(<NetworkStatusBanner />);

    expect(screen.getByText(/Back online/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(clearReconnect).toHaveBeenCalledOnce();
  });
});
