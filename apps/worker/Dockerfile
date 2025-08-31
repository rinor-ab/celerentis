FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the core package first
COPY packages/core/ packages/core/

# Copy requirements and install Python dependencies
COPY apps/worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY apps/worker/ .

# Run the Celery worker
CMD ["celery", "-A", "worker.celery_app", "worker", "--loglevel=info"]
