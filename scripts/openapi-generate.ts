import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";

import { buildOpenApiRegistry } from "../src/lib/openapi/registry";

/**
 * Generates the OpenAPI 3.1 document from registered Zod schemas.
 */
function main(): void {
  const generator = new OpenApiGeneratorV31(buildOpenApiRegistry().definitions);
  const spec = generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "PayPilot API",
      version: "0.1.0",
      description: "Shopify Payment Analytics & Settlement Reconciliation",
    },
  });

  const outDir = join(process.cwd(), "openapi");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "spec.json"), JSON.stringify(spec, null, 2));
  console.log("OpenAPI spec written to openapi/spec.json");
}

main();
