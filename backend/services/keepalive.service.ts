import http from "http";
import https from "https";

let intervalId: NodeJS.Timeout | null = null;

function simpleGet(url: string, timeout = 10000): Promise<number> {
  return new Promise((resolve, _reject) => {
    try {
      const parsed = new URL(url);
      const lib = parsed.protocol === "https:" ? https : http;
      const req = lib.get(parsed, (res) => {
        // consume data to free socket
        res.on("data", () => {});
        res.on("end", () => resolve(res.statusCode ?? 0));
      });

      req.on("error", () => resolve(0));
      req.setTimeout(timeout, () => {
        req.destroy();
        resolve(0);
      });
    } catch (e) {
      resolve(0);
    }
  });
}

export function startKeepalive() {
  const enabled = process.env.KEEPALIVE_ENABLED ?? "true";
  if (enabled.toLowerCase() === "false") return;

  const intervalSeconds = Number(process.env.KEEPALIVE_INTERVAL_SECONDS) || 300;
  const selfUrl =
    process.env.SELF_URL ||
    `http://localhost:${process.env.PORT || 3000}/health`;
  const chromaUrl =
    process.env.CHROMA_HEALTH_URL || "http://localhost:8000/health";

  const pingOnce = async () => {
    try {
      const [selfStatus, chromaStatus] = await Promise.all([
        simpleGet(selfUrl),
        simpleGet(chromaUrl),
      ]);

      const now = new Date().toISOString();
      console.log(
        `[keepalive] ${now} self=${selfStatus} chroma=${chromaStatus}`,
      );
    } catch (err) {
      console.warn("[keepalive] ping error", err);
    }
  };

  // optional: wait for Chroma to be reachable before the initial ping
  const waitForChroma =
    (process.env.KEEPALIVE_WAIT_FOR_CHROMA ?? "false").toLowerCase() === "true";
  const waitAttempts = Number(process.env.KEEPALIVE_WAIT_ATTEMPTS) || 15;
  const waitDelayMs = Number(process.env.KEEPALIVE_WAIT_DELAY_MS) || 2000;

  const waitUntilChroma = async () => {
    if (!waitForChroma) return;
    for (let i = 0; i < waitAttempts; i++) {
      const status = await simpleGet(chromaUrl);
      if (status === 200) {
        console.log(`[keepalive] chroma is up (attempt ${i + 1})`);
        return;
      }
      console.log(
        `[keepalive] waiting for chroma... attempt ${i + 1}/${waitAttempts}`,
      );
      await new Promise((r) => setTimeout(r, waitDelayMs));
    }
    console.warn(
      `[keepalive] chroma did not become ready after ${waitAttempts} attempts.`,
    );
  };

  (async () => {
    await waitUntilChroma();
    // initial ping
    pingOnce();
    // schedule repeated pings
    intervalId = setInterval(pingOnce, intervalSeconds * 1000);
  })();
}

export function stopKeepalive() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
