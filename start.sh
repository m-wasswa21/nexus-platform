#!/bin/bash
set -e

echo "🚀 Starting Nexus Platform..."
echo ""

# Start backend
echo "📦 Starting backend (FastAPI on :8000)..."
cd backend
source venv/bin/activate

# Seed on first run
if [ ! -f nexus.db ]; then
  echo "🌱 Running seed data..."
  python seed.py
fi

uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
echo "⚡ Starting frontend (Next.js on :3000)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Nexus Platform running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000/api/docs"
echo ""
echo "Demo accounts (password: password123):"
echo "  Mentors:  james.mwangi@nexus.africa, sarah.nabuuma@nexus.africa"
echo "  Mentees:  brian.otieno@nexus.africa, grace.achieng@nexus.africa"
echo "  Admin:    admin@nexus.africa / admin1234"
echo ""
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
