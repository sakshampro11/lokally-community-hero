import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp } from "firebase-admin/app";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import { uploadToCloudinary } from "./cloudinary";


// Load configuration from firebase-applet-config.json
let firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
let firestoreDatabaseId: string | undefined = undefined;

try {
  const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw);
    firebaseConfig = {
      apiKey: parsed.apiKey || "",
      authDomain: parsed.authDomain || "",
      projectId: parsed.projectId || "",
      storageBucket: parsed.storageBucket || "",
      messagingSenderId: parsed.messagingSenderId || "",
      appId: parsed.appId || ""
    };
    if (parsed.firestoreDatabaseId) {
      firestoreDatabaseId = parsed.firestoreDatabaseId;
    }
  } else {
    console.warn("firebase-applet-config.json not found. Using empty config.");
  }
} catch (error) {
  console.error("Error reading firebase-applet-config.json:", error);
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);
export const storage = getStorage(app);

// Initialize Firebase Admin safely
let adminApp: any = null;
try {
  if (getAdminApps().length === 0) {
    adminApp = initializeAdminApp({
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
    });
  } else {
    adminApp = getAdminApp();
  }
} catch (error) {
  console.error("Failed to initialize firebase-admin:", error);
}

export async function uploadFileToFirebaseStorage(file: any): Promise<string> {
  // 1. Try uploading to Cloudinary first (Primary, permanent free media storage solution)
  try {
    const url = await uploadToCloudinary(file);
    return url;
  } catch (cloudinaryError: any) {
    console.warn("[Cloudinary] Upload failed/unconfigured. Trying Firebase Storage fallback...", cloudinaryError?.message || cloudinaryError);
  }

  // 2. Secondary fallback: Firebase Storage via Admin SDK (Permanent Cloud Storage)
  if (adminApp && firebaseConfig.storageBucket) {
    try {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = `issues/${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
      const bucket = getAdminStorage(adminApp).bucket();
      const fileRef = bucket.file(safeName);
      const uuid = randomUUID();
      
      console.log(`[Firebase Storage Admin] Attempting upload of ${safeName}...`);
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype || "image/jpeg",
          metadata: {
            firebaseStorageDownloadTokens: uuid
          }
        }
      });
      
      const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(safeName)}?alt=media&token=${uuid}`;
      console.log(`[Firebase Storage Admin] Upload succeeded with permanent Firebase Storage download URL: ${downloadUrl}`);
      return downloadUrl;
    } catch (fbStorageError: any) {
      console.error("[Firebase Storage Admin] Failed fallback upload:", fbStorageError?.message || fbStorageError);
    }
  } else {
    console.warn("[Firebase Storage Admin] Skipping fallback because Firebase Admin or storageBucket is not configured.");
  }

  // 3. Robust Permanent Fallback: Convert to small compressed base64 URI using Jimp
  // (This is stored inside the Firestore document directly, making it 100% durable and immune to container restarts!)
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    // Only compress and base64-encode image files
    const isImage = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"].includes(ext);
    if (isImage) {
      console.log(`[Jimp Fallback] Compressing image ${file.originalname} into base64 for Firestore storage...`);
      const { Jimp } = await import("jimp");
      const image = await Jimp.read(file.buffer);
      
      // Get dimensions safely across Jimp versions
      const width = image.bitmap ? image.bitmap.width : (image as any).width || 1000;
      const height = image.bitmap ? image.bitmap.height : (image as any).height || 1000;
      
      if (width > 800 || height > 800) {
        const ratio = width / height;
        const targetWidth = ratio > 1 ? 800 : Math.round(800 * ratio);
        const targetHeight = ratio > 1 ? Math.round(800 / ratio) : 800;
        
        if (typeof (image as any).resize === "function") {
          try {
            await (image as any).resize({ w: targetWidth, h: targetHeight });
          } catch (e) {
            await (image as any).resize(targetWidth, targetHeight);
          }
        }
      }
      
      // Set compression quality if supported
      if (typeof (image as any).quality === "function") {
        try {
          await (image as any).quality(75);
        } catch (e) {}
      }
      
      let base64Data: string;
      if (typeof (image as any).getBase64Async === "function") {
        base64Data = await (image as any).getBase64Async("image/jpeg");
      } else {
        base64Data = await (image as any).getBase64("image/jpeg");
      }
      
      console.log(`[Jimp Fallback] Successfully generated compressed base64 data URI (${Math.round(base64Data.length / 1024)} KB)`);
      return base64Data;
    }
  } catch (jimpError: any) {
    console.error("[Jimp Fallback] Failed to compress image with Jimp:", jimpError?.message || jimpError);
  }

  // 4. Local fallback as a last resort (will be lost if container restarts/redeploys)
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const localFilePath = path.join(uploadDir, safeName);
    fs.writeFileSync(localFilePath, file.buffer);
    console.warn(`[Local Storage] Saved file locally (TEMPORARY - will be lost on container restart): /uploads/${safeName}`);
    return `/uploads/${safeName}`;
  } catch (fsError: any) {
    console.error("[Local Storage] Critical: Failed to write file to local disk:", fsError?.message || fsError);
    throw new Error("Failed to upload to Cloudinary, Firebase Storage, Jimp Base64, and local disk fallback: " + (fsError?.message || String(fsError)));
  }
}

