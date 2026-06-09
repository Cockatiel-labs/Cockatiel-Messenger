import * as z from "zod";

export const frontendEnvSchema = z.object({
  BASE_URL: z.string(),
  PORT: z.coerce.number().int().positive().default(3000),
});

export type frontendEnv = z.infer<typeof frontendEnvSchema>;
