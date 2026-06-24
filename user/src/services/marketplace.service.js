import { api } from "./api";
import { categories, conversations, listings, locations, notifications } from "../constants/mockData";
import { storage } from "../utils/storage";

export const useRealApi = import.meta.env.VITE_USE_REAL_API !== "false";
const wait = (data) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), 250));

const apiOrigin = () => (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const slugify = (value = "") => value.toString().toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const assetUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${apiOrigin()}${url.startsWith("/") ? url : `/${url}`}`;
};

const unwrap = (response) => response?.data?.data ?? response?.data?.items ?? response?.data;
const currentUserId = () => storage.get("user")?.id;
const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );

const normalizeCategory = (category) => ({
  id: slugify(category.name || category.id),
  categoryId: category.id,
  name: category.name,
  icon: "Search",
  count: category.count ?? category._count?.listings ?? 0,
  image: assetUrl(category.image),
});

const conditionLabel = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Used",
  POOR: "Used",
};

const conditionValue = {
  New: "NEW",
  "Like New": "LIKE_NEW",
  Used: "GOOD",
  Good: "GOOD",
};

const normalizeListing = (listing) => {
  if (!listing) return null;
  const imageUrls = Array.isArray(listing.images)
    ? listing.images.map((image) => assetUrl(image.imageUrl || image)).filter(Boolean)
    : [];
  const categoryName = listing.category?.name || listing.category || "";
  const sellerReviews = listing.user?.sellerReviews || listing.seller?.sellerReviews || [];
  const sellerRating = sellerReviews.length
    ? sellerReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / sellerReviews.length
    : listing.user?.rating ?? listing.seller?.rating ?? null;

  return {
    id: String(listing.id),
    title: listing.title,
    category: slugify(categoryName),
    categoryId: listing.categoryId || listing.category?.id,
    categoryName,
    price: Number(listing.price || 0),
    location: listing.location,
    country: listing.country || "",
    state: listing.state || "",
    city: listing.city || "",
    condition: conditionLabel[listing.condition] || listing.condition || "Used",
    status: listing.status === "APPROVED" ? "Active" : listing.status === "SOLD" ? "Sold" : listing.status,
    views: Number(listing.views || 0),
    favoriteCount: Number(listing.favoriteCount || listing._count?.favorites || 0),
    offerCount: Number(listing.offerCount || 0),
    chatCount: Number(listing.chatCount || listing._count?.conversations || 0),
    featured: Boolean(listing.featured),
    createdAt: listing.createdAt,
    description: listing.description,
    images: imageUrls,
    seller: {
      id: String(listing.user?.id || listing.seller?.id || ""),
      name: listing.user?.name || listing.seller?.name || "Seller",
      phone: listing.user?.phone || listing.seller?.phone || "",
      avatar: assetUrl(listing.user?.avatar || listing.seller?.avatar) || "https://i.pravatar.cc/120?img=7",
      createdAt: listing.user?.createdAt || listing.seller?.createdAt,
      itemsListed: Number(listing.user?._count?.listings || listing.seller?.itemsListed || 0),
      rating: sellerRating ? Number(sellerRating.toFixed(1)) : null,
      reviewCount: sellerReviews.length,
      isVerifiedSeller: listing.user?.isVerifiedSeller,
      isEliteSeller: listing.user?.isEliteSeller,
    },
  };
};

const normalizeMessage = (message) => ({
  id: String(message.id),
  fromMe: String(message.senderId) === String(currentUserId()),
  type: message.type || "TEXT",
  imageUrl: assetUrl(message.imageUrl),
  locationLat: message.locationLat,
  locationLng: message.locationLng,
  locationLabel: message.locationLabel,
  text: message.message || message.text,
  time: message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : message.time || "Now",
});

const normalizeOffer = (offer) => ({
  id: String(offer.id),
  amount: Number(offer.amount || 0),
  senderId: offer.senderId ? String(offer.senderId) : offer.sender?.id ? String(offer.sender.id) : "",
  fromMe: String(offer.senderId) === String(currentUserId()),
  status: offer.status || "Sent",
  time: offer.createdAt ? new Date(offer.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : offer.time || "Now",
});

const normalizePurchase = (purchase) => ({
  id: String(purchase.id),
  amount: Number(purchase.amount || 0),
  status: purchase.status || "COMPLETED",
  completedAt: purchase.completedAt,
  listing: normalizeListing({
    ...purchase.listing,
    user: purchase.listing?.user || purchase.seller,
  }),
  seller: {
    id: String(purchase.seller?.id || ""),
    name: purchase.seller?.name || "Seller",
    avatar: assetUrl(purchase.seller?.avatar) || "https://i.pravatar.cc/120?img=7",
    phone: purchase.seller?.phone || "",
  },
});

const normalizeConversation = (conversation) => {
  const me = String(currentUserId());
  const otherUser = String(conversation.buyerId) === me ? conversation.seller : conversation.buyer;
  const listing = conversation.listing || {};
  const images = listing.images || [];

  return {
    id: String(conversation.id),
    listingId: listing.id ? String(listing.id) : conversation.listingId ? String(conversation.listingId) : "",
    listingTitle: listing.title || conversation.listingTitle || "Listing",
    listingPrice: Number(listing.price || conversation.listingPrice || 0),
    listingLocation: listing.location || conversation.listingLocation || "",
    listingImage: assetUrl(images[0]?.imageUrl || conversation.listingImage),
    user: {
      id: String(otherUser?.id || conversation.user?.id || ""),
      name: otherUser?.name || conversation.user?.name || "Seller",
      avatar: assetUrl(otherUser?.avatar || conversation.user?.avatar) || "https://i.pravatar.cc/120?img=7",
      phone: otherUser?.phone || conversation.user?.phone || "",
    },
    messages: (conversation.messages || []).map(normalizeMessage),
    offers: (conversation.offers || []).map(normalizeOffer),
    updatedAt: conversation.updatedAt ? new Date(conversation.updatedAt).getTime() : conversation.updatedAt || 0,
  };
};

const normalizeNotification = (notification) => ({
  ...notification,
  read: notification.read ?? notification.isRead ?? false,
  createdAt: notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.createdAt,
});

const filterListings = (items, params = {}) => {
  const query = params.q?.toLowerCase() || "";
  return items.filter((item) => {
    const matchesQuery = !query || [item.title, item.location, item.category].some((value) => value.toLowerCase().includes(query));
    const matchesCategory = !params.category || item.category === params.category;
    const matchesLocation = !params.location || item.location.toLowerCase() === params.location.toLowerCase();
    const matchesCondition = !params.condition || item.condition === params.condition;
    const matchesMinPrice = !params.minPrice || item.price >= Number(params.minPrice);
    const matchesMaxPrice = !params.maxPrice || item.price <= Number(params.maxPrice);
    return matchesQuery && matchesCategory && matchesLocation && matchesCondition && matchesMinPrice && matchesMaxPrice;
  });
};

const realCategories = async () => {
  const data = unwrap(await api.get("/categories"));
  return Array.isArray(data) ? data : [];
};

const toListingFormData = async (values) => {
  const formData = new FormData();
  const rawCategories = await realCategories();
  const selectedCategory = rawCategories.find((category) => (
    String(category.id) === String(values.category) ||
    slugify(category.name) === String(values.category)
  ));

  formData.append("title", values.title);
  formData.append("description", values.description);
  formData.append("price", values.price);
  formData.append("condition", conditionValue[values.condition] || values.condition || "GOOD");
  const country = String(values.country || "").trim();
  const state = String(values.state || "").trim();
  const city = String(values.city || "").trim();
  const location = [city, state, country].filter(Boolean).join(", ");
  formData.append("country", country);
  formData.append("state", state);
  formData.append("city", city);
  formData.append("location", location || values.location || "");
  if (selectedCategory?.id) {
    formData.append("categoryId", selectedCategory.id);
  } else {
    formData.append("category", values.category);
  }
  Array.from(values.images || []).forEach((file) => formData.append("images", file));
  return formData;
};

export const marketplaceService = {
  async getHome(params = {}) {
    if (useRealApi) {
      const data = unwrap(await api.get("/marketplace/home", { params: cleanParams(params) }));
      return {
        categories: (data.categories || []).map(normalizeCategory),
        featuredListings: (data.featuredListings || []).map(normalizeListing),
        latestListings: (data.latestListings || []).map(normalizeListing),
        locations: data.locations || [],
      };
    }
    return wait({
      categories,
      featuredListings: listings.filter((item) => item.featured),
      latestListings: listings,
      locations,
    });
  },
  async getListings(params = {}) {
    if (useRealApi) {
      const requestParams = cleanParams({ ...params, keyword: params.keyword || params.q });
      const data = unwrap(await api.get("/listings", { params: requestParams }));
      return (Array.isArray(data) ? data : data?.items || []).map(normalizeListing);
    }
    return wait(filterListings(listings, params));
  },
  async getListing(id) {
    if (useRealApi) return normalizeListing(unwrap(await api.get(`/listings/${id}`)));
    const listing = listings.find((item) => item.id === id);
    return wait(listing || null);
  },
  async createListing(payload) {
    if (useRealApi) return normalizeListing(unwrap(await api.post("/listings", await toListingFormData(payload))));
    return wait({ id: crypto.randomUUID(), ...payload, status: "Active" });
  },
  async updateListing(id, payload) {
    if (useRealApi) return normalizeListing(unwrap(await api.patch(`/listings/${id}`, payload)));
    return wait({ id, ...payload });
  },
  async deleteListing(id) {
    if (useRealApi) return (await api.delete(`/listings/${id}`)).data;
    return wait({ id, deleted: true });
  },
  async markListingSold(id) {
    if (useRealApi) return normalizeListing(unwrap(await api.patch(`/listings/${id}/sold`)));
    return wait({ id, status: "Sold" });
  },
  async getCategories() {
    if (useRealApi) return (await realCategories()).map(normalizeCategory);
    return wait(categories);
  },
  async getSellerProfile(sellerId) {
    if (useRealApi) {
      const data = unwrap(await api.get(`/users/${sellerId}/public`));
      return {
        seller: {
          ...data.seller,
          id: String(data.seller.id),
          avatar: assetUrl(data.seller.avatar) || "https://i.pravatar.cc/120?img=7",
        },
        listings: (data.listings || []).map(normalizeListing),
      };
    }
    const sellerListings = listings.filter((listing) => listing.seller.id === sellerId);
    return wait({ seller: sellerListings[0]?.seller || null, listings: sellerListings });
  },
  async followSeller(sellerId) {
    if (useRealApi) return (await api.post(`/users/${sellerId}/follow`)).data;
    return wait({ success: true, message: "User followed" });
  },
  async unfollowSeller(sellerId) {
    if (useRealApi) return (await api.delete(`/users/${sellerId}/follow`)).data;
    return wait({ success: true, message: "User unfollowed" });
  },
  async getNotifications() {
    if (useRealApi) return (unwrap(await api.get("/notifications")) || []).map(normalizeNotification);
    return wait(notifications);
  },
  async getMyListings() {
    if (useRealApi) {
      const data = unwrap(await api.get("/users/listings"));
      return (Array.isArray(data) ? data : data?.items || []).map(normalizeListing);
    }
    return wait(listings.slice(0, 4));
  },
  async getFavorites() {
    if (useRealApi) return (unwrap(await api.get("/users/favorites")) || []).map(normalizeListing);
    return wait(listings.filter((listing) => listing.featured));
  },
  async addFavorite(listingId) {
    if (useRealApi) return (await api.post(`/listings/${listingId}/favorite`)).data;
    return wait({ success: true, message: "Added to wishlist" });
  },
  async removeFavorite(listingId) {
    if (useRealApi) return (await api.delete(`/listings/${listingId}/favorite`)).data;
    return wait({ success: true, message: "Removed from wishlist" });
  },
  async getPurchases() {
    if (useRealApi) return (unwrap(await api.get("/users/purchases")) || []).map(normalizePurchase);
    return wait([]);
  },
  async reportListing(listingId, payload) {
    if (useRealApi) return (await api.post("/reports", { listingId, ...payload })).data;
    return wait({ listingId, ...payload });
  },
  async reportUser(reportedUserId, payload) {
    if (useRealApi) return (await api.post("/reports", { reportedUserId, ...payload })).data;
    return wait({ reportedUserId, ...payload });
  },
  async getConversations() {
    if (useRealApi) return (unwrap(await api.get("/chat/conversations")) || []).map(normalizeConversation);
    return wait(conversations);
  },
  async startListingConversation(listingId) {
    if (useRealApi) return normalizeConversation(unwrap(await api.post(`/chat/listings/${listingId}/conversation`)));
    const listing = listings.find((item) => item.id === listingId);
    return wait(listing ? {
      id: `listing-${listing.id}`,
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingLocation: listing.location,
      listingImage: listing.images?.[0],
      user: listing.seller,
      messages: [],
      offers: [],
      updatedAt: Date.now(),
    } : null);
  },
  async sendMessage(conversationId, message) {
    if (useRealApi) return normalizeMessage(unwrap(await api.post(`/chat/conversations/${conversationId}/messages`, typeof message === "string" ? { message } : message)));
    return wait({ id: crypto.randomUUID(), fromMe: true, text: message, time: "Now" });
  },
  async sendImageMessage(conversationId, file) {
    if (useRealApi) {
      const formData = new FormData();
      formData.append("image", file);
      return normalizeMessage(unwrap(await api.post(`/chat/conversations/${conversationId}/images`, formData)));
    }
    return wait({ id: crypto.randomUUID(), fromMe: true, type: "IMAGE", imageUrl: URL.createObjectURL(file), text: "Image shared", time: "Now" });
  },
  async sendLocationMessage(conversationId, location) {
    const payload = {
      type: "LOCATION",
      message: location.label || "Location shared",
      locationLat: location.lat,
      locationLng: location.lng,
      locationLabel: location.label,
    };
    if (useRealApi) return normalizeMessage(unwrap(await api.post(`/chat/conversations/${conversationId}/messages`, payload)));
    return wait({ id: crypto.randomUUID(), fromMe: true, ...payload, text: payload.message, time: "Now" });
  },
  async removeConversation(conversationId) {
    if (useRealApi && /^\d+$/.test(String(conversationId))) return (await api.delete(`/chat/conversations/${conversationId}`)).data;
    return wait({ success: true, message: "Chat removed" });
  },
  async sendOffer(conversationId, amount) {
    if (useRealApi) return normalizeOffer(unwrap(await api.post(`/chat/conversations/${conversationId}/offers`, { amount })));
    return wait({ id: crypto.randomUUID(), amount, fromMe: true, status: "Sent", time: "Now" });
  },
  async acceptOffer(offerId) {
    if (useRealApi) return normalizeOffer(unwrap(await api.patch(`/chat/offers/${offerId}/accept`)));
    return wait({ id: offerId, status: "ACCEPTED" });
  },
  async rejectOffer(offerId) {
    if (useRealApi) return normalizeOffer(unwrap(await api.patch(`/chat/offers/${offerId}/reject`)));
    return wait({ id: offerId, status: "REJECTED" });
  },
};
