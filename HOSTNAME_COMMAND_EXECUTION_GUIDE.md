# Hostname-Based Command Execution - Implementation Guide

## Overview
This implementation enables a complete command execution workflow where:
1. **Minimal data is published** to Kafka topic
2. **All agents receive** the notification
3. **Hostname matching** determines which agent executes
4. **Full details are fetched** from database by matched agent
5. **Results are stored** in DB and published to Kafka responses topic
6. **UI gets updated** with execution status

---

## Database Setup

### Step 1: Run the migration script in pgAdmin

```sql
-- Open pgAdmin and connect to your database: uem_endpoint_v2
-- Run the migration script:
\i 'C:/Users/Anantha Madduri/Downloads/UEM/uem.endpoint/UEM.Satellite.API/Migrations/001_create_command_execution_tables.sql'
```

Or copy and paste the SQL from the file directly into pgAdmin.

This creates:
- `command_executions` table
- `command_execution_results` table
- Indexes for performance
- Triggers for updated_at

---

## Architecture

### Flow Diagram
```
UI/API → Satellite → Kafka (minimal) → All Agents
                                           ↓
                                    Hostname Match?
                                           ↓ Yes
                                    Fetch Full Details
                                           ↓
                                    Execute Command
                                           ↓
                                    Store Result (DB)
                                           ↓
                                    Publish to Kafka
                                           ↓
                                    Satellite Consumes
                                           ↓
                                    UI Updates
```

### Data Flow

#### 1. Minimal Payload (Kafka `uem.commands`)
```json
{
  "executionId": "guid",
  "commandId": "guid",
  "hostnameFilter": "DESKTOP-*",
  "commandType": "powershell",
  "ttl": 3600,
  "issuedAt": "2025-11-11T10:00:00Z",
  "expiresAt": "2025-11-12T10:00:00Z"
}
```

#### 2. Full Command Details (from DB, fetched by agent)
```json
{
  "executionId": "guid",
  "commandType": "powershell",
  "scriptContent": "Get-Date",
  "timeoutSeconds": 300,
  "parameters": {},
  "agentDetails": {
    "agentId": "uem-xxxxx",
    "hostname": "DESKTOP-ABC123",
    "ipAddress": "192.168.1.100",
    "operatingSystem": "Windows 11",
    ...
  },
  "issuedAt": "2025-11-11T10:00:00Z",
  "expiresAt": "2025-11-12T10:00:00Z"
}
```

#### 3. Execution Result (to DB and Kafka `uem.commands.responses`)
```json
{
  "executionId": "guid",
  "agentId": "uem-xxxxx",
  "status": "success",
  "exitCode": 0,
  "output": "...",
  "errorMessage": null,
  "executionTimeMs": 1234,
  "completedAt": "2025-11-11T10:00:05Z"
}
```

---

## API Endpoints

### 1. Create Command Execution
**POST** `/api/command-execution/create`

Request:
```json
{
  "commandType": "powershell",
  "scriptContent": "Get-Date",
  "hostnameFilter": "DESKTOP-*",
  "timeoutSeconds": 300,
  "description": "Test command execution"
}
```

Response:
```json
{
  "executionId": "abc-123",
  "commandId": "def-456",
  "status": "pending",
  "createdAt": "2025-11-11T10:00:00Z",
  "message": "Command published to all agents with hostname filter: DESKTOP-*"
}
```

### 2. Get Command Details (called by agent)
**GET** `/api/command-execution/{executionId}?agentId={agentId}`

Response: Full command details with agent information from database

### 3. Submit Execution Result (called by agent)
**POST** `/api/command-execution/{executionId}/result`

Request:
```json
{
  "agentId": "uem-xxxxx",
  "status": "success",
  "exitCode": 0,
  "output": "...",
  "executionTimeMs": 1234,
  "startedAt": "2025-11-11T10:00:00Z",
  "completedAt": "2025-11-11T10:00:05Z"
}
```

### 4. Get Execution Status
**GET** `/api/command-execution/{executionId}/status`

### 5. List All Executions
**GET** `/api/command-execution?status=success&limit=50`

---

## Testing

### Prerequisites
1. ✅ Kafka running (localhost:9092)
2. ✅ PostgreSQL running with database `uem_endpoint_v2`
3. ✅ Migration script executed
4. ✅ ServiceBroker running (port 8099)
5. ✅ Satellite running (port 8000)
6. ✅ Agent running

### Step 1: Start all services

