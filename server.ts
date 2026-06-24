import "dotenv/config";
import express from "express";
import * as path from "path";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import { collection, query, where, getDocs, addDoc, limit } from "firebase/firestore";
import { db } from "./server/firebase";
import authRouter from "./server/auth";
import issuesRouter from "./server/issues";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse incoming request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve files uploaded by community members
  const uploadsPath = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsPath));

  // Health-check and API endpoints
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", project: "Lokally Civic Engine" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/issues", issuesRouter);

  // Seed default resolver accounts if not present
  try {
    const usersRef = collection(db, "users");
    
    // 1. Seed resolver@lokally.com
    const q1 = query(usersRef, where("email", "==", "resolver@lokally.com"), limit(1));
    const snap1 = await getDocs(q1);
    if (snap1.empty) {
      const hashedPassword = await bcrypt.hash("resolverpassword", 10);
      await addDoc(collection(db, "users"), {
        name: "Seeded Resolver",
        email: "resolver@lokally.com",
        password: hashedPassword,
        role: "resolver",
        phone: "0000000000",
        address: "HQ City Hall",
        points: 0,
        badges: [],
        reportsCount: 0,
        verificationsCount: 0,
        resolvedReportsCount: 0,
        resolverIssuesResolved: 0,
        createdAt: new Date().toISOString()
      });
      console.log("✅ Default resolver account seeded (resolver@lokally.com / resolverpassword)");
    }

    // 2. Seed resolver@lokally.gov
    const q2 = query(usersRef, where("email", "==", "resolver@lokally.gov"), limit(1));
    const snap2 = await getDocs(q2);
    if (snap2.empty) {
      const hashedPassword = await bcrypt.hash("resolversecure123", 10);
      await addDoc(collection(db, "users"), {
        name: "Verified Resolver",
        email: "resolver@lokally.gov",
        password: hashedPassword,
        role: "resolver",
        phone: "1111111111",
        address: "Civic Headquarters",
        points: 0,
        badges: [],
        reportsCount: 0,
        verificationsCount: 0,
        resolvedReportsCount: 0,
        resolverIssuesResolved: 0,
        createdAt: new Date().toISOString()
      });
      console.log("✅ Default resolver account seeded (resolver@lokally.gov / resolversecure123)");
    }

    // 3. Seed resolver@cityhall.gov
    const q3 = query(usersRef, where("email", "==", "resolver@cityhall.gov"), limit(1));
    const snap3 = await getDocs(q3);
    if (snap3.empty) {
      const hashedPassword = await bcrypt.hash("cityhallpass456", 10);
      await addDoc(collection(db, "users"), {
        name: "Municipal Officer",
        email: "resolver@cityhall.gov",
        password: hashedPassword,
        role: "resolver",
        phone: "2222222222",
        address: "City Hall Sector 5",
        points: 0,
        badges: [],
        reportsCount: 0,
        verificationsCount: 0,
        resolvedReportsCount: 0,
        resolverIssuesResolved: 0,
        createdAt: new Date().toISOString()
      });
      console.log("✅ Default resolver account seeded (resolver@cityhall.gov / cityhallpass456)");
    }
  } catch (error) {
    console.error("❌ Error seeding resolver accounts:", error);
  }

  // Integrate Vite for single-page client loading
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware active.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files active.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Lokally] Civic Server active on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical error starting Lokally civic server:", error);
});
