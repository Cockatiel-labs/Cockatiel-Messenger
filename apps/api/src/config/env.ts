import { backendEnvSchema } from "@cockatiel/shared/config/backend-env";

export const envConfig = backendEnvSchema.parse(process.env);
