import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { InviteForm } from "@/components/auth/invite-form";

import { server } from "../../../setup/msw-server";

const replace = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
    refresh,
  }),
}));

describe("InviteForm", () => {
  it("submits invite acceptance and redirects to the shop", async () => {
    server.use(
      http.post("/api/auth/invite/accept", () =>
        HttpResponse.json({
          success: true,
          data: {
            userId: "u1",
            email: "new@example.com",
            shops: [{ shopId: "shop-1", role: "VIEWER" }],
          },
        }),
      ),
    );

    const user = userEvent.setup();
    render(<InviteForm token="invite-token" />);

    await user.type(screen.getByLabelText(/full name/i), "New User");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /accept invitation/i }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/shops/shop-1");
    });
  });

  it("validates matching passwords client-side", async () => {
    const user = userEvent.setup();
    render(<InviteForm token="invite-token" />);

    await user.type(screen.getByLabelText(/full name/i), "New User");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "different");
    await user.click(screen.getByRole("button", { name: /accept invitation/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
  });
});
