/**
 * VIGIL — Institution Intelligence & Multi-Bureau Coordination Platform
 * Landing Page Server — All India Council for Technical Education (AICTE)
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf"
};

const handler = (req, res) => {
  // Simple health-check endpoint (useful for Render health checks)
  if (req.url === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "vigil-landing" }));
    return;
  }

  const landingDir = path.join(__dirname, "..", "landing");
  let filePath = path.join(landingDir, cleanUrl === "/" ? "index.html" : cleanUrl);

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        // Fallback to index.html for clean client-side routes (e.g. /docs, /dashboard-preview)
        fs.readFile(path.join(landingDir, "index.html"), (fallbackErr, fallbackContent) => {
          if (fallbackErr) {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("<h1>404 Not Found — VIGIL</h1>", "utf-8");
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(fallbackContent, "utf-8");
          }
        });
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(`Server Error: ${err.code}`, "utf-8");
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
};

const server = http.createServer(handler);

if (require.main === module) {
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
      console.error(`To free Port ${PORT}, run:`);
      console.error(`  lsof -ti :${PORT} | xargs kill -9\n`);
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`VIGIL Landing Page Server running at http://localhost:${PORT}/`);
    console.log(`Health check available at http://localhost:${PORT}/healthz`);
  });
}

module.exports = handler;
