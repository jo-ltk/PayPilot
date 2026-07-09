import { z } from "zod";

/** Zod schema for Easebuzz credential JSON shape. */
export const easebuzzCredentialsSchema = z.object({
  key: z.string().min(1),
  salt: z.string().min(1),
  merchantEmail: z.string().email(),
});

export type EasebuzzCredentialFields = z.infer<typeof easebuzzCredentialsSchema>;
