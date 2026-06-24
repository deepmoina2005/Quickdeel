import { prisma } from "../config/prisma.js";
import { saveUploadedImage } from "../services/upload.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { listings: true } } },
    orderBy: { name: "asc" },
  });
  res.json({
    success: true,
    data: categories.map(({ _count, ...category }) => ({
      ...category,
      count: _count.listings,
    })),
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const image = req.file
    ? await saveUploadedImage(req.file, "categories")
    : req.body.image;
  const category = await prisma.category.create({
    data: { name: req.body.name, image },
  });
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const image = req.file
    ? await saveUploadedImage(req.file, "categories")
    : req.body.image;
  const category = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: { ...req.body, image },
  });
  res.json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, message: "Category deleted" });
});
