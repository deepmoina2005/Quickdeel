import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signAccessToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, env.accessSecret, {
    expiresIn: env.accessExpiry,
  });

export const signRefreshToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, env.refreshSecret, {
    expiresIn: env.refreshExpiry,
  });

export const signResetToken = (user) =>
  jwt.sign({ id: user.id }, env.resetSecret, { expiresIn: "15m" });

export const verifyAccessToken = (token) => jwt.verify(token, env.accessSecret);
export const verifyRefreshToken = (token) =>
  jwt.verify(token, env.refreshSecret);
export const verifyResetToken = (token) => jwt.verify(token, env.resetSecret);
