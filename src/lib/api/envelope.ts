/** Standard API success envelope returned by backend routes. */
export type ApiSuccess<T> = {
  success: true;
  data: T;
};

/** Standard API error envelope returned by backend routes. */
export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError;

/**
 * Parses a JSON API response and returns typed data or throws a readable error.
 * @param response - Fetch response from a backend route
 * @returns Parsed success payload
 */
export async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiEnvelope<T>;

  if (!body.success) {
    throw new Error(body.error.message);
  }

  return body.data;
}
