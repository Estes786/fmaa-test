-- FFMA Dashboard Database Schema
-- Supabase PostgreSQL Schema for Federated Micro-Agents Architecture

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS api_usage_stats CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS agent_tasks CASCADE;
DROP TABLE IF EXISTS user_recommendations CASCADE;
DROP TABLE IF EXISTS sentiment_analyses CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- 1. Agents Table - Master data for all agents
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('sentiment', 'recommendation', 'performance', 'custom')),
    description TEXT,
    config JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'active', 'inactive', 'error', 'maintenance', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes
    CONSTRAINT agents_name_unique UNIQUE (name)
);

-- 2. Sentiment Analyses Table - Data analysis sentiment
CREATE TABLE sentiment_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    score DECIMAL(5,3) DEFAULT 0,
    confidence DECIMAL(5,2) DEFAULT 0,
    keywords JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes for performance
    CONSTRAINT sentiment_text_length CHECK (length(text) <= 10000)
);

-- 3. User Recommendations Table - Personal user recommendations
CREATE TABLE user_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    item_id VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    price DECIMAL(10,2),
    recommendation_score INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes
    INDEX idx_user_recommendations_user_id (user_id),
    INDEX idx_user_recommendations_category (category),
    INDEX idx_user_recommendations_rating (rating DESC)
);

-- 4. Performance Metrics Table - System performance metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service VARCHAR(100) NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    value DECIMAL(15,6) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',

    -- Indexes for time-series queries
    INDEX idx_performance_metrics_service (service),
    INDEX idx_performance_metrics_type (metric_type),
    INDEX idx_performance_metrics_timestamp (timestamp DESC),
    INDEX idx_performance_metrics_service_type_time (service, metric_type, timestamp DESC)
);

-- 5. Agent Tasks Table - Task management for agents
CREATE TABLE agent_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tasks_completed INTEGER DEFAULT 0,
    tasks_failed INTEGER DEFAULT 0,
    average_response_time DECIMAL(10,3) DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes
    CONSTRAINT agent_tasks_agent_id_unique UNIQUE (agent_id)
);

-- 6. System Logs Table - System logging
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
    service VARCHAR(100),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes
    INDEX idx_system_logs_level (level),
    INDEX idx_system_logs_service (service),
    INDEX idx_system_logs_created_at (created_at DESC)
);

-- 7. API Usage Stats Table - API usage statistics
CREATE TABLE api_usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time DECIMAL(10,3),
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes
    INDEX idx_api_usage_endpoint (endpoint),
    INDEX idx_api_usage_status (status_code),
    INDEX idx_api_usage_timestamp (timestamp DESC)
);

-- Create indexes for better performance
CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_created_at ON agents(created_at DESC);

CREATE INDEX idx_sentiment_analyses_sentiment ON sentiment_analyses(sentiment);
CREATE INDEX idx_sentiment_analyses_created_at ON sentiment_analyses(created_at DESC);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_tasks_updated_at BEFORE UPDATE ON agent_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO agents (name, type, description, config, status) VALUES
('Sentiment Analyzer Pro', 'sentiment', 'Advanced sentiment analysis agent for text processing', 
 '{"max_concurrent_tasks": 5, "confidence_threshold": 0.6, "language": "en"}', 'active'),
('Product Recommender', 'recommendation', 'Intelligent product recommendation engine',
 '{"max_recommendations": 20, "categories": ["technology", "fashion", "food"]}', 'active'),
('Performance Monitor', 'performance', 'Real-time system performance monitoring agent',
 '{"alert_thresholds": {"cpu": 90, "memory": 95}, "check_interval": 60}', 'active'),
('Custom Analytics Agent', 'custom', 'Custom analytics processing agent',
 '{"max_concurrent_tasks": 10, "timeout": 30000}', 'inactive');

-- Initialize agent tasks for sample agents
INSERT INTO agent_tasks (agent_id, tasks_completed, tasks_failed, average_response_time, last_activity)
SELECT id, 0, 0, 0, NOW()
FROM agents;

-- Insert sample sentiment analyses
INSERT INTO sentiment_analyses (text, sentiment, score, confidence, keywords) VALUES
('I love this product! It is amazing and works perfectly.', 'positive', 0.85, 92.5, 
 '[{"word": "love", "sentiment": "positive"}, {"word": "amazing", "sentiment": "positive"}]'),
