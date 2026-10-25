/**
 * VIGIL — Agentic Institution Intelligence & Coordination Platform
 * Landing Page Server — Compatible with local CLI (node server.js) and Vercel Serverless
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

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
  ".woff2": "font/woff2"
};

const handler = (req, res) => {
  if (req.url === "/healthz") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ status: "ok", service: "vigil-landing" }));
    return;
  }

  const landingDir = path.join(__dirname, "landing");
  let cleanUrl = (req.url || "/").split("?")[0];
  let filePath = path.join(landingDir, cleanUrl === "/" ? "index.html" : cleanUrl);

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      fs.readFile(path.join(landingDir, "index.html"), (fallbackErr, fallbackContent) => {
        if (fallbackErr) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain");
          res.end("404 Not Found — VIGIL Landing");
        } else {
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(fallbackContent);
        }
      });
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", contentType);
      res.end(content);
    }
  });
};

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = http.createServer(handler);
  server.listen(PORT, () => {
    console.log(`VIGIL Landing Page server running on port ${PORT}`);
  });
}

module.exports = handler;
