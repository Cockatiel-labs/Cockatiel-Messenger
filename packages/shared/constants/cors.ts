import * as z from "zod";

export const originsAllowlistSchema = z
  .string()
  .default("http://localhost:3000")
  .transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.url()).nonempty("ORIGIN_ALLOWLIST must contain at least one origin"));
