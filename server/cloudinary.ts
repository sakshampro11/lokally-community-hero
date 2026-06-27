import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;
let isBroken = false;

export function configureCloudinary() {
  if (isBroken) return false;
  if (isConfigured) return true;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret || cloudName.includes("your_") || apiKey.includes("your_") || apiSecret.includes("your_")) {
    console.warn("[Cloudinary] Credentials missing or generic placeholder detected. Cloudinary uploads will be bypassed.");
    isBroken = true;
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
  console.log("[Cloudinary] Configured successfully on cloud:", cloudName);
  return true;
}

/**
 * Uploads a file buffer directly to Cloudinary and returns its secure URL.
 */
export async function uploadToCloudinary(file: { buffer: Buffer; mimetype: string; originalname: string }): Promise<string> {
  const configured = configureCloudinary();
  if (!configured || isBroken) {
    throw new Error("Cloudinary is unconfigured, using placeholders, or has failed previously.");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "lokally_civic",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("[Cloudinary] Upload stream error:", error);
          const errMsg = error.message || String(error);
          if (error.http_code === 403 || error.http_code === 401 || errMsg.includes("403") || errMsg.includes("credentials") || errMsg.includes("key")) {
            console.warn("[Cloudinary] Cloudinary returned 403/credential error. Marking Cloudinary as unavailable.");
            isBroken = true;
          }
          reject(new Error(`Cloudinary upload failed: ${error.message || errMsg}`));
        } else if (result && result.secure_url) {
          console.log("[Cloudinary] Upload succeeded. Secure URL:", result.secure_url);
          resolve(result.secure_url);
        } else {
          reject(new Error("Cloudinary upload succeeded but did not return a secure URL."));
        }
      }
    );

    stream.end(file.buffer);
  });
}
