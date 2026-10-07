import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

// --- Serve the Vite-built frontend in production ---
if (process.env["NODE_ENV"] === "production") {
  // In the CJS bundle produced by esbuild, __dirname is natively available.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const publicDir = path.resolve(__dirname, "public");

  // Serve static assets (JS, CSS, images, etc.)
  app.use(express.static(publicDir, { maxAge: "1y", immutable: true }));

  // SPA catch-all: any non-API route returns index.html for client-side routing
  app.use((_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

// Global error handler — catches unhandled errors from async route handlers
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: "Internal Server Error", message });
});

export default app;
