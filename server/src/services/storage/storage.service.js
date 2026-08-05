import { LocalStorageProvider } from './local-storage.provider.js';
const provider = new LocalStorageProvider();
export const storage = Object.freeze({ upload: (file, directory) => provider.upload(file, directory), delete: (key) => provider.delete(key) });
