import { describe, expect, it } from "bun:test";

/**
 * These tests validate the ORIGIN_ALLOWLIST env schema behavior.
 *
 * Since the shared config module parses process.env at import time, we test the
 * schema directly rather than re-importing the parsed config.
 */
describe("backend env configuration", () => {
  it("defaults ORIGIN_ALLOWLIST to ['http://localhost:3000'] (no wildcard)", async () => {
    const { backendEnvSchema } = await import("@joo-joo/shared/config/backend-env");

    const result = backendEnvSchema.parse({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://localhost:5432/test",
      ACCESS_JWT_SECRET: "a".repeat(32),
      REFRESH_JWT_SECRET: "b".repeat(32),
      // ORIGIN_ALLOWLIST intentionally omitted to test default
    });

    expect(result.ORIGIN_ALLOWLIST).toEqual(["http://localhost:3000"]);
    expect(result.ORIGIN_ALLOWLIST).not.toContain("*");
  });

  it("parses a comma-separated ORIGIN_ALLOWLIST into an array", async () => {
    const { backendEnvSchema } = await import("@joo-joo/shared/config/backend-env");

    const result = backendEnvSchema.parse({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://localhost:5432/test",
      ACCESS_JWT_SECRET: "a".repeat(32),
      REFRESH_JWT_SECRET: "b".repeat(32),
      ORIGIN_ALLOWLIST: "https://app.example.com,https://admin.example.com",
    });

    expect(result.ORIGIN_ALLOWLIST).toEqual(["https://app.example.com", "https://admin.example.com"]);
  });

  it("rejects an invalid origin URL in the allowlist", async () => {
    const { backendEnvSchema } = await import("@joo-joo/shared/config/backend-env");

    expect(() =>
      backendEnvSchema.parse({
        NODE_ENV: "production",
        DATABASE_URL: "postgres://localhost:5432/test",
        ACCESS_JWT_SECRET: "a".repeat(32),
        REFRESH_JWT_SECRET: "b".repeat(32),
        ORIGIN_ALLOWLIST: "not-a-valid-url",
      }),
    ).toThrow();
  });

  it("rejects an empty ORIGIN_ALLOWLIST", async () => {
    const { backendEnvSchema } = await import("@joo-joo/shared/config/backend-env");

    expect(() =>
      backendEnvSchema.parse({
        NODE_ENV: "production",
        DATABASE_URL: "postgres://localhost:5432/test",
        ACCESS_JWT_SECRET: "a".repeat(32),
        REFRESH_JWT_SECRET: "b".repeat(32),
        ORIGIN_ALLOWLIST: "",
      }),
    ).toThrow();
  });

  it("never allows wildcard origin — always an explicit array", async () => {
    const { backendEnvSchema } = await import("@joo-joo/shared/config/backend-env");

    const result = backendEnvSchema.parse({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://localhost:5432/test",
      ACCESS_JWT_SECRET: "a".repeat(32),
      REFRESH_JWT_SECRET: "b".repeat(32),
      ORIGIN_ALLOWLIST: "https://example.com",
    });

    expect(Array.isArray(result.ORIGIN_ALLOWLIST)).toBe(true);
    expect(result.ORIGIN_ALLOWLIST.every((o: string) => o !== "*")).toBe(true);
  });
});
