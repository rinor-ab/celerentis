#!/bin/bash

# Celerentis Startup Script

echo "🚀 Starting Celerentis AI IM Generator..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f "infra/.env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp infra/env.example infra/.env
    echo "📝 Please edit infra/.env and set your OpenAI API key before continuing."
    echo "   Then run this script again."
    exit 1
fi

# Also check for local .env file
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local file found. Creating from template..."
    cp infra/env.example .env.local
    echo "📝 Please edit .env.local and set your OpenAI API key for local development."
fi

# Check if OpenAI API key is set
if grep -q "your_openai_api_key_here" infra/.env; then
    echo "❌ Please set your OpenAI API key in infra/.env before continuing."
    exit 1
fi

echo "✅ Environment configured. Starting services..."

# Start the stack
cd infra
docker-compose up -d

echo "⏳ Waiting for services to start..."

# Wait for services to be ready
echo "🔍 Checking service health..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services started successfully!"
    echo ""
    echo "🌐 Web UI: http://localhost:3000"
    echo "🔌 API: http://localhost:8000"
    echo "📊 MinIO Console: http://localhost:9001 (admin/minio123)"
    echo "🗄️  PostgreSQL: localhost:5432"
    echo "🔴 Redis: localhost:6379"
    echo ""
    echo "📖 Open http://localhost:3000 to get started!"
    echo "📁 Example files are available in the /examples directory"
else
    echo "❌ Some services failed to start. Check logs with:"
    echo "   docker-compose logs"
    exit 1
fi
