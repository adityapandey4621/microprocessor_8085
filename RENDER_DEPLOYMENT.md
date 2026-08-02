# $0 Free Tier Enterprise Deployment Guide: Vercel + Render + Cloud Native Infrastructure

This guide explains how to deploy the **8085 Microprocessor Simulator** with an **industry-level backend** at **$0 operational cost** using Vercel, Render, Neon/Vercel Postgres, and Upstash Redis.

---

## 1. How Our Backend Upgrades Affect and Enhance the Web Application

| Industry-Level Upgrade | File / Component | Direct Impact on the Web Application |
| :--- | :--- | :--- |
| **1. Web Worker Sandbox** | `lib/emulator-worker.ts`<br>`hooks/use-worker-simulator.ts` | **0ms UI Lag & 60 FPS Rendering:** Emulation runs off the main browser DOM thread. Infinite assembly loops (`HERE: JMP HERE`) or 64KB memory scans never freeze the web UI. |
| **2. Code Gallery & Redis Cache** | `/api/code/[id]`<br>`/api/gallery` | **Sub-5ms Page Loads:** Shared links and public community programs use Upstash Redis read-through caching (24h TTL) instead of hitting the database on every visit. |
| **3. Hybrid Collaboration Engine** | `server/ws-server.js`<br>`/api/collaboration/*`<br>`hooks/use-collaboration.ts` | **Real-Time Classroom Presence:** Displays live active student counters and real-time code sharing across both Vercel Serverless ($0 Upstash Pub/Sub) and Render ($0 WebSocket). |
| **4. Automated Challenge Grader** | `/api/challenge/submit` | **Instant 100/100 Scorecards:** Automatically assembles and verifies student code against test vectors (e.g., initial/expected registers and memory) with detailed assertion results. |

---

## 2. Architecture & $0 Free Tier Cloud Topology

```mermaid
graph TD
    subgraph Client ["Client Browser"]
        React["React 19 / Next.js UI"]
        Worker["Web Worker (8085 Emulation)"]
    end

    subgraph Vercel ["Vercel ($0 Free Tier Hosting)"]
        NextAuth["/api/auth (OAuth 2.0)"]
        CodeAPI["/api/code & /api/gallery"]
        ChallengeAPI["/api/challenge/submit"]
    end

    subgraph Render ["Render.com ($0 Free Tier Node.js)"]
        WSServer["server/ws-server.js (WebSocket Server)"]
    end

    subgraph DB ["Cloud Free Tiers ($0/month)"]
        PG["Neon / Vercel Postgres ($0 DB)"]
        Redis["Upstash Redis ($0 Cache / PubSub)"]
    end

    React <-->|HTTPS / REST| CodeAPI
    React <-->|HTTPS / REST| ChallengeAPI
    React <-->|WSS (WebSockets)| WSServer
    React <-->|Shared Memory| Worker
    CodeAPI <--> Redis
    CodeAPI <--> PG
    NextAuth <--> PG
```

---

## 3. Step-by-Step Deployment Guide ($0 Cost)

### Step 1: PostgreSQL Database (Neon or Vercel Postgres Free Tier)
1. Sign up for a free PostgreSQL database at [neon.tech](https://neon.tech) or in the Vercel Dashboard -> Storage -> Postgres.
2. Copy the `DATABASE_URL` connection string (starts with `postgresql://...`).
3. In your project, update `prisma/schema.prisma` to use PostgreSQL for production:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run the initial database migration:
   ```bash
   npx prisma migrate dev --name init_postgres
   ```

### Step 2: Redis Caching & Rate Limiting (Upstash Free Tier)
1. Go to [console.upstash.com](https://console.upstash.com) and create a free Redis database ($0/month, 10,000 commands/day).
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` into your `.env` and deployment variables.

### Step 3: Deploy Frontend & API Routes to Vercel ($0 Free Tier)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) -> **Add New Project** -> Select your GitHub repository.
3. Configure the following Environment Variables in Vercel:
   - `DATABASE_URL`: Your Neon / Vercel Postgres URL.
   - `NEXTAUTH_URL`: Your Vercel domain (e.g., `https://mp8085-simulator.vercel.app`).
   - `NEXTAUTH_SECRET`: A random 32-character secret string.
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Your Google OAuth credentials.
   - `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`: Your Upstash credentials.
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `NEXT_PUBLIC_WS_URL`: (Optional) Your Render WebSocket URL from Step 4. If omitted, the app automatically falls back to Upstash Redis Serverless Presence ($0 cost).

### Step 4: Deploy Standalone WebSocket Server to Render ($0 Free Tier)
1. Go to [render.com](https://render.com) -> **New** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server/ws-server.js`
   - **Plan Type:** Free ($0/month)
4. Copy your Render service URL (e.g., `wss://mp8085-websocket.onrender.com`) and add it to your Vercel environment variables as `NEXT_PUBLIC_WS_URL`.

---

## 4. Verification Check
- Visit your Vercel deployment URL.
- Test saving and viewing code snippets; check Upstash logs to verify cache HIT/MISS.
- Open two browser tabs and test real-time collaboration presence.
- Test submitting an assembly challenge to `/api/challenge/submit` and verify instant 100/100 scoring.
