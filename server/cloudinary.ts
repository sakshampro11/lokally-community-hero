import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

export function configureCloudinary() {
  if (isConfigured) return true;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("[Cloudinary] Credentials missing. Cloudinary uploads will be bypassed.");
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
  if (!configured) {
    throw new Error("Cloudinary environment variables are missing (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Please add them to your environment secrets.");
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
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
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
