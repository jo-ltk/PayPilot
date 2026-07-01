import { z } from "zod";

/** Optional form-field string (Easebuzz posts everything as strings). */
const optionalField = z.string().optional();

/**
 * Easebuzz transaction webhook payload (PayU-style response fields).
 *
 * Posted as `application/x-www-form-urlencoded`. Unknown fields are preserved
 * via passthrough so the raw payload is retained on the stored record.
 * TODO(easebuzz-sandbox): Confirm exact field names (e.g. fees field) against
 * the live Easebuzz dashboard once a sandbox account is available.
 */
export const easebuzzTransactionWebhookSchema = z
  .object({
    txnid: z.string().min(1),
    easepayid: optionalField,
    amount: z.string().min(1),
    easebuzz_charges: optionalField,
    productinfo: optionalField,
    firstname: optionalField,
    email: optionalField,
    phone: optionalField,
    status: z.string().min(1),
    mode: optionalField,
    addedon: optionalField,
    key: z.string().min(1),
    hash: z.string().min(1),
    udf1: optionalField,
    udf2: optionalField,
    udf3: optionalField,
    udf4: optionalField,
    udf5: optionalField,
    udf6: optionalField,
    udf7: optionalField,
    udf8: optionalField,
    udf9: optionalField,
    udf10: optionalField,
  })
  .passthrough();

export type EasebuzzTransactionWebhook = z.infer<
  typeof easebuzzTransactionWebhookSchema
>;

/**
 * Easebuzz payout/settlement webhook payload.
 * TODO(easebuzz-sandbox): Confirm field names against live Easebuzz docs.
 */
export const easebuzzPayoutWebhookSchema = z
  .object({
    payout_id: z.string().min(1),
    payout_amount: z.string().min(1),
    payout_date: optionalField,
    transaction_count: optionalField,
    status: z.string().min(1),
    utr: optionalField,
    account_number: optionalField,
    key: z.string().min(1),
    hash: z.string().min(1),
  })
  .passthrough();

export type EasebuzzPayoutWebhook = z.infer<
  typeof easebuzzPayoutWebhookSchema
>;

/**
 * Easebuzz refund webhook payload.
 * TODO(easebuzz-sandbox): Confirm field names against live Easebuzz docs.
 */
export const easebuzzRefundWebhookSchema = z
  .object({
    refund_id: z.string().min(1),
    txnid: z.string().min(1),
    easepayid: optionalField,
    refund_amount: z.string().min(1),
    refund_status: z.string().min(1),
    processed_on: optionalField,
    key: z.string().min(1),
    hash: z.string().min(1),
  })
  .passthrough();

export type EasebuzzRefundWebhook = z.infer<
  typeof easebuzzRefundWebhookSchema
>;
