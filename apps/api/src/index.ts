import { Elysia } from "elysia";
import { corsConfig } from "./config/cors";
import { envConfig } from "./config/env";
import { modernCsrfConfig } from "./config/modern-csrf";
import { checkDatabaseHealth } from "./db/health/database";

await checkDatabaseHealth();

export const app = new Elysia({ prefix: "/api" }).use(corsConfig).use(modernCsrfConfig).listen(envConfig.PORT);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
