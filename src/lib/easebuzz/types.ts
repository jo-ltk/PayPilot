import type { GatewayEnvironment } from "@prisma/client";

/** Decrypted Easebuzz merchant credentials for a shop's gateway. */
export type EasebuzzCredentials = {
  key: string;
  salt: string;
  merchantEmail: string;
  environment: GatewayEnvironment;
};

/** Raw response shape returned by Easebuzz transaction APIs. */
export type EasebuzzApiResponse = {
  status: number | boolean;
  data?: unknown;
  error?: string;
  error_desc?: string;
  message?: string;
};

/** Outcome of validating merchant credentials against the Easebuzz sandbox/live API. */
export type CredentialValidationResult = {
  valid: boolean;
  message?: string;
};
