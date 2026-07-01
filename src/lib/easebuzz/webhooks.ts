import { timingSafeEqual } from "crypto";

import { sha512Hex } from "@/lib/easebuzz/hash";

/** Discriminates the three Easebuzz webhook channels. */
export type EasebuzzWebhookKind = "transaction" | "payout" | "refund";

/** Flat string map parsed from a form-urlencoded webhook body. */
export type EasebuzzWebhookPayload = Record<string, string>;

/**
 * Parses an `application/x-www-form-urlencoded` body into a flat string map.
 * @param rawBody - Exact raw request body as received
 * @returns Decoded field/value pairs
 */
export function parseFormBody(rawBody: string): EasebuzzWebhookPayload {
  const params = new URLSearchParams(rawBody);
  const result: EasebuzzWebhookPayload = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

/**
 * Reads a payload field, defaulting missing values to an empty string.
 * @param payload - Parsed webhook payload
 * @param name - Field name to read
 * @returns Field value or empty string
 */
function field(payload: EasebuzzWebhookPayload, name: string): string {
  return payload[name] ?? "";
}

/**
 * Builds the SHA-512 hash sequence for the transaction reverse hash.
 *
 * Sequence: `salt|status|udf10..udf1|email|firstname|productinfo|amount|txnid|key`
 * (Easebuzz/PayU reverse-hash convention).
 * @param payload - Parsed transaction payload
 * @param salt - Merchant salt
 * @returns Ordered hash parts
 */
function transactionSequence(
  payload: EasebuzzWebhookPayload,
  salt: string,
): string[] {
  const udf = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) =>
    field(payload, `udf${n}`),
  );
  return [
    salt,
    field(payload, "status"),
    ...udf,
    field(payload, "email"),
    field(payload, "firstname"),
    field(payload, "productinfo"),
    field(payload, "amount"),
    field(payload, "txnid"),
    field(payload, "key"),
  ];
}

/**
 * Builds the hash sequence for a payout/settlement webhook.
 * TODO(easebuzz-sandbox): Confirm the exact sequence against live Easebuzz docs.
 * @param payload - Parsed payout payload
 * @param salt - Merchant salt
 * @returns Ordered hash parts
 */
function payoutSequence(
  payload: EasebuzzWebhookPayload,
  salt: string,
): string[] {
  return [
    salt,
    field(payload, "status"),
    field(payload, "payout_amount"),
    field(payload, "payout_id"),
    field(payload, "key"),
  ];
}

/**
 * Builds the hash sequence for a refund webhook.
 * TODO(easebuzz-sandbox): Confirm the exact sequence against live Easebuzz docs.
 * @param payload - Parsed refund payload
 * @param salt - Merchant salt
 * @returns Ordered hash parts
 */
function refundSequence(
  payload: EasebuzzWebhookPayload,
  salt: string,
): string[] {
  return [
    salt,
    field(payload, "refund_status"),
    field(payload, "refund_amount"),
    field(payload, "refund_id"),
    field(payload, "txnid"),
    field(payload, "key"),
  ];
}

/**
 * Resolves the hash sequence builder for a webhook kind.
 * @param kind - Webhook channel
 * @returns Sequence builder function
 */
function sequenceFor(
  kind: EasebuzzWebhookKind,
): (payload: EasebuzzWebhookPayload, salt: string) => string[] {
  switch (kind) {
    case "transaction":
      return transactionSequence;
    case "payout":
      return payoutSequence;
    case "refund":
      return refundSequence;
  }
}

/**
 * Computes the expected Easebuzz webhook hash for a payload.
 * @param kind - Webhook channel
 * @param payload - Parsed webhook payload
 * @param salt - Merchant salt
 * @returns Lowercase hex SHA-512 hash
 */
export function computeEasebuzzHash(
  kind: EasebuzzWebhookKind,
  payload: EasebuzzWebhookPayload,
  salt: string,
): string {
  return sha512Hex(sequenceFor(kind)(payload, salt));
}

/**
 * Constant-time comparison of two hex-encoded digests.
 * @param expected - Expected hex digest
 * @param provided - Provided hex digest
 * @returns Whether the digests match
 */
function safeEqualHex(expected: string, provided: string): boolean {
  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");
  if (expectedBuf.length === 0 || expectedBuf.length !== providedBuf.length) {
    return false;
  }
  return timingSafeEqual(expectedBuf, providedBuf);
}

/**
 * Verifies an Easebuzz webhook hash against the merchant salt.
 * @param kind - Webhook channel
 * @param payload - Parsed webhook payload (including `hash`)
 * @param salt - Merchant salt
 * @returns Whether the provided hash is valid
 */
export function verifyEasebuzzHash(
  kind: EasebuzzWebhookKind,
  payload: EasebuzzWebhookPayload,
  salt: string,
): boolean {
  const provided = field(payload, "hash").toLowerCase();
  if (!provided) {
    return false;
  }
  return safeEqualHex(computeEasebuzzHash(kind, payload, salt), provided);
}

/**
 * Builds the idempotency key for a persisted Easebuzz webhook event.
 * @param kind - Webhook channel
 * @param payload - Parsed webhook payload
 * @returns Unique idempotency key
 */
export function easebuzzIdempotencyKey(
  kind: EasebuzzWebhookKind,
  payload: EasebuzzWebhookPayload,
): string {
  switch (kind) {
    case "transaction":
      return `easebuzz:txn:${field(payload, "txnid")}:${field(payload, "status")}`;
    case "payout":
      return `easebuzz:payout:${field(payload, "payout_id")}`;
    case "refund":
      return `easebuzz:refund:${field(payload, "refund_id")}:${field(payload, "refund_status")}`;
  }
}
