#!/bin/bash
# Load environment variables and start Celery worker

export S3_ENDPOINT=http://localhost:9000
export S3_BUCKET=celerentis
export S3_ACCESS_KEY=minioadmin
export S3_SECRET_KEY=minio123
export S3_REGION=eu-central-1
export REDIS_URL=redis://localhost:6379/0
export POSTGRES_URL=postgresql+psycopg://celerentis:celerentis123@localhost:5432/celerentis
export OPENAI_API_KEY=your_openai_api_key_here
export PYTHONPATH=/Users/rinor/celerentis

cd apps/worker
celery -A worker worker --loglevel=debug
