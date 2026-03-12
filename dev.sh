#!/bin/bash
set -e

PROJECT_DIR="$HOME/ai-marketplace"
cd "$PROJECT_DIR"

echo "🔧 AI Marketplace - Local Dev Setup"
echo "===================================="

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Ensure local Postgres database exists
DB_NAME="ai_marketplace"
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo "✅ Database '$DB_NAME' already exists"
else
  echo "🗄️  Creating database '$DB_NAME'..."
  createdb "$DB_NAME"
fi

# 3. Ensure .env.local exists with required vars
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local..."
  cat > .env.local <<EOF
DATABASE_URL=postgresql://$(whoami)@localhost:5432/ai_marketplace
AUTH_SECRET="$(openssl rand -base64 32)"
EOF
else
  if ! grep -q "AUTH_SECRET" .env.local; then
    echo "📝 Adding AUTH_SECRET to .env.local..."
    echo "" >> .env.local
    echo "AUTH_SECRET=\"$(openssl rand -base64 32)\"" >> .env.local
  fi
  echo "✅ .env.local exists"
fi

# 4. Run Prisma migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init 2>/dev/null || npx prisma migrate dev --name init

# 5. Seed the database
echo "🌱 Seeding database..."
npx prisma db seed

# 6. Kill any existing Next.js dev server
lsof -ti:3000,3001,3002 2>/dev/null | xargs kill -9 2>/dev/null || true

# 7. Start dev server in background, capture output
echo "🚀 Starting dev server..."
npx next dev > /tmp/nextdev.log 2>&1 &
SERVER_PID=$!

# 8. Wait for server and detect port from output
echo "⏳ Waiting for server to start..."
for i in $(seq 1 30); do
  if grep -q "Local:" /tmp/nextdev.log 2>/dev/null; then
    URL=$(grep "Local:" /tmp/nextdev.log | head -1 | sed 's/.*Local:[[:space:]]*//' | tr -d '[:space:]')
    echo "✅ Server running at $URL"
    echo "🌐 Opening in Chrome..."
    open -a "Google Chrome" "$URL"
    wait $SERVER_PID
    exit 0
  fi
  sleep 1
done

echo "❌ Server failed to start within 30 seconds"
kill $SERVER_PID 2>/dev/null
exit 1
