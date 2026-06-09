import { defineConfig } from "drizzle-kit";
import { envConfig } from "./src/config/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/**/*.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url: envConfig.DATABASE_URL,
  },
});
