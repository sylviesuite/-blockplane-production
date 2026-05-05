/**
 * Daily cron trigger for the material research agent.
 * Run by Render Cron Job — see render.yaml.
 * Requires: AGENT_SECRET env var.
 */
import https from "https";

const AGENT_URL = "https://blockplane-production.onrender.com/api/agent/run-research";
const secret = process.env.AGENT_SECRET;

if (!secret) {
  console.error("[trigger-agent] AGENT_SECRET is not set — aborting");
  process.exit(1);
}

const url = new URL(AGENT_URL);
const options = {
  hostname: url.hostname,
  path: url.pathname,
  method: "GET",
  headers: { "x-agent-secret": secret },
};

const req = https.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    const ts = new Date().toISOString();
    console.log(`[trigger-agent] ${ts} — HTTP ${res.statusCode}: ${body}`);
    if (res.statusCode !== 202) {
      console.error("[trigger-agent] Unexpected status — check agent logs");
      process.exit(1);
    }
    console.log("[trigger-agent] Agent started successfully");
  });
});

req.on("error", (err) => {
  console.error("[trigger-agent] Request failed:", err.message);
  process.exit(1);
});

req.end();
