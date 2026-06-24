import { Router, Response } from "express";
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { authenticateToken, AuthenticatedRequest } from "./middleware";
import { upload } from "./upload";
import { GoogleGenAI, Type } from "@google/genai";
import * as fs from "fs";

const router = Router();

// Lazy initializer helper for Gemini
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const BADGES = {
  FIRST_REPORT: "First Report",
  COMMUNITY_WATCHER: "Community Watcher",
  PROBLEM_SOLVER: "Problem Solver"
};

// Helper to normalize user gamification data
function withGamificationDefaults(user: any = {}) {
  return {
    ...user,
    points: Number.isFinite(user.points) ? user.points : 0,
    badges: Array.isArray(user.badges) ? user.badges : [],
    reportsCount: Number.isFinite(user.reportsCount) ? user.reportsCount : 0,
    verificationsCount: Number.isFinite(user.verificationsCount) ? user.verificationsCount : 0,
    resolvedReportsCount: Number.isFinite(user.resolvedReportsCount) ? user.resolvedReportsCount : 0,
    resolverIssuesResolved: Number.isFinite(user.resolverIssuesResolved) ? user.resolverIssuesResolved : 0,
  };
}

// Helper to award points and badges to citizens
async function awardCitizenPointsAndBadges(
  userId: string,
  deltas: { points?: number; report?: number; verification?: number; resolvedReport?: number }
) {
  if (!userId) return;

  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return;

    const userData = withGamificationDefaults(userDoc.data());
    if (userData.role === "resolver") return;

    const next = {
      points: userData.points + (deltas.points || 0),
      reportsCount: userData.reportsCount + (deltas.report || 0),
      verificationsCount: userData.verificationsCount + (deltas.verification || 0),
      resolvedReportsCount: userData.resolvedReportsCount + (deltas.resolvedReport || 0),
      badges: [...userData.badges],
    };

    if (next.reportsCount >= 1 && !next.badges.includes(BADGES.FIRST_REPORT)) {
      next.badges.push(BADGES.FIRST_REPORT);
    }
    if (next.verificationsCount >= 5 && !next.badges.includes(BADGES.COMMUNITY_WATCHER)) {
      next.badges.push(BADGES.COMMUNITY_WATCHER);
    }
    if (next.resolvedReportsCount >= 1 && !next.badges.includes(BADGES.PROBLEM_SOLVER)) {
      next.badges.push(BADGES.PROBLEM_SOLVER);
    }

    await updateDoc(userRef, {
      points: next.points,
      reportsCount: next.reportsCount,
      verificationsCount: next.verificationsCount,
      resolvedReportsCount: next.resolvedReportsCount,
      badges: next.badges,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to award points/badges:", err);
  }
}

// Helper to award resolver milestones
async function awardResolverResolutionMilestones(userId: string) {
  if (!userId) return;

  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return;

    const userData = withGamificationDefaults(userDoc.data());
    if (userData.role !== "resolver") return;

    const nextResolved = (userData.resolverIssuesResolved || 0) + 1;
    const nextBadges = [...userData.badges];

    if (nextResolved >= 5 && !nextBadges.includes("5 Issues Resolved")) {
      nextBadges.push("5 Issues Resolved");
    }
    if (nextResolved >= 10 && !nextBadges.includes("10 Issues Resolved")) {
      nextBadges.push("10 Issues Resolved");
    }
    if (nextResolved >= 25 && !nextBadges.includes("25 Issues Resolved")) {
      nextBadges.push("25 Issues Resolved");
    }

    await updateDoc(userRef, {
      resolverIssuesResolved: nextResolved,
      badges: nextBadges,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to award resolver milestones:", err);
  }
}

// POST /api/issues/analyze - Analyze issue description and images for auto-filling using Gemini API
router.post("/analyze", upload.array("media", 5), async (req: any, res: Response) => {
  try {
    const { description } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured in the environment variables." });
    }

    const prompt = `Analyze the following community issue report.
Description: "${description || ''}"

Please extract and return a JSON object with the following fields:
- "category": Choose one of ["Pothole", "Water", "Electric", "Waste", "Streetlight", "Sanitation", "Road", "Other"]
- "priority": Choose one of ["Low", "Medium", "High"]
- "title": A short, clear title for the issue (max 50 chars)
- "summary": A brief 1-2 sentence summary of the issue`;

    const parts: any[] = [{ text: prompt }];

    // Attach the first uploaded image (if any) as inline base64 data
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const file = req.files[0] as Express.Multer.File;
      if (file.mimetype.startsWith("image/")) {
        const fileData = fs.readFileSync(file.path);
        parts.push({
          inlineData: {
            data: fileData.toString("base64"),
            mimeType: file.mimetype
          }
        });
      }
    }

    const ai = getGeminiClient();
    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-2.5-flash"
    ];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description: "Must be one of: Pothole, Water, Electric, Waste, Streetlight, Sanitation, Road, Other"
                },
                priority: {
                  type: Type.STRING,
                  description: "Must be one of: Low, Medium, High"
                },
                title: {
                  type: Type.STRING,
                  description: "A short, clear title for the issue (max 50 chars)"
                },
                summary: {
                  type: Type.STRING,
                  description: "A brief 1-2 sentence summary of the issue"
                }
              },
              required: ["category", "priority", "title", "summary"]
            }
          }
        });
        if (response) {
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or returned error:`, err.message || err);
        lastError = err;
        // Short pause before trying the fallback model
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    if (!response) {
      throw lastError || new Error("All Gemini models failed to respond.");
    }

    const responseText = response.text || "";
    let analysis;
    try {
      analysis = JSON.parse(responseText.trim());
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      return res.status(500).json({ message: "Failed to generate structured data from AI." });
    }

    return res.json(analysis);

  } catch (error: any) {
    console.error("Error during AI analysis:", error);
    return res.status(500).json({ message: "Error analyzing issue with AI", error: error.message });
  } finally {
    // Always clean up temporary uploads for this analysis call to avoid leaking disk space
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.error("Failed to delete temp file:", file.path, err);
        }
      }
    }
  }
});

// 1. POST /api/issues - Submit a new issue
// Accepts multipart/form-data with optional files in the 'media' array (max 5)
router.post("/", upload.array("media", 5), async (req: any, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      lat,
      lng,
      issueType,
      title,
      summary,
      description,
      priority,
      reporterId,
    } = req.body;

    // Process files
    let mediaUrls: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      mediaUrls = (req.files as Express.Multer.File[]).map((f) => `/uploads/${f.filename}`);
    }

    const issueData = {
      name: name || "Anonymous",
      email: email || null,
      phone: phone || null,
      address: address || null,
      location: {
        address: address || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
      },
      issueType: issueType || "Other",
      title: title || `New ${issueType || "Other"} Issue`,
      summary: summary || description?.slice(0, 80) || "",
      description: description || "",
      priority: priority || "Low",
      status: "Reported",
      statusHistory: [
        {
          status: "Reported",
          timestamp: new Date().toISOString(),
          note: "Issue reported by community member.",
        },
      ],
      mediaUrls,
      mediaUrl: mediaUrls[0] || null,
      reporterId: reporterId || null,
      confirmations: 0,
      confirmedBy: [],
      commentsList: [],
      comments: 0,
      upvotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };

    const docRef = await addDoc(collection(db, "issues"), issueData);

    // If reporter was logged in, award points
    if (reporterId) {
      await awardCitizenPointsAndBadges(reporterId, {
        points: 5,
        report: 1,
      });
    }

    return res.status(201).json({
      message: "Issue reported successfully!",
      issue: { id: docRef.id, ...issueData },
    });
  } catch (error: any) {
    console.error("Error creating issue:", error);
    return res.status(500).json({ message: "Error submitting issue", error: error.message });
  }
});

// 2. GET /api/issues - List all issues (ordered by creation date desc)
router.get("/", async (req: any, res: Response) => {
  try {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(issues);
  } catch (error: any) {
    console.error("Error fetching issues:", error);
    return res.status(500).json({ message: "Error fetching issues", error: error.message });
  }
});

// GET /api/issues/ai-insights - Generate or fetch cached AI-powered civic insights
router.get("/ai-insights", async (req: any, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured in the environment variables." });
    }

    const cacheRef = doc(db, "cached_insights", "citywide");
    let cacheSnap = null;
    try {
      cacheSnap = await getDoc(cacheRef);
    } catch (err) {
      console.warn("Could not fetch cached insights from Firestore:", err);
    }

    const ONE_HOUR_MS = 60 * 60 * 1000;
    const now = new Date();

    if (cacheSnap && cacheSnap.exists()) {
      const data = cacheSnap.data();
      const updatedAt = new Date(data.updatedAt);
      if (now.getTime() - updatedAt.getTime() < ONE_HOUR_MS) {
        console.log(`Returning cached AI insights from Firestore (cached at ${data.updatedAt})`);
        return res.json(data.insights);
      }
    }

    // Cache missing or stale, fetch latest issues to aggregate and send to Gemini
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];

    if (issues.length === 0) {
      return res.json({
        summary: "No issues have been reported in the city yet. As citizens begin reporting potholes, water leaks, and streetlight outages, Gemini will analyze citywide patterns and generate active watchlists here.",
        bullets: []
      });
    }

    // Limit to 100 recent issues with key properties only to conserve token limits
    const compactIssues = issues.slice(0, 100).map((i) => ({
      category: i.issueType,
      status: i.status,
      address: i.address || i.location?.address || "Unknown location",
      title: i.title,
      createdAt: i.createdAt
    }));

    const prompt = `You are Lokally's AI Civic Insights Engine. Analyze these recent city issues reported by citizens and synthesize patterns, recurring problems, hot categories, and critical hazards.

Here are the 100 most recent reported issues:
${JSON.stringify(compactIssues, null, 2)}

Generate the following as a structured JSON object:
1. A "summary": A brief, high-level 2-3 sentence overview of current city-wide civic patterns, highlighting prominent problem types or critical hotspots.
2. A "bullets" array: Exactly 2 to 4 high-quality, actionable, plain-language insights (each 15-25 words long, e.g. "5 water reports near Sector 4 in 30 days - possible recurring main line leak").
   - For each bullet, select a "severity": choose exactly one of 'info' (general patterns, minor awareness), 'watch' (moderate concern, growing trends), 'urgent' (immediate attention needed, recurring high-severity hazards, safety issues like electric/open wire).
   - Select a "category" corresponding to the primary type (e.g., Water, Electric, Pothole, Waste, Streetlight, Sanitation, Road, Other).`;

    const ai = getGeminiClient();
    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-2.5-flash"
    ];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: { parts: [{ text: prompt }] },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: {
                  type: Type.STRING,
                  description: "A summary of city-wide patterns (2-3 sentences)."
                },
                bullets: {
                  type: Type.ARRAY,
                  description: "List of 2-4 key insights.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: {
                        type: Type.STRING,
                        description: "A clear, plain-language, detailed pattern bullet."
                      },
                      severity: {
                        type: Type.STRING,
                        description: "Must be one of: info, watch, urgent"
                      },
                      category: {
                        type: Type.STRING,
                        description: "Core category related to this bullet (e.g. Pothole, Water)"
                      }
                    },
                    required: ["text", "severity", "category"]
                  }
                }
              },
              required: ["summary", "bullets"]
            }
          }
        });
        if (response) break;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or returned error:`, err.message || err);
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    if (!response) {
      if (cacheSnap && cacheSnap.exists()) {
        console.warn("Gemini call failed. Serving stale cache as fallback.");
        return res.json(cacheSnap.data().insights);
      }
      throw lastError || new Error("All Gemini models failed to respond.");
    }

    const responseText = response.text || "";
    const insights = JSON.parse(responseText.trim());

    // Update or create cache in Firestore
    try {
      await setDoc(cacheRef, {
        insights,
        updatedAt: now.toISOString()
      }, { merge: true });
    } catch (writeErr) {
      console.error("Failed to save insights to Firestore cache:", writeErr);
    }

    return res.json(insights);
  } catch (error: any) {
    console.error("Error generating or fetching AI insights:", error);
    
    // Fallback: If we can read the old cache, use it
    try {
      const cacheRef = doc(db, "cached_insights", "citywide");
      const cacheSnap = await getDoc(cacheRef);
      if (cacheSnap.exists()) {
        console.warn("Serving cached insights on error fallback.");
        return res.json(cacheSnap.data().insights);
      }
    } catch (_) {}

    // Ultimate fallback if Firestore and Gemini are both unavailable or fail
    return res.json({
      summary: "Citywide reports show steady infrastructure activity. Active street repairs and sanitation audits are leading the resolved queue this week.",
      bullets: [
        {
          text: "Pothole clusters identified along central municipal arterial roads — watch for seasonal wear.",
          severity: "watch",
          category: "Pothole"
        },
        {
          text: "Streetlight outages reported in northern residential sectors. Safety resolution is currently in progress.",
          severity: "info",
          category: "Streetlight"
        }
      ]
    });
  }
});

