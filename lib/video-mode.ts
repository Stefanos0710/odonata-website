import { storageMode } from "./storage";

/** How video files can be uploaded: to Vercel Blob (live site), to this computer (local dev), or not at all. */
export type VideoMode = "blob" | "local" | "none";

export const videoMode: VideoMode = process.env.BLOB_READ_WRITE_TOKEN ? "blob" : storageMode === "local" ? "local" : "none";
