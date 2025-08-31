-- Celerentis Database Initialization

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    pull_public_data BOOLEAN DEFAULT TRUE,
    template_key VARCHAR(500) NOT NULL,
    financials_key VARCHAR(500),
    bundle_key VARCHAR(500),
    status VARCHAR(50) DEFAULT 'queued',
    message TEXT DEFAULT '',
    output_key VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cost_cents INTEGER
);

-- Create usage_logs table
CREATE TABLE IF NOT EXISTS usage_logs (
    id SERIAL PRIMARY KEY,
    job_id UUID REFERENCES jobs(id),
    event VARCHAR(100) NOT NULL,
    meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_job_id ON usage_logs(job_id);

-- Insert sample user (for development)
INSERT INTO users (email) VALUES ('demo@celerentis.com') ON CONFLICT DO NOTHING;
