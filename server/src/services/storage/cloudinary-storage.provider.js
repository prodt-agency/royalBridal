import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env.js";
import { InternalServerError, ValidationError } from "../../utils/app-error.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const cloudinaryRootFolder = "royal-bridal";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
  secure: true,
});

const validateImage = (file) => {
  if (!file?.buffer || !allowedMimeTypes.has(file.mimetype))
    throw new ValidationError("Only JPEG, PNG, and WebP images are allowed.");
  if (file.size > 5 * 1024 * 1024)
    throw new ValidationError("Image files must not exceed 5MB.");
};

export class CloudinaryStorageProvider {
  async upload(file, directory = "products") {
    validateImage(file);
    const safeDirectory = directory.replace(/[^a-z0-9/-]/gi, "");
    const folder = `${cloudinaryRootFolder}/${safeDirectory || "products"}`;
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (error, uploadResult) =>
          error ? reject(error) : resolve(uploadResult),
      );
      stream.end(file.buffer);
    }).catch(() => {
      throw new InternalServerError("Image upload failed. Please try again.");
    });

    if (!result?.secure_url || !result.public_id)
      throw new InternalServerError("Image upload failed. Please try again.");
    return {
      key: result.public_id,
      publicId: result.public_id,
      url: result.secure_url,
    };
  }

  async delete(publicId) {
    if (
      typeof publicId !== "string" ||
      !publicId.startsWith(`${cloudinaryRootFolder}/`)
    )
      throw new ValidationError("Invalid storage key.");
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      });
      if (result.result !== "ok" && result.result !== "not found")
        throw new Error(
          `Unexpected Cloudinary deletion result: ${result.result}`,
        );
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new InternalServerError("Image deletion failed. Please try again.");
    }
  }
}
