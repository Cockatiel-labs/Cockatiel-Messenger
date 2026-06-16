import { Elysia } from "elysia";
import { checkDatabaseHealth } from "./service";

export const health = new Elysia({ prefix: "/v1/health" }).get("/", async ({ set }) => {
  try {
    await checkDatabaseHealth();

    return {
      success: true,
      status: "UP",
      message: "Database connection successful",
    };
  } catch (error) {
    set.status = 503;
    console.error(error);

    return {
      success: false,
      status: "DOWN",
      message: "Database connection failed",
    };
  }
});
