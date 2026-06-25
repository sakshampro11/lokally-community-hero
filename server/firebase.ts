import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp } from "firebase-admin/app";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import * as fs from "fs";
import * as path from "path";

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

      // Upload the buffer to the GCS bucket
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Try to make public to get standard high-speed URL
      try {
        await fileRef.makePublic();
        return `https://storage.googleapis.com/${bucket.name}/${relativePath}`;
      } catch (publicError) {
        // Fallback to getSignedUrl if UBLA is enabled
        console.warn("makePublic failed, attempting getSignedUrl:", publicError);
        try {
          const [url] = await fileRef.getSignedUrl({
            action: "read",
            expires: "03-09-2491", // far future expiration
          });
          return url;
        } catch (signedError) {
          console.warn("getSignedUrl failed, falling back to public URL format:", signedError);
          // Fallback to standard Firebase URL format
          return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(relativePath)}?alt=media`;
        }
      }
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
