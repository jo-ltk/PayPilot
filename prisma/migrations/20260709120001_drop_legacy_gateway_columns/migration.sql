-- Drop legacy provider-specific credential columns after data migration.
ALTER TABLE "PaymentGateway" ALTER COLUMN "credentials" SET NOT NULL;

ALTER TABLE "PaymentGateway"
  DROP COLUMN "key",
  DROP COLUMN "salt",
  DROP COLUMN "merchantEmail";