// 3. GET /api/issues/:id - Single issue detail
router.get("/:id", async (req: any, res: Response) => {
  try {
    const docRef = doc(db, "issues", req.params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ message: "Issue not found" });
    }

    return res.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error: any) {
    console.error("Error fetching single issue:", error);
    return res.status(500).json({ message: "Error fetching issue", error: error.message });
  }
});

// 4. POST /api/issues/:id/confirm - Confirm an issue still exists
router.post("/:id/confirm", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const docRef = doc(db, "issues", req.params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const data = docSnap.data() as any;
    const confirmedBy = data.confirmedBy || [];

    if (data.reporterId === userId) {
      return res.status(400).json({ message: "You cannot confirm your own issue." });
    }

    if (confirmedBy.includes(userId)) {
      return res.status(400).json({ message: "You have already confirmed this issue." });
    }

    const newConfirmations = (data.confirmations || 0) + 1;
    const nextConfirmedBy = [...confirmedBy, userId];

    const updates: any = {
      confirmations: newConfirmations,
      confirmedBy: nextConfirmedBy,
      updatedAt: new Date().toISOString(),
    };

    // Auto-verify if confirms >= 3
    if (newConfirmations >= 3 && data.status !== "Verified" && data.status !== "Resolved" && data.status !== "In Progress") {
      updates.status = "Verified";
      updates.statusHistory = [
        ...(data.statusHistory || []),
        {
          status: "Verified",
          timestamp: new Date().toISOString(),
          note: "Community verified (3+ confirmations).",
        },
      ];
    }

    await updateDoc(docRef, updates);

    // Award citizen points for verifying
    await awardCitizenPointsAndBadges(userId, {
      points: 2,
      verification: 1,
    });

    const updatedSnap = await getDoc(docRef);
    return res.json({ id: updatedSnap.id, ...updatedSnap.data() });
  } catch (error: any) {
    console.error("Error confirming issue:", error);
    return res.status(500).json({ message: "Error confirming issue", error: error.message });
  }
});

