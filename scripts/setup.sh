#!/bin/bash
# Shadow Economy Mapper — Quick Setup Script
# Run this after cloning the repo.

set -e

echo "=== Shadow Economy Mapper Setup ==="
echo ""

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required. Install it first."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required. Install it first."; exit 1; }

# Copy env file if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "[✓] Created .env from .env.example — fill in your keys!"
else
  echo "[✓] .env already exists"
fi

# Backend setup
echo ""
echo "--- Setting up Backend (Django) ---"
cd apps/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
echo "[✓] Backend dependencies installed"

# Run migrations (will fail if DB not configured yet, that's ok)
python manage.py migrate 2>/dev/null && echo "[✓] Migrations applied" || echo "[!] Migrations skipped — configure SUPABASE_DB_URL in .env first"

cd ../..

# Frontend setup
echo ""
echo "--- Setting up Frontend (React) ---"
cd apps/web
npm install --quiet
echo "[✓] Frontend dependencies installed"
cd ../..

# Extraction package
echo ""
echo "--- Setting up Extraction Package ---"
cd packages/extraction
pip install -r requirements.txt --quiet
echo "[✓] Extraction dependencies installed"
cd ../..

# Scoring package
echo ""
echo "--- Setting up Scoring Package ---"
cd packages/scoring
pip install -r requirements.txt --quiet
echo "[✓] Scoring dependencies installed"
cd ../..

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Fill in .env with your Supabase and API keys"
echo "  2. Run backend:  cd apps/api && source venv/bin/activate && python manage.py runserver"
echo "  3. Run frontend: cd apps/web && npm run dev"
echo "  4. Open http://localhost:5173"
echo ""
echo "Read docs/TEAM_CONVENTIONS.md before you start coding!"
