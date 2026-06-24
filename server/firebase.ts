import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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
