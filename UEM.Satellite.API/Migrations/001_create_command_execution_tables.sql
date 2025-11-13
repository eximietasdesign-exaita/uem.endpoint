-- Migration: Add Command Execution Tables
-- Description: Creates tables for hostname-based command execution workflow
-- Date: 2025-11-11

-- Create command_executions table
CREATE TABLE IF NOT EXISTS public.command_executions (
    id SERIAL PRIMARY KEY,
    execution_id TEXT NOT NULL UNIQUE,
    command_id TEXT NOT NULL,
    command_type TEXT NOT NULL, -- powershell, bash, python, wmi
    script_content TEXT NOT NULL,
    hostname_filter TEXT NOT NULL,
    timeout_seconds INTEGER DEFAULT 300,
    parameters JSONB,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, matched, running, completed, failed, timeout, cancelled
    matched_agent_id TEXT,
    triggered_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    matched_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_matched_agent FOREIGN KEY (matched_agent_id) REFERENCES agents(agent_id) ON DELETE SET NULL
);

-- Create command_execution_results table
CREATE TABLE IF NOT EXISTS public.command_execution_results (
    id SERIAL PRIMARY KEY,
    execution_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    status TEXT NOT NULL, -- success, failed, timeout
    exit_code INTEGER,
    output TEXT,
    error_message TEXT,
    execution_time_ms BIGINT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_execution FOREIGN KEY (execution_id) REFERENCES command_executions(execution_id) ON DELETE CASCADE,
    CONSTRAINT fk_result_agent FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_command_executions_execution_id ON command_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_command_executions_status ON command_executions(status);
CREATE INDEX IF NOT EXISTS idx_command_executions_hostname_filter ON command_executions(hostname_filter);
CREATE INDEX IF NOT EXISTS idx_command_executions_matched_agent ON command_executions(matched_agent_id);
CREATE INDEX IF NOT EXISTS idx_command_executions_created_at ON command_executions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_command_execution_results_execution_id ON command_execution_results(execution_id);
CREATE INDEX IF NOT EXISTS idx_command_execution_results_agent_id ON command_execution_results(agent_id);
CREATE INDEX IF NOT EXISTS idx_command_execution_results_status ON command_execution_results(status);
CREATE INDEX IF NOT EXISTS idx_command_execution_results_created_at ON command_execution_results(created_at DESC);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column to command_executions if not exists
ALTER TABLE command_executions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_command_executions_modtime ON command_executions;
CREATE TRIGGER update_command_executions_modtime
    BEFORE UPDATE ON command_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

COMMENT ON TABLE command_executions IS 'Stores command executions with hostname-based targeting';
COMMENT ON TABLE command_execution_results IS 'Stores execution results from agents';
COMMENT ON COLUMN command_executions.hostname_filter IS 'Hostname pattern for agent matching (supports wildcards)';
COMMENT ON COLUMN command_executions.matched_agent_id IS 'Agent ID that matched the hostname filter and pulled full details';
