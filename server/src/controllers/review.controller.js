import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReview = asyncHandler(async (req, res) => {
  if (req.body.sellerId === req.user.id)
    throw new ApiError(400, "You cannot review yourself");
  const review = await prisma.review.upsert({
    where: {
      reviewerId_sellerId: {
        reviewerId: req.user.id,
        sellerId: req.body.sellerId,
      },
    },
    update: { rating: req.body.rating, comment: req.body.comment },
    create: { reviewerId: req.user.id, ...req.body },
  });
  res.status(201).json({ success: true, data: review });
});

export const sellerReviews = asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { sellerId: Number(req.params.id) },
    include: { reviewer: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });
  const average = reviews.length
    ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
    : 0;
  res.json({ success: true, average, data: reviews });
});
