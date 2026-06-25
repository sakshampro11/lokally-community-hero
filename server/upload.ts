import multer from "multer";
import * as path from "path";
import * as fs from "fs";

// Ensure the uploads directory exists in the workspace
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
]);

const storage = multer.memoryStorage();

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false); // Reject gracefully, or we can pass an error to cb
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB per file
    files: 5, // max 5 files per request
  },
});
