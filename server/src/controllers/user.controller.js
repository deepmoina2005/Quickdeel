import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { saveUploadedImage } from "../services/upload.service.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

const includeListing = {
  category: true,
  images: true,
  user: {
    select: {
      id: true,
      name: true,
      avatar: true,
      isVerifiedSeller: true,
      isEliteSeller: true,
    },
  },
};

const connectionUserSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
};

const profileSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  phone: true,
  about: true,
  contactEmail: true,
  role: true,
  isVerifiedSeller: true,
  isEliteSeller: true,
  createdAt: true,
  followers: {
    select: {
      follower: { select: connectionUserSelect },
    },
  },
  following: {
    select: {
      following: { select: connectionUserSelect },
    },
  },
};

const normalizeProfile = (user) => ({
  ...user,
  followers: (user.followers || []).map((item) => item.follower),
  following: (user.following || []).map((item) => item.following),
});

export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: profileSelect,
  });
  res.json({ success: true, user: normalizeProfile(user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: req.body,
    select: profileSelect,
  });
  res.json({ success: true, user: normalizeProfile(user) });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  const avatar = await saveUploadedImage(req.file, "avatars");
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatar },
    select: profileSelect,
  });
  res.json({ success: true, avatar: user.avatar, user: normalizeProfile(user) });
});

export const followUser = asyncHandler(async (req, res) => {
  const followingId = Number(req.params.id);
  if (followingId === req.user.id) throw new ApiError(400, "You cannot follow yourself");

  const user = await prisma.user.findUnique({ where: { id: followingId } });
  if (!user) throw new ApiError(404, "User not found");

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: req.user.id, followingId } },
    update: {},
    create: { followerId: req.user.id, followingId },
  });

  res.json({ success: true, message: "User followed" });
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const followingId = Number(req.params.id);
  await prisma.follow.deleteMany({
    where: { followerId: req.user.id, followingId },
  });

  res.json({ success: true, message: "User unfollowed" });
});

export const changePassword = asyncHandler(async (req, res) => {
  const ok = await bcrypt.compare(req.body.currentPassword, req.user.password);
  if (!ok) throw new ApiError(400, "Current password is incorrect");

  const password = await bcrypt.hash(req.body.newPassword, 12);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password, refreshToken: null },
  });
  res.json({ success: true, message: "Password changed" });
});

export const ownListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = { userId: req.user.id };
  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        ...includeListing,
        _count: {
          select: {
            favorites: true,
            conversations: true,
          },
        },
        conversations: {
          select: {
            _count: {
              select: {
                offers: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.listing.count({ where }),
  ]);
  const listings = items.map(({ _count, conversations, ...listing }) => ({
    ...listing,
    views: 0,
    favoriteCount: _count.favorites,
    chatCount: _count.conversations,
    offerCount: conversations.reduce(
      (totalOffers, conversation) => totalOffers + conversation._count.offers,
      0,
    ),
  }));
  res.json({ success: true, ...paginatedResponse(listings, total, page, limit) });
});

export const favorites = asyncHandler(async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id },
    include: { listing: { include: includeListing } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: favorites.map((item) => item.listing) });
});

export const purchases = asyncHandler(async (req, res) => {
  const offers = await prisma.offer.findMany({
    where: {
      status: "ACCEPTED",
      conversation: { buyerId: req.user.id },
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      conversation: {
        include: {
          seller: { select: { id: true, name: true, avatar: true, phone: true } },
          listing: { include: includeListing },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const seenListings = new Set();
  const purchases = offers
    .filter((offer) => {
      const listingId = offer.conversation.listing?.id;
      if (!listingId || seenListings.has(listingId)) return false;
      seenListings.add(listingId);
      return true;
    })
    .map((offer) => ({
      id: offer.id,
      amount: offer.amount,
      status: offer.status,
      completedAt: offer.createdAt,
      seller: offer.conversation.seller,
      listing: offer.conversation.listing,
    }));

  res.json({ success: true, data: purchases });
});

export const publicSellerProfile = asyncHandler(async (req, res) => {
  const seller = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: {
      id: true,
      name: true,
      avatar: true,
      phone: true,
      about: true,
      contactEmail: true,
      isVerifiedSeller: true,
      isEliteSeller: true,
      createdAt: true,
      followers: { select: { followerId: true } },
      following: { select: { followingId: true } },
      listings: {
        where: { status: "APPROVED" },
        include: includeListing,
        orderBy: { createdAt: "desc" },
      },
      sellerReviews: {
        select: { rating: true },
      },
    },
  });

  if (!seller) throw new ApiError(404, "Seller not found");

  const rating =
    seller.sellerReviews.length > 0
      ? seller.sellerReviews.reduce((sum, review) => sum + review.rating, 0) /
        seller.sellerReviews.length
      : 4.8;
  const { sellerReviews, ...publicSeller } = seller;

  res.json({
    success: true,
    data: {
      seller: {
        ...publicSeller,
        followersCount: publicSeller.followers.length,
        followingCount: publicSeller.following.length,
        rating: Number(rating.toFixed(1)),
      },
      listings: publicSeller.listings,
    },
  });
});
