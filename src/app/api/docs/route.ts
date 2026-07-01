import { readFileSync } from "fs";
import { join } from "path";

import { getEnv } from "@/lib/env";

/**
 * Serves interactive API docs in non-production environments.
 *
 * Returns a Scalar-powered HTML page backed by the generated OpenAPI spec.
 * Disabled in production per the backend plan.
 * @returns HTML docs page or 404 when disabled
 */
export async function GET(): Promise<Response> {
  if (getEnv().NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const specPath = join(process.cwd(), "openapi", "spec.json");
  const spec = readFileSync(specPath, "utf8");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>PayPilot API Docs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <script id="api-reference" type="application/json">${spec}</script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
