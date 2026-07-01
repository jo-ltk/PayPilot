import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

import { getEnv } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

/**
 * Derives a 32-byte AES key from the configured ENCRYPTION_KEY.
 * @returns 32-byte key buffer
 * @throws {Error} When ENCRYPTION_KEY is not configured
 */
function getKey(): Buffer {
  const { ENCRYPTION_KEY } = getEnv();
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is not configured");
  }
  return createHash("sha256").update(ENCRYPTION_KEY).digest();
}

/**
 * Encrypts plaintext using AES-256-GCM with a random IV.
 * @param plaintext - Value to encrypt
 * @returns `iv:tag:ciphertext` string, each segment base64-encoded
 */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((b) => b.toString("base64")).join(":");
}

/**
 * Decrypts a value produced by {@link encrypt}.
 * @param payload - `iv:tag:ciphertext` string from {@link encrypt}
 * @returns Decrypted plaintext
 * @throws {Error} When the payload is malformed or authentication fails
 */
export function decrypt(payload: string): string {
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format");
  }
  const [iv, tag, ciphertext] = parts.map((p) => Buffer.from(p, "base64"));
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}
