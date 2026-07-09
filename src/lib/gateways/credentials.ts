import { decrypt, encrypt } from "@/lib/crypto/encrypt";

/**
 * Encrypts a credentials object for at-rest storage.
 * @param credentials - Plaintext provider credentials
 * @returns AES-256-GCM encrypted JSON string
 */
export function encryptCredentials(
  credentials: Record<string, string>,
): string {
  return encrypt(JSON.stringify(credentials));
}

/**
 * Decrypts stored credentials into a plain object.
 * @param encrypted - Encrypted credentials blob from the database
 * @returns Parsed credentials object
 */
export function decryptCredentials(
  encrypted: string,
): Record<string, string> {
  const parsed: unknown = JSON.parse(decrypt(encrypted));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Invalid credentials payload");
  }
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Masks a secret, revealing only its last four characters.
 * @param value - Plaintext secret
 * @returns Masked representation, e.g. `****abcd`
 */
export function maskCredentialValue(value: string): string {
  if (value.length <= 4) {
    return "****";
  }
  return `****${value.slice(-4)}`;
}

/**
 * Masks every value in a credentials object.
 * @param credentials - Plaintext credentials
 * @returns Masked credentials with the same keys
 */
export function maskCredentialRecord(
  credentials: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(credentials).map(([key, value]) => [
      key,
      maskCredentialValue(value),
    ]),
  );
}