export async function migrateSignedUrlsToPermanent() {
  console.log("[Migration] Checking Firestore for broken local paths and expiring signed storage URLs to convert...");

  try {
    const migrateUrl = async (url: string): Promise<string> => {
      if (!url || url === "null" || url === "undefined") return url;

      // Case 1: Local /uploads/... path (which is now broken because container restarted/redeployed)
      if (url.startsWith("/uploads/")) {
        const filename = url.replace("/uploads/", "");
        const filepath = path.join(process.cwd(), "uploads", filename);
        
        if (fs.existsSync(filepath)) {
          console.log(`[Migration] Local file found: ${filename}. Migrating to Cloudinary...`);
          try {
            const fileBuffer = fs.readFileSync(filepath);
            const ext = path.extname(filename).toLowerCase();
            let mimeType = "image/jpeg";
            if (ext === ".png") mimeType = "image/png";
            else if (ext === ".webp") mimeType = "image/webp";
            else if (ext === ".gif") mimeType = "image/gif";

            const uploadedUrl = await uploadFileToFirebaseStorage({
              buffer: fileBuffer,
              mimetype: mimeType,
              originalname: filename
            });

            // Clean up migrated local file to save space only if upload was to an external permanent URL
            if (uploadedUrl && !uploadedUrl.startsWith("/uploads/")) {
              try {
                fs.unlinkSync(filepath);
              } catch (_) {}
            }

            return uploadedUrl;
          } catch (err: any) {
            console.error(`[Migration] Failed to migrate local file ${filename}:`, err?.message || err);
            return url; // Keep original for retry
          }
        } else {
          console.log(`[Migration] Local file ${filename} is missing on disk. Keeping original URL to avoid database corruption.`);
          return url; // Keep original to avoid database corruption
        }
      }

      // Case 2: Firebase Storage/GCS URL (signed or permanent)
      // Since Firebase Storage is disabled/unusable under Spark, download and migrate them to Cloudinary
      const isFirebaseStorage = url.includes("firebasestorage.googleapis.com") || url.includes("GoogleAccessId=") || url.includes("X-Goog-Algorithm=");
      if (isFirebaseStorage) {
        console.log(`[Migration] Found Firebase Storage / GCS URL: ${url}. Migrating to Cloudinary...`);
        try {
          const fetchRes = await fetch(url);
          if (fetchRes.ok) {
            const arrayBuffer = await fetchRes.arrayBuffer();
            const fileBuffer = Buffer.from(arrayBuffer);
            const ext = path.extname(new URL(url).pathname).toLowerCase() || ".jpg";
            let mimeType = "image/jpeg";
            if (ext === ".png") mimeType = "image/png";
            else if (ext === ".webp") mimeType = "image/webp";

            const uploadedUrl = await uploadFileToFirebaseStorage({
              buffer: fileBuffer,
              mimetype: mimeType,
              originalname: `migrated-${Date.now()}${ext}`
            });
            return uploadedUrl;
          } else {
            console.warn(`[Migration] Firebase Storage URL returned status ${fetchRes.status}. Keeping original URL.`);
            return url;
          }
        } catch (err: any) {
          console.error(`[Migration] Failed to migrate GCS URL to Cloudinary:`, err?.message || err);
          return url;
        }
      }

      return url;
    };

    // 1. Migrate issues collection
    const issuesRef = collection(db, "issues");
    const issuesSnap = await getDocs(issuesRef);
    console.log(`[Migration] Found ${issuesSnap.size} issues to check.`);

    for (const issueDoc of issuesSnap.docs) {
      const data = issueDoc.data();
      let updated = false;

      // Check mediaUrls
      let mediaUrls = data.mediaUrls || [];
      if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
        const newMediaUrls = [];
        for (const url of mediaUrls) {
          const migrated = await migrateUrl(url);
          if (migrated !== url) {
            updated = true;
          }
          newMediaUrls.push(migrated);
        }
        if (updated) {
          data.mediaUrls = newMediaUrls;
          data.mediaUrl = newMediaUrls[0] || null;
        }
      }

      // Check direct mediaUrl if mediaUrls wasn't updated but direct mediaUrl starts with /uploads/ or GCS
      if (data.mediaUrl && !updated) {
        const migrated = await migrateUrl(data.mediaUrl);
        if (migrated !== data.mediaUrl) {
          updated = true;
          data.mediaUrl = migrated;
        }
      }

      // Check statusHistory
      let statusHistory = data.statusHistory || [];
      if (Array.isArray(statusHistory) && statusHistory.length > 0) {
        const newHistory = [];
        for (const entry of statusHistory) {
          let entryUpdated = false;
          let entryMediaUrls = entry.mediaUrls || [];
          if (Array.isArray(entryMediaUrls) && entryMediaUrls.length > 0) {
            const newEntryMediaUrls = [];
            for (const url of entryMediaUrls) {
              const migrated = await migrateUrl(url);
              if (migrated !== url) {
                entryUpdated = true;
                updated = true;
              }
              newEntryMediaUrls.push(migrated);
            }
            if (entryUpdated) {
              entry.mediaUrls = newEntryMediaUrls;
            }
          }
          newHistory.push(entry);
        }
        if (updated) {
          data.statusHistory = newHistory;
        }
      }

      if (updated) {
        await updateDoc(doc(db, "issues", issueDoc.id), {
          mediaUrl: data.mediaUrl || null,
          mediaUrls: data.mediaUrls || [],
          statusHistory: data.statusHistory || [],
        });
        console.log(`[Migration] Updated issue document ${issueDoc.id} with migrated URLs.`);
      }
    }

    // 2. Migrate users collection for photoUrl
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);
    console.log(`[Migration] Found ${usersSnap.size} users to check.`);

    for (const userDoc of usersSnap.docs) {
      const data = userDoc.data();
      const photoUrl = data.photoUrl;
      if (photoUrl) {
        const migrated = await migrateUrl(photoUrl);
        if (migrated !== photoUrl) {
          await updateDoc(doc(db, "users", userDoc.id), {
            photoUrl: migrated,
          });
          console.log(`[Migration] Updated user profile photo URL for user ${userDoc.id} to migrated URL.`);
        }
      }
    }

    console.log("[Migration] Cloudinary migration check completed successfully.");
  } catch (err: any) {
    console.error("[Migration] Error during migration check:", err?.message || err);
  }
}
