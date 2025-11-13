-- Migration: Fix command_execution_results Foreign Key Constraint
-- Description: Remove FK constraint on agent_id to allow unregistered agents to submit results
-- Date: 2025-11-12
-- Reason: Agent may not be in agents table but still needs to submit command execution results

-- Drop the foreign key constraint that requires agent_id to exist in agents table
ALTER TABLE command_execution_results 
DROP CONSTRAINT IF EXISTS fk_result_agent;

-- Note: We keep the execution_id FK constraint (fk_execution) because execution_id
-- is always created before results are submitted

COMMENT ON COLUMN command_execution_results.agent_id IS 'Agent ID that executed the command (may not be in agents table)';