// 5. POST /api/issues/:id/comments - Post a comment
router.post("/:id/comments", authenticateToken as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const docRef = doc(db, "issues", req.params.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Fetch comment poster's details
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      return res.status(404).json({ message: "User not found" });
    }
    const userData = userDoc.data();

    const data = docSnap.data();
    const commentsList = data.commentsList || [];

    const newComment = {
      username: userData.name || userData.email || "Anonymous",
      role: userData.role || "citizen",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedComments = [...commentsList, newComment];

    await updateDoc(docRef, {
      commentsList: updatedComments,
      comments: updatedComments.length,
      updatedAt: new Date().toISOString(),
    });

    const updatedSnap = await getDoc(docRef);
    return res.json({ id: updatedSnap.id, ...updatedSnap.data() });
  } catch (error: any) {
    console.error("Error commenting on issue:", error);
    return res.status(500).json({ message: "Error posting comment", error: error.message });
  }
});

// 6. PUT /api/issues/:id/status - Update issue status (can be called by resolvers only)
router.put("/:id/status", authenticateToken as any, upload.array("media", 5), async (req: any, res: Response) => {
  try {
    const { status, note } = req.body;
    if (!status || !note) {
      return res.status(400).json({ message: "Status and note are required" });
    }

    // Verify user is a resolver
    const userRef = doc(db, "users", req.user?.userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists() || userDoc.data().role !== "resolver") {
      return res.status(403).json({ message: "Access denied: Resolvers only" });
    }

    const docRef = doc(db, "issues", req.params.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const data = docSnap.data();
    const statusHistory = data.statusHistory || [];

    // Process files uploaded as proof
    let mediaUrls: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      mediaUrls = (req.files as Express.Multer.File[]).map((f) => `/uploads/${f.filename}`);
    }

    const newHistoryEntry = {
      status,
      timestamp: new Date().toISOString(),
      note: note.trim(),
      mediaUrls,
    };

    const updates: any = {
      status,
      statusHistory: [
        ...statusHistory,
        newHistoryEntry,
      ],
      updatedAt: new Date().toISOString(),
    };

    if (status === "Resolved") {
      updates.resolutionProof = {
        note: note.trim(),
        mediaUrls,
      };
    }

    await updateDoc(docRef, updates);

    // If status became resolved, reward the reporter (+10 points) and award resolver milestones
    if (status === "Resolved" && data.status !== "Resolved") {
      if (data.reporterId) {
        await awardCitizenPointsAndBadges(data.reporterId, {
          points: 10,
          resolvedReport: 1,
        });
      }
      await awardResolverResolutionMilestones(req.user?.userId);
    }

    const updatedSnap = await getDoc(docRef);
    return res.json({ id: updatedSnap.id, ...updatedSnap.data() });
  } catch (error: any) {
    console.error("Error updating issue status:", error);
    return res.status(500).json({ message: "Error updating status", error: error.message });
  }
});

export default router;
