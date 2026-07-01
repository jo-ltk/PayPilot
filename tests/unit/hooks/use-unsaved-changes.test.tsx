import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

describe("useUnsavedChanges", () => {
  it("registers a beforeunload listener when dirty", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(({ dirty }) => useUnsavedChanges(dirty), {
      initialProps: { dirty: true },
    });

    expect(addSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
