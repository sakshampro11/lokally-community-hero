import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp } from "firebase-admin/app";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

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
  const ext = path.extname(file.originalname).toLowerCase();
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
  const relativePath = `uploads/${safeName}`;

  if (adminApp) {
    try {
      const bucket = getAdminStorage(adminApp).bucket();
      const fileRef = bucket.file(relativePath);
      const downloadToken = randomUUID();

      // Upload the buffer to the GCS bucket with custom metadata for stable Firebase Storage download URL
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });

      // Try to set metadata explicitly to ensure it propagates correctly
      try {
        await fileRef.setMetadata({
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          }
        });
      } catch (metadataErr) {
        console.warn("[Firebase Storage] setMetadata custom token warning:", metadataErr);
      }

      // Return the stable, non-expiring Firebase Storage download URL
      return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(relativePath)}?alt=media&token=${downloadToken}`;
    } catch (adminError: any) {
      const errorMsg = adminError?.message || adminError || "Unauthorized / Storage Bucket Not Initialized";
      console.log(`[Firebase Storage] GCS Admin SDK upload bypassed (${errorMsg.slice(0, 150)}). Falling back to Web SDK...`);
    }
  }

  // Fallback to Web/Client SDK
  try {
    const storageRef = ref(storage, relativePath);
    const uint8 = new Uint8Array(file.buffer);
    await uploadBytes(storageRef, uint8, {
      contentType: file.mimetype,
    });
    return await getDownloadURL(storageRef);
  } catch (webError: any) {
    const errorMsg = webError?.message || webError || "Access Denied / Bucket Unavailable";
    console.log(`[Firebase Storage] Web SDK upload bypassed (${errorMsg.slice(0, 150)}). Saving file locally to /uploads/...`);
    try {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const localFilePath = path.join(uploadDir, safeName);
      fs.writeFileSync(localFilePath, file.buffer);
      console.log(`[Local Storage] Successfully saved file locally: /uploads/${safeName}`);
      return `/uploads/${safeName}`;
    } catch (fsError: any) {
      console.error("[Local Storage] Critical: Failed to write file to local disk:", fsError?.message || fsError);
      throw new Error("Failed to upload or store file: " + (webError?.message || String(webError)));
    }
  }
}

export async function migrateSignedUrlsToPermanent() {
  if (!adminApp) {
    console.log("[Migration] Skip: Firebase Admin not initialized.");
    return;
  }

  console.log("[Migration] Checking Firestore for expiring signed storage URLs to convert...");

  try {
    const bucket = getAdminStorage(adminApp).bucket();
    const bucketName = bucket.name;

    // Helper function to check and migrate a single URL if it is a GCS signed URL
    const migrateUrl = async (url: string): Promise<string> => {
      if (!url) return url;
      
      // Expiring signed URLs contain GoogleAccessId or X-Goog-Algorithm
      const isSigned = url.includes("GoogleAccessId=") || url.includes("X-Goog-Algorithm=");
      if (!isSigned) return url;

      // Extract relative path from url. It starts with uploads/
      const match = url.match(/(uploads\/[^?#\s]+)/);
      if (!match) return url;

      const relativePath = match[1];
      try {
        const fileRef = bucket.file(relativePath);
        const [exists] = await fileRef.exists();
        if (!exists) {
          console.warn(`[Migration] File does not exist in bucket: ${relativePath}`);
          return url;
        }

        // Generate permanent token and set it in metadata
        const downloadToken = randomUUID();
        await fileRef.setMetadata({
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          }
        });

        // Construct permanent Firebase Storage download URL
        const permanentUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(relativePath)}?alt=media&token=${downloadToken}`;
        console.log(`[Migration] Migrated signed URL to permanent URL for file: ${relativePath}`);
        return permanentUrl;
      } catch (err: any) {
        console.error(`[Migration] Failed to migrate file ${relativePath}:`, err?.message || err);
        return url;
      }
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
          mediaUrls: data.mediaUrls || [],
          statusHistory: data.statusHistory || [],
        });
        console.log(`[Migration] Updated issue document ${issueDoc.id} with permanent URLs.`);
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
          console.log(`[Migration] Updated user profile photo URL for user ${userDoc.id} to permanent URL.`);
        }
      }
    }

    console.log("[Migration] Migration check completed successfully.");
  } catch (err: any) {
    console.error("[Migration] Error during migration check:", err?.message || err);
  }
}
