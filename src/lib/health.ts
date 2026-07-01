import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";

export type HealthChecks = {
  database: "ok" | "error" | "skipped";
};

export type HealthStatus = {
  status: "ok" | "degraded";
  checks: HealthChecks;
  timestamp: string;
  version: string;
};

/**
 * Probes database connectivity for readiness checks.
 * @returns `ok`, `error`, or `skipped` when DATABASE_URL is unset
 */
async function probeDatabase(): Promise<HealthChecks["database"]> {
  const { DATABASE_URL } = getEnv();
  if (!DATABASE_URL) {
    return "skipped";
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch {
    return "error";
  }
}

/**
 * Builds the production health payload including dependency checks.
 * @returns Health status with database probe result
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  const database = await probeDatabase();
  const checks: HealthChecks = { database };
  const status = database === "error" ? "degraded" : "ok";

  return {
    status,
    checks,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
  };
}

/**
 * HTTP status code for a health payload (`503` when degraded).
 * @param health - Health status payload
 * @returns 200 or 503
 */
export function healthStatusCode(health: HealthStatus): number {
  return health.status === "degraded" ? 503 : 200;
}
