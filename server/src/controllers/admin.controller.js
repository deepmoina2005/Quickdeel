import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

export const dashboard = asyncHandler(async (req, res) => {
  const [users, listings, categories, reports, soldListings, revenue] =
    await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.category.count(),
      prisma.report.count({ where: { status: "OPEN" } }),
      prisma.listing.count({ where: { status: "SOLD" } }),
      prisma.listing.aggregate({
        _sum: { price: true },
        where: { status: "SOLD" },
      }),
    ]);
  res.json({
    success: true,
    data: {
      users,
      listings,
      categories,
      openReports: reports,
      soldListings,
      soldValue: revenue._sum.price || 0,
    },
  });
});

export const users = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        phone: true,
        role: true,
        isVerifiedSeller: true,
        isEliteSeller: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
  ]);
  res.json({ success: true, ...paginatedResponse(items, total, page, limit) });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: req.body,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerifiedSeller: true,
      isEliteSeller: true,
    },
  });
  res.json({ success: true, data: user });
});

export const listings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true, category: true, images: true },
    }),
    prisma.listing.count(),
  ]);
  res.json({ success: true, ...paginatedResponse(items, total, page, limit) });
});

export const reports = asyncHandler(async (req, res) => {
  const data = await prisma.report.findMany({
    include: { user: true, listing: true, reportedUser: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data });
});

export const updateReport = asyncHandler(async (req, res) => {
  const report = await prisma.report.update({
    where: { id: Number(req.params.id) },
    data: { status: req.body.status },
  });
  res.json({ success: true, data: report });
});
