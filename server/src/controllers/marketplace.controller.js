import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const includeListing = {
  category: true,
  images: true,
  user: {
    select: {
      id: true,
      name: true,
      avatar: true,
      phone: true,
      isVerifiedSeller: true,
      isEliteSeller: true,
    },
  },
};

const locationFilter = (location) => {
  if (!location) return {};
  const tokens = String(location)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!tokens.length) return {};
  return {
    AND: tokens.map((token) => ({
      OR: [
        { city: { contains: token } },
        { state: { contains: token } },
        { country: { contains: token } },
        { location: { contains: token } },
      ],
    })),
  };
};

export const home = asyncHandler(async (req, res) => {
  const listingWhere = { status: "APPROVED", ...locationFilter(req.query.location) };
  const [categories, latestListings, locations] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { listings: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.listing.findMany({
      where: listingWhere,
      include: includeListing,
      orderBy: { createdAt: "desc" },
      take: 16,
    }),
    prisma.listing.findMany({
      where: { status: "APPROVED" },
      distinct: ["location"],
      select: { location: true },
      orderBy: { location: "asc" },
    }),
  ]);

  res.json({
    success: true,
    data: {
      categories: categories.map(({ _count, ...category }) => ({
        ...category,
        count: _count.listings,
      })),
      featuredListings: latestListings.slice(0, 8),
      latestListings,
      locations: locations.map((item) => item.location),
    },
  });
});
