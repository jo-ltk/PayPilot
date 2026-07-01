/**
 * Base application error with HTTP status code.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/** Validation error (400). */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

/** Authentication error (401). */
export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "AUTH_ERROR");
  }
}

/** Forbidden error (403). */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

/** Rate limit exceeded (429). */
export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429, "RATE_LIMITED");
  }
}

/** Not found error (404). */
export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404, "NOT_FOUND");
  }
}

/** Webhook verification error (401). */
export class WebhookVerificationError extends AppError {
  constructor(message = "Webhook verification failed") {
    super(message, 401, "WEBHOOK_VERIFICATION_FAILED");
  }
}

/** External API error (502). */
export class ExternalAPIError extends AppError {
  constructor(provider: string, message: string, details?: unknown) {
    super(`${provider}: ${message}`, 502, "EXTERNAL_API_ERROR", details);
  }
}

/** Reconciliation error (422). */
export class ReconciliationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, "RECONCILIATION_ERROR", details);
  }
}

/**
 * Maps unknown errors to AppError instances.
 * @param error - Caught error value
 * @returns Normalized AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500, "INTERNAL_ERROR");
  }

  return new AppError("An unexpected error occurred", 500, "INTERNAL_ERROR");
}
