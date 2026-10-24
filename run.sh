#!/usr/bin/env bash

# VIGIL Platform Runner — Launches FastAPI Backend + Next.js Frontend
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Text styling
CYAN='\033[0;36m'
GREEN='\033[0;32m'
AMBER='\033[0;33m'
RESET='\033[0m'

echo -e "${CYAN}===================================================================${RESET}"
echo -e "${CYAN}        🏛️  VIGIL — Multi-Bureau Coordination Platform            ${RESET}"
echo -e "${CYAN}        AICTE SIH 2026 PS 26264 | Team Clutch Crew (197488)        ${RESET}"
echo -e "${CYAN}===================================================================${RESET}"

# Cleanup handler on exit (Ctrl+C)
cleanup() {
  echo -e "\n${AMBER}Stopping VIGIL services...${RESET}"
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  echo -e "${GREEN}All services stopped cleanly.${RESET}"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI Backend
echo -e "${GREEN}► Starting FastAPI Backend on http://localhost:8000 ...${RESET}"
(cd "$BACKEND_DIR" && python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000) &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 2

# 2. Start Next.js Frontend
echo -e "${GREEN}► Starting Next.js Frontend on http://localhost:3001 ...${RESET}"
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!

echo -e ""
echo -e "${CYAN}✔ Services Live:${RESET}"
echo -e "  • ${GREEN}Frontend Dashboard:${RESET} http://localhost:3001"
echo -e "  • ${GREEN}Backend API Docs:${RESET}   http://localhost:8000/docs"
echo -e "  • ${GREEN}Health Endpoint:${RESET}    http://localhost:8000/healthz"
echo -e ""
echo -e "${AMBER}Press CTRL+C at any time to stop all services.${RESET}"
echo -e ""

# Wait for both processes
wait
