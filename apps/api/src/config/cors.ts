import cors from "@elysia/cors";
import { envConfig } from "./env";

export const corsConfig = cors({
  origin: envConfig.ORIGINS,
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
});
