import "./load-env.js";
import { createServer } from "node:http";
import { createHttpApp } from "./http/server.js";
import { boot, runtime } from "./runtime.js";

const shutdown = (server: ReturnType<typeof createServer>) => {
  server.close(() => {
    void runtime.dispose();
  });
};

runtime
  .runPromise(boot)
  .then((config) => {
    const app = createHttpApp(config);
    const server = createServer(app);
    server.listen(config.apiPort, () => {
      console.log(`Data Structures and Algorithms API listening on ${config.apiPort}`);
    });
    process.once("SIGINT", () => {
      shutdown(server);
    });
    process.once("SIGTERM", () => {
      shutdown(server);
    });
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
