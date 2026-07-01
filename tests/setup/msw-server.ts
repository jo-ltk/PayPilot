import { setupServer } from "msw/node";

import { handlers } from "./msw-handlers";

/** Shared MSW server for tests; override per-test with `server.use(...)`. */
export const server = setupServer(...handlers);
