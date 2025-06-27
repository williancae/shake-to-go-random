#!/bin/bash

echo "🎲 Setting up Shake To Go Marketing Wheel..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🐘 Starting PostgreSQL database..."
docker-compose up -d

echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🔧 Setting up database schema..."
npm run db:generate
npm run db:push

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application, run:"
echo "   npm run dev"
echo ""
echo "📱 Access points:"
echo "   Client: http://localhost:3000"
echo "   Admin:  http://localhost:3000/admin"
echo ""
echo "🎯 Next steps:"
echo "   1. Access the admin panel to add products"
echo "   2. Configure product probabilities (should total 100%)"
echo "   3. Test the wheel on the main page"
