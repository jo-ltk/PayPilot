import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

type AuditResult = { name: string; passed: boolean; detail?: string };

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

/**
 * Recursively lists TypeScript files under a directory.
 * @param dir - Directory to scan
 * @returns Absolute file paths
 */
function listTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...listTsFiles(full));
      continue;
    }
    if (full.endsWith(".ts") || full.endsWith(".tsx")) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Verifies production source files do not use console.log.
 * @returns Audit result
 */
function auditNoConsoleLog(): AuditResult {
  const offenders = listTsFiles(SRC).filter((file) =>
    readFileSync(file, "utf8").includes("console.log"),
  );
  return {
    name: "No console.log in src/",
    passed: offenders.length === 0,
    detail: offenders.length ? offenders.join(", ") : undefined,
  };
}

/**
 * Verifies required security modules exist.
 * @returns Audit results
 */
function auditSecurityModules(): AuditResult[] {
  const required = [
    "src/lib/rate-limit.ts",
    "src/lib/monitoring/sentry.ts",
    "src/lib/crypto/encrypt.ts",
    "src/lib/shopify/webhooks.ts",
    "src/lib/easebuzz/webhooks.ts",
  ];
  return required.map((rel) => ({
    name: `Module present: ${rel}`,
    passed: statSync(join(ROOT, rel)).isFile(),
  }));
}

/**
 * Verifies `.env.example` documents production observability variables.
 * @returns Audit result
 */
function auditEnvExample(): AuditResult {
  const example = readFileSync(join(ROOT, ".env.example"), "utf8");
  const required = [
    "SENTRY_DSN",
    "BETTERSTACK_SOURCE_TOKEN",
    "POSTHOG_API_KEY",
    "ENCRYPTION_KEY",
    "SESSION_SECRET",
  ];
  const missing = required.filter((key) => !example.includes(key));
  return {
    name: ".env.example production variables",
    passed: missing.length === 0,
    detail: missing.length ? `Missing: ${missing.join(", ")}` : undefined,
  };
}

/**
 * Runs the B8 security audit and exits non-zero on failure.
 */
function main(): void {
  const results = [
    auditNoConsoleLog(),
    auditEnvExample(),
    ...auditSecurityModules(),
  ];

  let failed = 0;
  for (const result of results) {
    const mark = result.passed ? "PASS" : "FAIL";
    console.log(`${mark}  ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
    if (!result.passed) {
      failed += 1;
    }
  }

  if (failed > 0) {
    console.error(`\nSecurity audit failed (${failed} check(s)).`);
    process.exit(1);
  }

  console.log("\nSecurity audit passed.");
}

main();
