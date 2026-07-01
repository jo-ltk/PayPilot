import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

/**
 * Hashes a plaintext password using bcrypt (cost 12).
 * @param plain - Plaintext password
 * @returns bcrypt hash
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 * @param plain - Plaintext password
 * @param hash - Stored bcrypt hash
 * @returns Whether the password matches; false for empty hashes
 */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  if (!hash) {
    return false;
  }
  return bcrypt.compare(plain, hash);
}
