import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addFavorite = asyncHandler(async (req, res) => {
  const listingId = Number(req.params.id);
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, status: "APPROVED" },
    select: { id: true },
  });
  if (!listing) throw new ApiError(404, "Listing not found");

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_listingId: {
        userId: req.user.id,
        listingId,
      },
    },
    update: {},
    create: { userId: req.user.id, listingId },
  });
  res.status(201).json({ success: true, data: favorite });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  await prisma.favorite.deleteMany({
    where: {
      userId: req.user.id,
      listingId: Number(req.params.id),
    },
  });
  res.json({ success: true, message: "Favorite removed" });
});
