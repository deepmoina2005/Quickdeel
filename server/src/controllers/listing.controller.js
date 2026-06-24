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
      phone: true,
      createdAt: true,
      isVerifiedSeller: true,
      isEliteSeller: true,
      _count: { select: { listings: true } },
      sellerReviews: { select: { rating: true } },
    },
  },
};

const ensureOwnerOrAdmin = (listing, user) => {
  if (listing.userId !== user.id && user.role !== "ADMIN")
    throw new ApiError(403, "Forbidden");
};

const titleCase = (value) =>
  value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const resolveCategoryId = async ({ categoryId, category }) => {
  if (categoryId) return Number(categoryId);
  const name = titleCase(category);
  const existing = await prisma.category.findFirst({
    where: { name: { equals: name } },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.category.create({ data: { name } });
  return created.id;
};

const normalizeLocationPart = (value) => String(value || "").trim();

const combineLocation = ({ city, state, country, location }) =>
  [city, state, country].map(normalizeLocationPart).filter(Boolean).join(", ") ||
  normalizeLocationPart(location);

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

export const listListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const {
    keyword,
    q,
    category,
    categoryId,
    minPrice,
    maxPrice,
    location,
    sort = "latest",
  } = req.query;
  const andFilters = [];
  if (keyword || q) {
    andFilters.push({
      OR: [
        { title: { contains: keyword || q } },
        { description: { contains: keyword || q } },
      ],
    });
  }
  const nextLocationFilter = locationFilter(location);
  if (nextLocationFilter.AND) andFilters.push(nextLocationFilter);
  const where = {
    status: "APPROVED",
    ...(andFilters.length && { AND: andFilters }),
    ...(categoryId && { categoryId: Number(categoryId) }),
    ...(category && {
      category: {
        name: {
          contains: category.replace(/-/g, " "),
        },
      },
    }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: Number(minPrice) }),
        ...(maxPrice && { lte: Number(maxPrice) }),
      },
    }),
  };
  const orderBy =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };
  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: includeListing,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);
  res.json({ success: true, ...paginatedResponse(items, total, page, limit) });
});

export const getListing = asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: Number(req.params.id) },
    include: includeListing,
  });
  if (!listing) throw new ApiError(404, "Listing not found");
  res.json({ success: true, data: listing });
});

export const createListing = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const imageUrls = await Promise.all(
    files.map((file) => saveUploadedImage(file, "listings")),
  );
  const { category, categoryId, country, state, city, location, ...listingData } = req.body;
  const fullLocation = combineLocation({ city, state, country, location });
  const listing = await prisma.listing.create({
    data: {
      ...listingData,
      price: Number(req.body.price),
      country: normalizeLocationPart(country),
      state: normalizeLocationPart(state),
      city: normalizeLocationPart(city),
      location: fullLocation,
      status: "APPROVED",
      categoryId: await resolveCategoryId({ categoryId, category }),
      userId: req.user.id,
      images: { create: imageUrls.map((imageUrl) => ({ imageUrl })) },
    },
    include: includeListing,
  });
  res.status(201).json({ success: true, data: listing });
});

export const updateListing = asyncHandler(async (req, res) => {
  const existing = await prisma.listing.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!existing) throw new ApiError(404, "Listing not found");
  ensureOwnerOrAdmin(existing, req.user);

  const locationFieldsChanged = ["country", "state", "city", "location"].some((field) =>
    Object.prototype.hasOwnProperty.call(req.body, field),
  );
  const nextCountry = normalizeLocationPart(req.body.country ?? existing.country);
  const nextState = normalizeLocationPart(req.body.state ?? existing.state);
  const nextCity = normalizeLocationPart(req.body.city ?? existing.city);
  const nextLocation = locationFieldsChanged
    ? combineLocation({
      city: nextCity,
      state: nextState,
      country: nextCountry,
      location: req.body.location ?? existing.location,
    })
    : undefined;

  const listing = await prisma.listing.update({
    where: { id: existing.id },
    data: {
      ...req.body,
      ...(req.body.price && { price: Number(req.body.price) }),
      ...(locationFieldsChanged && {
        country: nextCountry,
        state: nextState,
        city: nextCity,
        location: nextLocation,
      }),
    },
    include: includeListing,
  });
  res.json({ success: true, data: listing });
});

export const deleteListing = asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!listing) throw new ApiError(404, "Listing not found");
  ensureOwnerOrAdmin(listing, req.user);
  await prisma.listing.delete({ where: { id: listing.id } });
  res.json({ success: true, message: "Listing deleted" });
});

export const markSold = asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!listing) throw new ApiError(404, "Listing not found");
  ensureOwnerOrAdmin(listing, req.user);
  const updated = await prisma.listing.update({
    where: { id: listing.id },
    data: { status: "SOLD" },
    include: includeListing,
  });
  res.json({ success: true, data: updated });
});

export const uploadListingImages = asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!listing) throw new ApiError(404, "Listing not found");
  ensureOwnerOrAdmin(listing, req.user);
  const imageUrls = await Promise.all(
    (req.files || []).map((file) =>
      saveUploadedImage(file, "listings"),
    ),
  );
  await prisma.listingImage.createMany({
    data: imageUrls.map((imageUrl) => ({ imageUrl, listingId: listing.id })),
  });
  const updated = await prisma.listing.findUnique({
    where: { id: listing.id },
    include: includeListing,
  });
  res.json({ success: true, data: updated });
});
