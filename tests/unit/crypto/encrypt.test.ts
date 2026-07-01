import { describe, expect, it } from "vitest";

import { decrypt, encrypt } from "@/lib/crypto/encrypt";

describe("encrypt/decrypt", () => {
  it("round-trips a secret value", () => {
    const secret = "shpat_offline_access_token_123";
    const ciphertext = encrypt(secret);

    expect(ciphertext).not.toBe(secret);
    expect(decrypt(ciphertext)).toBe(secret);
  });

  it("produces a different ciphertext each call (random IV)", () => {
    expect(encrypt("same-value")).not.toBe(encrypt("same-value"));
  });

  it("throws on a malformed payload", () => {
    expect(() => decrypt("not-a-valid-payload")).toThrow();
  });

  it("throws when the auth tag is tampered with", () => {
    const [iv, , ciphertext] = encrypt("tamper-me").split(":");
    const forgedTag = Buffer.alloc(16).toString("base64");
    expect(() => decrypt(`${iv}:${forgedTag}:${ciphertext}`)).toThrow();
  });
});
