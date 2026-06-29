import { modernCsrf } from "../plugins/modern-csrf";
import { envConfig } from "./env";

export const modernCsrfConfig = modernCsrf({
  trustedOrigins: envConfig.ORIGINS,
});
