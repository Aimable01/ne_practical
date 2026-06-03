#!/bin/bash

# FE MIS Microservices Startup Script

echo "🚀 Starting FE MIS Microservices..."

# Check if MongoDB is running
echo "📦 Checking MongoDB connection..."
if ! mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   Run: mongod --dbpath ./data"
    exit 1
fi

echo "✅ MongoDB is running"

# Build shared package
echo "🔨 Building shared package..."
cd shared
pnpm build
cd ..

# Start all services
echo "🎯 Starting all services..."
pnpm run dev:all
