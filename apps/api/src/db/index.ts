import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { envConfig } from "../config/env";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: envConfig.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema,
});
