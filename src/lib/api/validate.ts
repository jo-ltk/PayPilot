import type { ZodSchema } from "zod";

import { ValidationError } from "@/lib/api/errors";

/**
 * Parses and validates a JSON request body against a Zod schema.
 * @param request - Incoming request
 * @param schema - Zod schema describing the expected body
 * @returns Parsed, typed body
 * @throws {ValidationError} When the body is not valid JSON or fails validation
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.flatten());
  }
  return result.data;
}
