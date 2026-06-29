export const argon2IdOptions = {
  algorithm: "argon2id",
  memoryCost: 1024 * 64, // memory usage in kb (64MiB)
  timeCost: 3, // the number of iterations
} as const;
