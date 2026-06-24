import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/apiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "../..");
const uploadsRoot = path.join(serverRoot, "uploads");

const extensionFrom = (file) => {
  const ext = path.extname(file.originalname || "");
  if (ext) return ext.toLowerCase();
  const subtype = file.mimetype?.split("/")?.[1] || "jpg";
  return `.${subtype === "jpeg" ? "jpg" : subtype}`;
};

const safeFolder = (folder = "general") =>
  folder
    .replace(/^quickdeal[\\/]/, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .replace(/\\/g, "/");

export const saveUploadedImage = async (file, folder = "general") => {
  if (!file?.buffer) throw new ApiError(400, "File is required");

  const targetFolder = safeFolder(folder);
  const absoluteDir = path.join(uploadsRoot, targetFolder);
  await fs.mkdir(absoluteDir, { recursive: true });

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensionFrom(file)}`;
  const absolutePath = path.join(absoluteDir, filename);
  await fs.writeFile(absolutePath, file.buffer);

  return `/uploads/${targetFolder}/${filename}`;
};
