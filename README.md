# Lokally — Hyperlocal Civic Problem Solver

**Lokally turns "someone should really fix that pothole" into a tracked, AI-categorized, community-verified report that actually gets resolved.**

Civic problems — potholes, water leaks, broken streetlights, overflowing garbage — are part of daily life almost everywhere. But reporting them today usually means a fragmented government portal, a helpline call that goes nowhere, or just giving up. Lokally fixes the loop: a citizen takes a photo where the problem actually is, AI handles the categorizing and prioritizing, the community verifies it's real, a dedicated Resolver takes it through to resolution, and the impact is visible on a dashboard — without ever turning resolvers or officials into a public scoreboard.

🔗 **Live app:** https://lokally-519985018130.asia-east1.run.app

---

## The flow, end to end

1. **Spot a problem → open the camera.** Reporting starts with the phone's camera, not a form. A citizen photographs the issue on the spot.
2. **Pin the exact location.** An interactive map-pin picker lets the citizen mark precisely where the problem is — not just where they happened to be standing when they noticed it, since GPS-at-time-of-report and the actual issue location are often two different places.
3. **AI takes over the busywork.** Gemini reads the photo and description, then automatically assigns a category, a priority level, a title, and a summary — the citizen doesn't have to classify their own report.
4. **The community checks it's real.** Other nearby citizens can verify the report, and if someone else reports what looks like the same problem nearby, the app flags it so reports merge into one stronger signal instead of piling up as duplicates.
5. **A Resolver takes it on.** Pre-seeded Resolver accounts (no public signup) move the issue through status updates to resolution. Resolver identity and performance stay internal — never a public ranking, never citizen-facing.
6. **Impact becomes visible.** A dashboard aggregates everything into plain-language AI-generated insights — what's most common, where, and how things are trending — so the data tells a story instead of sitting in a database.
7. **Reporting stays worth doing.** A citizen-only leaderboard rewards consistent, genuine reporting. A separate, private, resolver-only leaderboard tracks resolver performance internally and is never linked from anything citizens see.

---

## Key features

- 📸 **Camera-first reporting** — photo capture is the entry point on mobile, not a buried form field
- 📍 **Map-pin location picker** — mark the issue's real location, independent of the reporter's GPS position
- 🤖 **Gemini-powered categorization** — automatic category, priority, title, and summary generation from photo + description
- 🧠 **AI-powered duplicate detection** — before a new report is saved, the server checks for unresolved nearby reports in the same category (using Haversine-distance spatial proximity), then asks Gemini to judge — using both reports' images and descriptions — whether they describe the *same* real-world problem, not just the same category and location. If Gemini finds a likely match, the citizen sees a popup with the existing report, Gemini's reasoning, and a choice to corroborate instead of duplicate. Corroborations automatically escalate an issue's priority to "High" once they cross a threshold.
- ✅ **Community verification** — citizen corroboration (including via duplicate detection) strengthens a single report instead of fragmenting into duplicates
- 🛠️ **Dedicated Resolver role** — pre-seeded, non-public accounts manage status through to resolution
- 📊 **Impact dashboard with AI insights** — Gemini summarizes aggregate community data into readable, pattern-level insights
- 🏆 **Citizen-only gamification** — public leaderboard for citizens; a completely separate, private, resolver-only leaderboard that is never exposed on any citizen-facing page
- 🌓 **Light and dark mode**
- 🔗 **Share** — share a link directly to a specific issue so neighbors facing the same problem can find and corroborate it

---

## Tech stack

### Frontend (Client)
| | |
|---|---|
| Core framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v4 (Inter + Space Grotesk font pairing) |
| Animation | Motion (`motion/react`) for transitions, modal fades, layout shifts |
| Maps | Leaflet, loaded locally with custom vector-based SVG DivIcon pins (no Google Maps dependency, no billing setup) |
| Icons | Lucide React |

### Backend (Server)
| | |
|---|---|
| Server | Express (TypeScript), run via `tsx` in development, bundled with `esbuild` into a standalone CommonJS build (`dist/server.cjs`) for production |
| AI integration | Google GenAI SDK (`@google/genai`), Gemini models (`gemini-3.5-flash` with fallback chain) for categorization, duplicate detection, and regional insights |
| Authentication | Custom JWT session middleware with secure password hashing |
| Media handling | Multer for multipart photo upload streaming |

### Persistence
| | |
|---|---|
| Database | Google Cloud Firestore — real-time queries, structured timelines, leaderboard stats |

### Deployment
| | |
|---|---|
| Hosting | Google Cloud Run |
| Build environment | Google AI Studio (Build Mode) |

---

## How automatic duplicate detection works

Most people don't search a feed before reporting a problem — they just file a new complaint. So Lokally catches likely duplicates automatically, at the moment of submission, instead of relying on citizens to check first:

1. **Geo-categorical query.** When a report is submitted, the server queries unresolved Firestore reports for the same AI-assigned category, filtered by spatial proximity using the Haversine formula within a small radius.
2. **AI judgment, not just distance.** If nearby same-category candidates exist, Gemini compares the new report's photo and description against each candidate's — distinguishing, for example, a pothole from a broken streetlight at the same intersection — rather than assuming "same place, same category" means "same problem."
3. **A popup, not a silent merge.** If Gemini finds a likely match, the citizen sees the existing report's photo and details, Gemini's stated reasoning for the match, and a choice:
   - **"Yes, same problem"** — no duplicate is created; the existing report's corroboration count increases instead. Once corroborations cross a threshold (3), the issue's priority automatically escalates to High.
   - **"No, this is a different problem"** — the citizen's report is filed normally.

---

## Design decisions worth knowing

- **No public ranking of named individuals.** An earlier version of this project included a public leaderboard of government officials, which judges flagged as too political. Lokally deliberately keeps resolver identity and performance entirely internal — there is no citizen-facing ranking of any individual, official or resolver, anywhere in the app.
- **Map-pin over GPS-lock.** Early versions locked the report's location to the reporter's GPS at submission time — but the reporter's location and the issue's location aren't always the same place. The interactive map-pin picker fixes that.
- **No Google Maps billing dependency.** Mapping runs on Leaflet.js + OpenStreetMap rather than the Google Maps API, avoiding any billing setup risk for a hackathon-stage project.

---

## Built for

A Google hackathon submission, built and deployed entirely within Google AI Studio (Build Mode → Cloud Run), using Gemini and Firebase as core Google technologies.
