import { prisma } from "../config/prisma.js";
import { verifyAccessToken } from "../services/token.service.js";
import { ApiError } from "../utils/apiError.js";

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ")
      ? header.split(" ")[1]
      : req.cookies?.accessToken;
    if (!token) throw new ApiError(401, "Authentication required");

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new ApiError(401, "User not found");

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new ApiError(403, "Forbidden"));
    next();
  };
