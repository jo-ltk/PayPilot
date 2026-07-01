import { GatewayEnvironment } from "@prisma/client";

import { ExternalAPIError } from "@/lib/api/errors";
import { transactionDateHash } from "@/lib/easebuzz/hash";
import type {
  CredentialValidationResult,
  EasebuzzApiResponse,
  EasebuzzCredentials,
} from "@/lib/easebuzz/types";

/** Base URLs per Easebuzz environment. */
const BASE_URLS: Record<GatewayEnvironment, string> = {
  [GatewayEnvironment.SANDBOX]: "https://testpay.easebuzz.in",
  [GatewayEnvironment.PRODUCTION]: "https://pay.easebuzz.in",
};

/**
 * Transaction Date API path (retrieve transactions for a single date).
 * TODO(easebuzz-sandbox): Verify this path + response shape against the live
 * Easebuzz dashboard/docs once a sandbox account is available. Implemented from
 * convention (testpay/pay hosts, DD-MM-YYYY, SHA-512 hash) and not yet confirmed.
 */
const TRANSACTION_DATE_PATH = "transaction/v1/retrieve/date";

/**
 * Formats a date as Easebuzz expects (`DD-MM-YYYY`).
 * @param date - Date to format
 * @returns `DD-MM-YYYY` string
 */
function formatDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getUTCFullYear()}`;
}

/**
 * Resolves whether an Easebuzz response indicates success.
 * @param body - Parsed response body
 * @returns Whether `status` denotes success
 */
function isSuccess(body: EasebuzzApiResponse): boolean {
  return body.status === 1 || body.status === true;
}

/**
 * Calls the Easebuzz Transaction Date API for the given credentials.
 *
 * Sends a `x-www-form-urlencoded` POST signed with a SHA-512 request hash.
 * @param credentials - Decrypted merchant credentials
 * @param transactionDate - Date string in `DD-MM-YYYY`
 * @returns Parsed Easebuzz response body
 * @throws {ExternalAPIError} On transport failures or non-2xx responses
 */
export async function fetchTransactionsByDate(
  credentials: EasebuzzCredentials,
  transactionDate: string,
): Promise<EasebuzzApiResponse> {
  const { key, salt, merchantEmail, environment } = credentials;
  const hash = transactionDateHash(key, merchantEmail, transactionDate, salt);
  const body = new URLSearchParams({
    key,
    merchant_email: merchantEmail,
    transaction_date: transactionDate,
    hash,
  });

  let response: Response;
  try {
    response = await fetch(`${BASE_URLS[environment]}/${TRANSACTION_DATE_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    throw new ExternalAPIError("Easebuzz", message);
  }

  if (!response.ok) {
    throw new ExternalAPIError("Easebuzz", `Transaction API ${response.status}`);
  }

  return (await response.json()) as EasebuzzApiResponse;
}

/**
 * Validates merchant credentials against the Easebuzz API.
 *
 * Issues a Transaction Date API call for the previous day; valid credentials
 * return a success status, invalid credentials return a failure status with a
 * descriptive message rather than throwing.
 * @param credentials - Decrypted merchant credentials
 * @returns Validation result with an optional failure message
 * @throws {ExternalAPIError} On transport or non-2xx failures
 */
export async function validateCredentials(
  credentials: EasebuzzCredentials,
): Promise<CredentialValidationResult> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const body = await fetchTransactionsByDate(credentials, formatDate(yesterday));

  if (isSuccess(body)) {
    return { valid: true };
  }

  return {
    valid: false,
    message: body.error_desc ?? body.error ?? body.message ?? "Invalid credentials",
  };
}
