import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { collection, doc, getDoc, getDocs, query, where, limit, addDoc, updateDoc } from "firebase/firestore";
import { db, uploadFileToFirebaseStorage } from "./firebase";
import { authenticateToken, AuthenticatedRequest } from "./middleware";
import { upload } from "./upload";

const router = Router();

// Helper to find user by email
async function findUserByEmail(email: string) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email.trim().toLowerCase()), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  const userDoc = snapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() } as any;
}

// Normalize gamification fields
function normalizeUserGamification(user: any = {}) {
  return {
    points: Number.isFinite(user.points) ? user.points : 0,
    badges: Array.isArray(user.badges) ? user.badges : [],
    reportsCount: Number.isFinite(user.reportsCount) ? user.reportsCount : 0,
    verificationsCount: Number.isFinite(user.verificationsCount) ? user.verificationsCount : 0,
    resolvedReportsCount: Number.isFinite(user.resolvedReportsCount) ? user.resolvedReportsCount : 0,
    resolverIssuesResolved: Number.isFinite(user.resolverIssuesResolved) ? user.resolverIssuesResolved : 0,
  };
}

// POST /api/auth/register
router.post("/register", async (req: any, res: Response) => {
  try {
    const { name, email, phone, address, password, referredBy } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate points for the joining user
    // Standard starting points is 0. If referred, they get +5 XP
    let initialPoints = referredBy ? 5 : 0;

    // Check if this new registering email was already used as a referral code by others
    // and award them 10 points per successful referral!
    try {
      const qRef = query(collection(db, "users"), where("referredBy", "==", normalizedEmail));
      const refDocs = await getDocs(qRef);
      if (!refDocs.empty) {
        initialPoints += refDocs.size * 10;
      }
    } catch (e) {
      console.error("Error calculating past referrals:", e);
    }

    const newUser: any = {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null,
      password: hashedPassword,
      role: "citizen",
      points: initialPoints,
      badges: [],
      reportsCount: 0,
      verificationsCount: 0,
      resolvedReportsCount: 0,
      resolverIssuesResolved: 0,
      createdAt: new Date().toISOString()
    };

    if (referredBy) {
      newUser.referredBy = referredBy.trim().toLowerCase();
    }

    const docRef = await addDoc(collection(db, "users"), newUser);

    // Award referral points to the sender immediately if the sender already exists
    if (referredBy) {
      const trimmedRef = referredBy.trim().toLowerCase();
      try {
        let referrerDocId = null;
        let referrerCurrentPoints = 0;

        // Try as email first
        if (trimmedRef.includes("@")) {
          const rUser = await findUserByEmail(trimmedRef);
          if (rUser) {
            referrerDocId = rUser.id;
            referrerCurrentPoints = rUser.points || 0;
          }
        } else {
          // Try as user document ID
          const rDocRef = doc(db, "users", trimmedRef);
          const rDocSnap = await getDoc(rDocRef);
          if (rDocSnap.exists()) {
            referrerDocId = rDocSnap.id;
            referrerCurrentPoints = rDocSnap.data().points || 0;
          }
        }

        if (referrerDocId) {
          await updateDoc(doc(db, "users", referrerDocId), {
            points: referrerCurrentPoints + 10
          });
        }
      } catch (e) {
        console.error("Error rewarding referrer:", e);
      }
    }

    const token = jwt.sign(
      { userId: docRef.id },
      process.env.JWT_SECRET || "community-hero-secret-key"
    );

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: docRef.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        role: "citizen",
        points: newUser.points,
        photoUrl: null,
        badges: [],
        reportsCount: 0,
        verificationsCount: 0,
        resolvedReportsCount: 0,
        resolverIssuesResolved: 0,
      },
    });
  } catch (error: any) {
    console.error("Error in registration:", error);
    return res.status(500).json({ message: "Error creating account", error: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "community-hero-secret-key"
    );

    const normalized = normalizeUserGamification(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        address: user.address || null,
        role: user.role || "citizen",
        points: normalized.points,
        photoUrl: user.photoUrl || null,
        badges: normalized.badges,
        reportsCount: normalized.reportsCount,
        verificationsCount: normalized.verificationsCount,
        resolvedReportsCount: normalized.resolvedReportsCount,
        resolverIssuesResolved: normalized.resolverIssuesResolved,
      },
    });
  } catch (error: any) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userDoc.data();
    const normalized = normalizeUserGamification(user);

    return res.json({
      id: userDoc.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      address: user.address || null,
      role: user.role || "citizen",
      points: normalized.points,
      photoUrl: user.photoUrl || null,
      badges: normalized.badges,
      reportsCount: normalized.reportsCount,
      verificationsCount: normalized.verificationsCount,
      resolvedReportsCount: normalized.resolvedReportsCount,
      resolverIssuesResolved: normalized.resolverIssuesResolved,
    });
  } catch (error: any) {
    console.error("Error in fetching profile:", error);
    return res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
});

// PUT /api/auth/me
router.put("/me", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, phone, address, photoUrl } = req.body;
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (typeof name === "string") updates.name = name.trim() || null;
    if (typeof phone === "string") updates.phone = phone.trim() || null;
    if (typeof address === "string") updates.address = address.trim() || null;
    if (photoUrl === null || typeof photoUrl === "string") updates.photoUrl = photoUrl;

    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    await updateDoc(userDocRef, updates);

    const updatedDoc = await getDoc(userDocRef);
    const updated = updatedDoc.data() || {};
    const normalized = normalizeUserGamification(updated);

    return res.json({
      id: updatedDoc.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone || null,
      address: updated.address || null,
      role: updated.role || "citizen",
      points: normalized.points,
      photoUrl: updated.photoUrl || null,
      badges: normalized.badges,
      reportsCount: normalized.reportsCount,
      verificationsCount: normalized.verificationsCount,
      resolvedReportsCount: normalized.resolvedReportsCount,
      resolverIssuesResolved: normalized.resolverIssuesResolved,
    });
  } catch (error: any) {
    console.error("Error in updating profile:", error);
    return res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

// POST /api/auth/upload-photo
router.post("/upload-photo", authenticateToken as any, upload.single("photo"), async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No photo file provided" });
    }

    const photoUrl = await uploadFileToFirebaseStorage(req.file);
    return res.json({ photoUrl });
  } catch (error: any) {
    console.error("Error in uploading profile photo:", error);
    return res.status(500).json({ message: "Error uploading profile photo", error: error.message });
  }
});

// GET /api/auth/leaderboard
router.get("/leaderboard", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get current user to know their role
    const curUserDoc = await getDoc(doc(db, "users", userId));
    if (!curUserDoc.exists()) {
      return res.status(404).json({ message: "User not found" });
    }
    const currentUserRole = curUserDoc.data().role || "citizen";

    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const list = snapshot.docs
      .map((doc) => {
        const data = doc.data() || {};
        const normalized = normalizeUserGamification(data);
        return {
          id: doc.id,
          name: data.name || "Anonymous Citizen",
          email: data.email || "",
          role: data.role || "citizen",
          points: normalized.points,
          badges: normalized.badges,
          reportsCount: normalized.reportsCount,
          verificationsCount: normalized.verificationsCount,
          resolvedReportsCount: normalized.resolvedReportsCount,
          resolverIssuesResolved: normalized.resolverIssuesResolved,
        };
      })
      .filter((u) => u.role === currentUserRole);

    // Sort by points descending
    list.sort((a, b) => b.points - a.points);
    return res.json(list);
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
  }
});

export default router;
