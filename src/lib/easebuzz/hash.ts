import { createHash } from "crypto";

/**
 * Computes a SHA-512 hex digest over `|`-joined parts.
 *
 * Easebuzz signs every API request and webhook with a SHA-512 hash built from
 * an ordered, pipe-delimited sequence of fields wrapped by the merchant key
 * and salt.
 * @param parts - Ordered values forming the hash sequence
 * @returns Lowercase hex SHA-512 digest
 */
export function sha512Hex(parts: string[]): string {
  return createHash("sha512").update(parts.join("|")).digest("hex");
}

/**
 * Builds the request hash for the Easebuzz Transaction Date API.
 *
 * Hash sequence: `key|merchant_email|transaction_date|salt`.
 * @param key - Merchant key
 * @param merchantEmail - Registered merchant email
 * @param transactionDate - Date string in `DD-MM-YYYY`
 * @param salt - Merchant salt (never sent in the request)
 * @returns SHA-512 request hash
 */
export function transactionDateHash(
  key: string,
  merchantEmail: string,
  transactionDate: string,
  salt: string,
): string {
  return sha512Hex([key, merchantEmail, transactionDate, salt]);
}
