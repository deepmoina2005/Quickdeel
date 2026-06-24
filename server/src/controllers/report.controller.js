import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReport = asyncHandler(async (req, res) => {
  const { description, reason, ...rest } = req.body;
  if (rest.listingId) {
    const listing = await prisma.listing.findUnique({
      where: { id: Number(rest.listingId) },
      select: { id: true },
    });
    if (!listing) throw new ApiError(404, "Listing not found");
  }
  if (rest.reportedUserId) {
    const user = await prisma.user.findUnique({
      where: { id: Number(rest.reportedUserId) },
      select: { id: true },
    });
    if (!user) throw new ApiError(404, "Reported user not found");
  }

  const report = await prisma.report.create({
    data: {
      ...rest,
      reason: description ? `${reason}\n\n${description}` : reason,
      userId: req.user.id,
    },
    include: { user: true, listing: true, reportedUser: true },
  });
  res.status(201).json({ success: true, data: report });
});
