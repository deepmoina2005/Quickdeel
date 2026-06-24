import { prisma } from "../config/prisma.js";
import { emitToUser } from "../services/socket.service.js";
import { saveUploadedImage } from "../services/upload.service.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const conversationInclude = {
  buyer: { select: { id: true, name: true, avatar: true } },
  seller: { select: { id: true, name: true, avatar: true, phone: true } },
  listing: { include: { images: true, category: true } },
  messages: {
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  },
  offers: {
    orderBy: { createdAt: "desc" },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  },
};

export const listConversations = asyncHandler(async (req, res) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
      hiddenFor: { none: { userId: req.user.id } },
    },
    include: conversationInclude,
    orderBy: { updatedAt: "desc" },
  });
  res.json({ success: true, data: conversations });
});

export const startConversation = asyncHandler(async (req, res) => {
  if (req.body.sellerId === req.user.id)
    throw new ApiError(400, "Cannot start a conversation with yourself");

  if (req.body.listingId) {
    const listing = await prisma.listing.findUnique({
      where: { id: req.body.listingId },
      select: { id: true, userId: true },
    });
    if (!listing) throw new ApiError(404, "Listing not found");
    if (listing.userId !== req.body.sellerId)
      throw new ApiError(400, "Seller does not own this listing");
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      buyerId: req.user.id,
      sellerId: req.body.sellerId,
      listingId: req.body.listingId || null,
    },
    include: conversationInclude,
  });
  const conversation = existing || await prisma.conversation.create({
    data: {
      buyerId: req.user.id,
      sellerId: req.body.sellerId,
      listingId: req.body.listingId,
    },
    include: conversationInclude,
  });
  res.status(201).json({ success: true, data: conversation });
});

export const startListingConversation = asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: Number(req.params.id) },
    select: { id: true, userId: true },
  });
  if (!listing) throw new ApiError(404, "Listing not found");
  if (listing.userId === req.user.id)
    throw new ApiError(400, "Cannot start a conversation with yourself");

  const existing = await prisma.conversation.findFirst({
    where: {
      buyerId: req.user.id,
      sellerId: listing.userId,
      listingId: listing.id,
    },
    include: conversationInclude,
  });
  const conversation = existing || await prisma.conversation.create({
    data: { buyerId: req.user.id, sellerId: listing.userId, listingId: listing.id },
    include: conversationInclude,
  });
  res.status(201).json({ success: true, data: conversation });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (
    !conversation ||
    ![conversation.buyerId, conversation.sellerId].includes(req.user.id)
  )
    throw new ApiError(403, "Forbidden");
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: req.user.id,
      message: req.body.message || (req.body.type === "LOCATION" ? "Location shared" : ""),
      type: req.body.type || "TEXT",
      locationLat: req.body.locationLat,
      locationLng: req.body.locationLng,
      locationLabel: req.body.locationLabel,
    },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });
  const receiverId =
    conversation.buyerId === req.user.id
      ? conversation.sellerId
      : conversation.buyerId;
  await prisma.conversationHidden.deleteMany({
    where: { conversationId: conversation.id, userId: receiverId },
  });
  const notification = await prisma.notification.create({
    data: {
      userId: receiverId,
      title: "New message",
      message: `${req.user.name} sent you a message`,
    },
  });
  emitToUser(receiverId, "notification:new", notification);
  emitToUser(receiverId, "message:new", message);
  res.status(201).json({ success: true, data: message });
});

export const sendImageMessage = asyncHandler(async (req, res) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (
    !conversation ||
    ![conversation.buyerId, conversation.sellerId].includes(req.user.id)
  )
    throw new ApiError(403, "Forbidden");

  const imageUrl = await saveUploadedImage(req.file, "chat");
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: req.user.id,
      message: req.body.message || "Image shared",
      type: "IMAGE",
      imageUrl,
    },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });
  const receiverId =
    conversation.buyerId === req.user.id
      ? conversation.sellerId
      : conversation.buyerId;
  await prisma.conversationHidden.deleteMany({
    where: { conversationId: conversation.id, userId: receiverId },
  });
  const notification = await prisma.notification.create({
    data: {
      userId: receiverId,
      title: "New image",
      message: `${req.user.name} sent you an image`,
    },
  });
  emitToUser(receiverId, "notification:new", notification);
  emitToUser(receiverId, "message:new", message);
  res.status(201).json({ success: true, data: message });
});

