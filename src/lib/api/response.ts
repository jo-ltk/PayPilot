import { NextResponse } from "next/server";

import { AppError, toAppError } from "@/lib/api/errors";
import { createRequestLogger } from "@/lib/logger";
import { captureError } from "@/lib/monitoring/sentry";

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

/**
 * Builds a standardized success JSON response.
 * @param data - Response payload
 * @param init - Optional response init (status, headers)
 * @param meta - Optional pagination metadata
 * @returns NextResponse with success envelope
 */
export function jsonSuccess<T>(
  data: T,
  init?: ResponseInit,
  meta?: PaginationMeta,
): NextResponse<SuccessResponse<T>> {
  const body: SuccessResponse<T> = { success: true, data };
  if (meta) {
    body.meta = meta;
  }
  return NextResponse.json(body, init);
}

/**
 * Builds a standardized error JSON response.
 * @param error - Application error instance
 * @returns NextResponse with error envelope
 */
export function jsonError(error: AppError): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    },
    { status: error.statusCode },
  );
}

type RouteHandlerContext = {
  requestId: string;
  route: string;
  shopId?: string;
};

/**
 * Wraps a route handler with logging and error mapping.
 * @param context - Request context metadata
 * @param handler - Route handler function
 * @returns Wrapped handler result
 */
export async function withErrorHandling<T>(
  context: RouteHandlerContext,
  handler: () => Promise<NextResponse<T>>,
): Promise<NextResponse> {
  const start = Date.now();
  const log = createRequestLogger({
    requestId: context.requestId,
    route: context.route,
    shopId: context.shopId,
  });

  try {
    const response = await handler();
    log.info({
      durationMs: Date.now() - start,
      statusCode: response.status,
    });
    return response;
  } catch (error) {
    const appError = toAppError(error);
    if (!(error instanceof AppError) || appError.statusCode >= 500) {
      captureError(error, {
        requestId: context.requestId,
        route: context.route,
        shopId: context.shopId,
      });
    }
    log.error({
      durationMs: Date.now() - start,
      statusCode: appError.statusCode,
      err: appError,
    });
    return jsonError(appError);
  }
}
