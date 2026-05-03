import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const _dir = dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV !== "production") {
  const { config } = await import("dotenv");
  config({ path: resolve(_dir, "../../.env") });
}

import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerInsightRoutes } from "../routes/insight";
import { registerChatRoutes } from "../routes/chat";
import { registerAgentRoutes } from "../routes/agent";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://symphonious-lamington-8c9851.netlify.app",
  "https://blockplanemetric.com",
  "https://www.blockplanemetric.com",
  "https://app.blockplanemetric.com",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  registerInsightRoutes(app);
  registerChatRoutes(app);
  registerAgentRoutes(app);

  // Diagnostic endpoint — checks env vars and Supabase reachability
  app.get("/api/diag", async (req, res) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY ?? "";
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_KEY;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    // Show last 12 chars so user can verify which key is loaded without exposing full value
    const anonKeyTail = anonKey ? `...${anonKey.slice(-12)}` : "NOT_SET";
    const serviceKeyTail = process.env.SUPABASE_SERVICE_KEY
      ? `...${process.env.SUPABASE_SERVICE_KEY.slice(-12)}`
      : "NOT_SET";
    let supabaseReachable = false;
    let supabaseError: string | null = null;
    let supabaseAuthResponse: string | null = null;
    if (supabaseUrl && anonKey) {
      try {
        const r = await fetch(`${supabaseUrl}/auth/v1/settings`, {
          headers: { apikey: anonKey },
        });
        supabaseReachable = true;
        if (!r.ok) {
          const body = await r.text().catch(() => "");
          supabaseError = `HTTP ${r.status}: ${body.slice(0, 120)}`;
        } else {
          supabaseAuthResponse = "OK";
        }
      } catch (e: any) {
        supabaseError = e?.message ?? String(e);
        if (e?.cause) supabaseError += ` (cause: ${e.cause?.message ?? e.cause})`;
      }
    }
    res.json({
      supabaseUrl: supabaseUrl ? supabaseUrl.slice(0, 60) : "NOT_SET",
      anonKeyTail,
      serviceKeyTail,
      hasServiceKey,
      hasJwtSecret,
      supabaseReachable,
      supabaseAuthResponse,
      supabaseError,
    });
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
