/**
 * VIGIL — Agentic Institution Intelligence & Coordination Platform
 * Root Landing Server Proxy
 * SIH 2026 | PS 26264 | Team Clutch Crew (197488)
 */

const path = require("path");

// Ensure execution directory is the landing/ folder so all static files are resolved correctly
process.chdir(path.join(__dirname, "landing"));
require(path.join(__dirname, "scripts", "landing-server.js"));