('This service is terrible and disappointing.', 'negative', -0.75, 88.3,
 '[{"word": "terrible", "sentiment": "negative"}, {"word": "disappointing", "sentiment": "negative"}]'),
('The product is okay, nothing special.', 'neutral', 0.05, 65.2,
 '[{"word": "okay", "sentiment": "neutral"}]');

-- Insert sample recommendations
INSERT INTO user_recommendations (user_id, item_id, category, title, description, rating, price, recommendation_score) VALUES
('user_001', 'tech_001', 'technology', 'iPhone 15 Pro Max', 'Latest iPhone with advanced camera', 4.8, 1199.99, 95),
('user_001', 'tech_002', 'technology', 'MacBook Air M3', 'Ultra-thin laptop with M3 chip', 4.7, 1299.99, 92),
('user_002', 'fashion_001', 'fashion', 'Nike Air Jordan 1', 'Classic basketball shoes', 4.5, 170.00, 88);

-- Insert sample performance metrics
INSERT INTO performance_metrics (service, metric_type, value, metadata) VALUES
('api', 'response_time', 150.5, '{"endpoint": "/api/sentiment-agent", "method": "POST"}'),
('api', 'cpu_usage', 45.2, '{"server": "vercel-function-1"}'),
('api', 'memory_usage', 68.7, '{"server": "vercel-function-1"}'),
('database', 'query_time', 25.3, '{"query_type": "SELECT", "table": "agents"}');

-- Insert sample system logs
INSERT INTO system_logs (level, service, message, metadata) VALUES
('info', 'api', 'API server started successfully', '{"port": 3000, "env": "production"}'),
('warning', 'performance', 'High CPU usage detected', '{"cpu_usage": 85.5, "threshold": 80}'),
('error', 'database', 'Connection timeout', '{"timeout": 5000, "retry_count": 3}');

-- Create views for common queries
CREATE VIEW agent_summary AS
SELECT 
    a.type,
    COUNT(*) as total_agents,
    COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_agents,
    COUNT(CASE WHEN a.status = 'inactive' THEN 1 END) as inactive_agents,
    COUNT(CASE WHEN a.status = 'error' THEN 1 END) as error_agents,
    AVG(at.tasks_completed) as avg_tasks_completed,
    AVG(at.average_response_time) as avg_response_time
FROM agents a
LEFT JOIN agent_tasks at ON a.id = at.agent_id
WHERE a.status != 'deleted'
GROUP BY a.type;

CREATE VIEW recent_sentiment_analysis AS
SELECT 
    sentiment,
    COUNT(*) as count,
    AVG(score) as avg_score,
    AVG(confidence) as avg_confidence
FROM sentiment_analyses 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY sentiment;

CREATE VIEW performance_summary AS
SELECT 
    service,
    metric_type,
    COUNT(*) as data_points,
    MIN(value) as min_value,
    MAX(value) as max_value,
    AVG(value) as avg_value,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_value
FROM performance_metrics 
WHERE timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY service, metric_type;

-- Enable Row Level Security (RLS) for production
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security requirements)
CREATE POLICY "Enable read access for all users" ON agents FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON agents FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON agents FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON sentiment_analyses FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON sentiment_analyses FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON user_recommendations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON user_recommendations FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON performance_metrics FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON performance_metrics FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON agent_tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON agent_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON agent_tasks FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON system_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON system_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON api_usage_stats FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON api_usage_stats FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create function to clean old data (call periodically)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete performance metrics older than 30 days
    DELETE FROM performance_metrics WHERE timestamp < NOW() - INTERVAL '30 days';

    -- Delete system logs older than 7 days (except errors and critical)
    DELETE FROM system_logs 
    WHERE created_at < NOW() - INTERVAL '7 days' 
    AND level NOT IN ('error', 'critical');

    -- Delete API usage stats older than 14 days
    DELETE FROM api_usage_stats WHERE timestamp < NOW() - INTERVAL '14 days';

    RAISE NOTICE 'Old data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- Schema setup completed
SELECT 'FFMA Dashboard database schema setup completed successfully!' as status;