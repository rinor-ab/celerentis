#!/bin/bash
# Load environment variables and start API server

export S3_ENDPOINT=http://localhost:9000
export S3_BUCKET=celerentis
export S3_ACCESS_KEY=minioadmin
export S3_SECRET_KEY=minio123
export S3_REGION=eu-central-1
export REDIS_URL=redis://localhost:6379/0
export POSTGRES_URL=postgresql+psycopg://celerentis:celerentis123@localhost:5432/celerentis
export OPENAI_API_KEY=sk-your-actual-openai-api-key-here

cd apps/api
python -m uvicorn main:app --reload --log-level debug
