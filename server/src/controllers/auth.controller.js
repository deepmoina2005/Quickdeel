import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { signAccessToken, signRefreshToken, signResetToken, verifyRefreshToken, verifyResetToken } from "../services/token.service.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const publicUser = ({ password, refreshToken, resetToken, resetTokenExpiry, ...user }) => user;

const issueTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
  return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req, res) => {
  const exists = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (exists) throw new ApiError(409, "Email already registered");

  const password = await bcrypt.hash(req.body.password, 12);
  const user = await prisma.user.create({ data: { ...req.body, password } });
  const tokens = await issueTokens(user);
  res.status(201).json({ success: true, user: publicUser(user), ...tokens });
});

export const login = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = await issueTokens(user);
  res.json({ success: true, user: publicUser(user), ...tokens });
});

export const logout = asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
  res.json({ success: true, message: "Logged out" });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token required");

  const payload = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || user.refreshToken !== token) throw new ApiError(401, "Invalid refresh token");

  const tokens = await issueTokens(user);
  res.json({ success: true, ...tokens });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  let resetToken;
  if (user) {
    resetToken = signResetToken(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000) }
    });
  }

  res.json({
    success: true,
    message: "If that email exists, a reset token has been generated",
    resetToken: process.env.NODE_ENV === "production" ? undefined : resetToken
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const payload = verifyResetToken(req.body.token);
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || user.resetToken !== req.body.token || user.resetTokenExpiry < new Date()) {
    throw new ApiError(400, "Reset token is invalid or expired");
  }

  const password = await bcrypt.hash(req.body.password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password, resetToken: null, resetTokenExpiry: null, refreshToken: null }
  });
  res.json({ success: true, message: "Password reset successful" });
});
