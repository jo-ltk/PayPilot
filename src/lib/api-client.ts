import { parseApiResponse } from "@/lib/api/envelope";
import type { PaginationMeta } from "@/lib/api/response";

/** Query parameters shared by paginated list endpoints. */
export type ListParams = {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

/** Options for authenticated API requests. */
export type ApiClientOptions = {
  bearerToken?: string;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
};

/** Paginated list response from the API envelope. */
export type ListResult<T> = {
  data: T[];
  meta: PaginationMeta;
};

/** Typed error thrown when the API returns a failure envelope. */
export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

function buildHeaders(options?: ApiClientOptions): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.bearerToken) {
    headers.Authorization = `Bearer ${options.bearerToken}`;
  }

  return headers;
}

function buildQueryString(
  params?: Record<string, string | number | undefined>,
): string {
  if (!params) {
    return "";
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function parseListResponse<T>(response: Response): Promise<ListResult<T>> {
  const body = (await response.json()) as {
    success: boolean;
    data?: T[];
    meta?: PaginationMeta;
    error?: { code: string; message: string };
  };

  if (!body.success || !body.data || !body.meta) {
    const message = body.error?.message ?? "Request failed";
    const code = body.error?.code ?? "API_ERROR";
    throw new ApiClientError(message, code, response.status);
  }

  return { data: body.data, meta: body.meta };
}

function requestInit(
  method: string,
  options?: ApiClientOptions,
  body?: unknown,
): RequestInit {
  return {
    method,
    headers: buildHeaders(options),
    credentials: options?.credentials ?? "include",
    signal: options?.signal,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };
}

/**
 * Performs a GET request against a shop-scoped API path.
 * @param path - Path after `/api` (e.g. `/shops/s1/payments`)
 * @param options - Auth and fetch options
 * @returns Parsed response data
 */
export async function apiGet<T>(
  path: string,
  options?: ApiClientOptions,
): Promise<T> {
  const response = await fetch(`/api${path}`, requestInit("GET", options));
  return parseApiResponse<T>(response);
}

/**
 * Performs a GET request for a paginated list endpoint.
 * @param path - Path after `/api`
 * @param params - List query parameters
 * @param options - Auth and fetch options
 * @returns Paginated data and metadata
 */
export async function apiGetList<T>(
  path: string,
  params?: ListParams,
  options?: ApiClientOptions,
): Promise<ListResult<T>> {
  const query = buildQueryString(params);
  const response = await fetch(
    `/api${path}${query}`,
    requestInit("GET", options),
  );
  return parseListResponse<T>(response);
}

/**
 * Performs a POST request against an API path.
 * @param path - Path after `/api`
 * @param body - JSON request body
 * @param options - Auth and fetch options
 * @returns Parsed response data
 */
export async function apiPost<T>(
  path: string,
  body: unknown,
  options?: ApiClientOptions,
): Promise<T> {
  const response = await fetch(
    `/api${path}`,
    requestInit("POST", options, body),
  );
  return parseApiResponse<T>(response);
}

/**
 * Performs a PATCH request against an API path.
 * @param path - Path after `/api`
 * @param body - JSON request body
 * @param options - Auth and fetch options
 * @returns Parsed response data
 */
export async function apiPatch<T>(
  path: string,
  body: unknown,
  options?: ApiClientOptions,
): Promise<T> {
  const response = await fetch(
    `/api${path}`,
    requestInit("PATCH", options, body),
  );
  return parseApiResponse<T>(response);
}

/**
 * Performs a DELETE request against an API path.
 * @param path - Path after `/api`
 * @param options - Auth and fetch options
 * @returns Parsed response data
 */
export async function apiDelete<T>(
  path: string,
  options?: ApiClientOptions,
): Promise<T> {
  const response = await fetch(`/api${path}`, requestInit("DELETE", options));
  return parseApiResponse<T>(response);
}
