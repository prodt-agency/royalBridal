import { CloudinaryStorageProvider } from "./cloudinary-storage.provider.js";

const provider = new CloudinaryStorageProvider();
export const storage = Object.freeze({
  upload: (file, directory) => provider.upload(file, directory),
  delete: (key) => provider.delete(key),
});