export const hideConversation = asyncHandler(async (req, res) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (
    !conversation ||
    ![conversation.buyerId, conversation.sellerId].includes(req.user.id)
  )
    throw new ApiError(403, "Forbidden");

  await prisma.conversationHidden.upsert({
    where: {
      conversationId_userId: {
        conversationId: conversation.id,
        userId: req.user.id,
      },
    },
    update: {},
    create: {
      conversationId: conversation.id,
      userId: req.user.id,
    },
  });

  res.json({ success: true, message: "Chat removed" });
});

export const sendOffer = asyncHandler(async (req, res) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (
    !conversation ||
    ![conversation.buyerId, conversation.sellerId].includes(req.user.id)
  )
    throw new ApiError(403, "Forbidden");

  const offer = await prisma.offer.create({
    data: {
      conversationId: conversation.id,
      senderId: req.user.id,
      amount: Number(req.body.amount),
    },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });
  const receiverId =
    conversation.buyerId === req.user.id
      ? conversation.sellerId
      : conversation.buyerId;
  await prisma.conversationHidden.deleteMany({
    where: { conversationId: conversation.id, userId: receiverId },
  });
  const notification = await prisma.notification.create({
    data: {
      userId: receiverId,
      title: "New offer",
      message: `${req.user.name} sent you an offer`,
    },
  });
  emitToUser(receiverId, "notification:new", notification);
  emitToUser(receiverId, "offer:new", offer);
  res.status(201).json({ success: true, data: offer });
});

export const acceptOffer = asyncHandler(async (req, res) => {
  const offer = await prisma.offer.findUnique({
    where: { id: Number(req.params.id) },
    include: { conversation: true },
  });
  if (
    !offer ||
    ![offer.conversation.buyerId, offer.conversation.sellerId].includes(req.user.id)
  )
    throw new ApiError(403, "Forbidden");
  if (offer.senderId === req.user.id)
    throw new ApiError(400, "You cannot accept your own offer");

  const updatedOffer = await prisma.offer.update({
    where: { id: offer.id },
    data: { status: "ACCEPTED" },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });
  await prisma.offer.updateMany({
    where: {
      conversationId: offer.conversationId,
      id: { not: offer.id },
      status: "SENT",
    },
    data: { status: "SUPERSEDED" },
  });
  await prisma.conversation.update({
    where: { id: offer.conversationId },
    data: { updatedAt: new Date() },
  });

  const receiverId =
    offer.conversation.buyerId === req.user.id
      ? offer.conversation.sellerId
      : offer.conversation.buyerId;
  await prisma.conversationHidden.deleteMany({
    where: { conversationId: offer.conversationId, userId: receiverId },
  });
  const notification = await prisma.notification.create({
    data: {
      userId: receiverId,
      title: "Offer accepted",
      message: `${req.user.name} accepted your offer`,
    },
  });
  emitToUser(receiverId, "notification:new", notification);
  emitToUser(receiverId, "offer:accepted", updatedOffer);
  res.json({ success: true, data: updatedOffer });
});

export const rejectOffer = asyncHandler(async (req, res) => {
  const offer = await prisma.offer.findUnique({
    where: { id: Number(req.params.id) },
    include: { conversation: true },
  });
  if (
    !offer ||
    ![offer.conversation.buyerId, offer.conversation.sellerId].includes(req.user.id)
  )
    throw new ApiError(403, "Forbidden");
  if (offer.senderId === req.user.id)
    throw new ApiError(400, "You cannot reject your own offer");

  const updatedOffer = await prisma.offer.update({
    where: { id: offer.id },
    data: { status: "REJECTED" },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });
  await prisma.conversation.update({
    where: { id: offer.conversationId },
    data: { updatedAt: new Date() },
  });

  const receiverId =
    offer.conversation.buyerId === req.user.id
      ? offer.conversation.sellerId
      : offer.conversation.buyerId;
  await prisma.conversationHidden.deleteMany({
    where: { conversationId: offer.conversationId, userId: receiverId },
  });
  const notification = await prisma.notification.create({
    data: {
      userId: receiverId,
      title: "Offer rejected",
      message: `${req.user.name} rejected your offer`,
    },
  });
  emitToUser(receiverId, "notification:new", notification);
  emitToUser(receiverId, "offer:rejected", updatedOffer);
  res.json({ success: true, data: updatedOffer });
});