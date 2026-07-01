import { config } from "dotenv";
import { beforeAll, afterAll, afterEach } from "vitest";

import { server } from "./msw-server";

config({ path: ".env.test" });

beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
