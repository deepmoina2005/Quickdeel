import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  clientUrl: (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
  resetSecret: process.env.JWT_RESET_SECRET || "dev-reset-secret",
  accessExpiry: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  refreshExpiry: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
};
