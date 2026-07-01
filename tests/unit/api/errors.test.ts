import { describe, expect, it } from "vitest";

import {
  AppError,
  AuthError,
  NotFoundError,
  RateLimitError,
  toAppError,
  ValidationError,
} from "@/lib/api/errors";

describe("AppError hierarchy", () => {
  it("maps ValidationError to 400", () => {
    const error = new ValidationError("Invalid input");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it("maps AuthError to 401", () => {
    const error = new AuthError();
    expect(error.statusCode).toBe(401);
  });

  it("maps NotFoundError to 404", () => {
    const error = new NotFoundError("Shop not found");
    expect(error.statusCode).toBe(404);
  });

  it("maps RateLimitError to 429", () => {
    const error = new RateLimitError();
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe("RATE_LIMITED");
  });

  it("normalizes unknown errors", () => {
    const error = toAppError(new Error("boom"));
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(500);
  });
});