```bash
# Terminal 1 - Satellite
cd UEM.Satellite.API
dotnet run

# Terminal 2 - ServiceBroker
cd UEM.ServiceBroker.API
dotnet run

# Terminal 3 - Agent
cd UEM.Endpoint.Agent
dotnet run
```

### Step 2: Get your agent's hostname

In the agent logs, look for:
```
Agent registration validated: uem-xxxxx
```

Or check in pgAdmin:
```sql
SELECT agent_id, hostname FROM agents ORDER BY registered_at DESC LIMIT 5;
```

### Step 3: Create a test command execution

```bash
# Replace DESKTOP-ABC123 with your actual hostname or use wildcard
curl -X POST http://localhost:8000/api/command-execution/create \
  -H "Content-Type: application/json" \
  -d '{
    "commandType": "powershell",
    "scriptContent": "Get-Date",
    "hostnameFilter": "DESKTOP-*",
    "timeoutSeconds": 300,
    "description": "Test date command"
  }'
```

Expected response:
```json
{
  "executionId": "abc-123",
  "commandId": "def-456",
  "status": "pending",
  "createdAt": "...",
  "message": "Command published to all agents with hostname filter: DESKTOP-*"
}
```

### Step 4: Monitor execution

**In Satellite logs**, you should see:
```
Dispatched broadcast command executionId=abc-123 hostnameFilter=DESKTOP-*
```

**In Agent logs**, you should see:
```
Received command notification: ExecutionId=abc-123
Hostname DESKTOP-ABC123 matched filter DESKTOP-*, fetching full command details
Fetched full command details for abc-123, executing script
Script execution completed for abc-123: Success=True, Time=1234ms
Successfully submitted execution result for abc-123
```

### Step 5: Check execution status

```bash
curl http://localhost:8000/api/command-execution/abc-123/status
```

### Step 6: Verify in database

```sql
-- Check command execution
SELECT * FROM command_executions WHERE execution_id = 'abc-123';

-- Check execution result
SELECT * FROM command_execution_results WHERE execution_id = 'abc-123';
```

### Step 7: Check Kafka UI

Go to your Kafka UI (http://localhost:8080) and check:
- **Topic**: `uem.commands` - should have the minimal payload
- **Topic**: `uem.commands.responses` - should have the result

---

## Hostname Matching Patterns

The system supports wildcard matching:

| Pattern | Matches |
|---------|---------|
| `*` | All agents |
| `DESKTOP-ABC123` | Exact match only |
| `DESKTOP-*` | DESKTOP-ABC123, DESKTOP-XYZ789, etc. |
| `*-SERVER` | WEB-SERVER, DB-SERVER, etc. |
| `PROD-??-APP` | PROD-01-APP, PROD-02-APP, etc. |

---

## Troubleshooting

### Agent not receiving commands
1. Check agent is connected to Satellite SignalR hub
2. Verify Kafka consumer in Satellite is running
3. Check network connectivity

### Hostname not matching
1. Verify hostname in database: `SELECT hostname FROM agents WHERE agent_id = 'xxx'`
2. Test pattern matching logic
3. Check agent logs for hostname comparison

### Command not executing
1. Check agent has permissions to execute script
2. Verify script syntax is correct for the OS
3. Check timeout settings

### Results not stored
1. Verify database connection
2. Check table permissions
3. Review Satellite logs for errors

---

## Files Modified/Created

### Satellite API (UEM.Satellite.API)
- ✅ **Controllers/CommandExecutionController.cs** - New
- ✅ **Services/ICommandExecutionService.cs** - New
- ✅ **Services/CommandExecutionService.cs** - New
- ✅ **Services/KafkaCommandPublisher.cs** - New
- ✅ **Services/KafkaCommandConsumer.cs** - Modified
- ✅ **Migrations/001_create_command_execution_tables.sql** - New
- ✅ **Program.cs** - Modified (added service registration)

### Agent (UEM.Endpoint.Agent)
- ✅ **Services/CommandChannel.cs** - Modified (hostname matching + fetch full details)

### ServiceBroker (UEM.ServiceBroker.API)
- ✅ **Program.cs** - Modified (added Kafka services registration)

---

## Next Steps

1. **Run the database migration**
2. **Restart all services** (Satellite, ServiceBroker, Agent)
3. **Test with the curl commands above**
4. **Monitor logs** to see the flow
5. **Check database** to verify data storage
6. **Verify Kafka topics** have messages

---

## Support

If you encounter issues:
1. Check all services are running
2. Review logs in each component
3. Verify database connectivity
4. Test Kafka connectivity
5. Confirm agent hostname matches filter pattern
