import express from "express";
import cors from "cors";
import documentRoutes from "./routes/document.routes";
import chatRoutes from "./routes/chat.routes";

const app = express();

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, "");
}

const allowedOrigins = [
  "https://doc-query-nu.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.FRONTEND_URL?.split(",").map((origin: string) =>
    normalizeOrigin(origin),
  ) || []),
]
  .filter(Boolean)
  .map(normalizeOrigin);

function isAllowedOrigin(origin: string): boolean {
  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalized)) {
    return true;
  }

  // Allow Vercel previews for this project name pattern.
  return /^https:\/\/doc-query(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(normalized);
}

const corsOptions: cors.CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    // Allow non-browser requests (curl, server-to-server) with no Origin header.
    if (!origin) return callback(null, true);

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked for origin: ${origin}`);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use("/upload", documentRoutes);
app.use("/chat", chatRoutes);

// Health endpoint used by keepalive pings and platform health checks
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;
