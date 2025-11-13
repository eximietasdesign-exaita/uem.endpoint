# Authentication Fix Guide

## Problem Identified
Agent authentication was failing with HTTP 401 because:
- **TokenService** signs JWTs using config key: `Jwt:SigningKey`
- **Program.cs JWT validation** was using config key: `Jwt:SecretKey` 
- Keys didn't match → validation failed → HTTP 401 errors

## Fix Applied
Changed `Program.cs` line 79 from:
```csharp
Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"] ?? "your-super-secret-jwt-key-here")
```

To:
```csharp
Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SigningKey"] ?? "ThisIsA32+ByteMinimumDemoSigningKey!!!")
```

Now both token issuance and validation use the same signing key from `appsettings.json`.

## Testing Steps

### 1. Restart Satellite API
```bash
cd UEM.Satellite.API
dotnet run
```

Wait for: `Now listening on: http://0.0.0.0:8000`

### 2. Restart Agent
```bash
cd UEM.Endpoint.Agent
dotnet run
```

Agent should now:
- ✅ Register successfully
- ✅ Receive valid JWT token
- ✅ Send heartbeats with HTTP 200 response
- ✅ Connect to SignalR hub successfully

### 3. Verify Authentication Working

Check agent logs for:
```
[INFO] Agent registered successfully | ID: uem-xxxxx | Hostname: EXILP-PG04DBA9
[INFO] Heartbeat sent successfully | Agent: uem-xxxxx
[INFO] SignalR connection established
```

Should NO LONGER see:
```
[WRN] API call failed | POST .../heartbeat | Status: 401 ❌
[WRN] Heartbeat failed | Agent: uem-xxxxx | Error: HTTP 401 ❌
```

### 4. Test Command Execution Flow

Once authentication is working, test the full hostname-based command execution:

```bash
curl -X POST http://localhost:8000/api/command-execution/create \
  -H "Content-Type: application/json" \
  -d '{
    "commandType": "powershell",
    "scriptContent": "Get-ComputerInfo | Select-Object CsName, WindowsVersion",
    "hostnameFilter": "EXILP-PG04DBA9",
    "timeoutSeconds": 300
  }'
```

Expected flow:
1. ✅ Command saved to DB
2. ✅ Minimal payload published to Kafka topic `uem.commands`
3. ✅ Satellite broadcasts to all agents via SignalR
4. ✅ Agent with matching hostname fetches full details
5. ✅ Agent executes PowerShell script
6. ✅ Agent submits result back to Satellite
7. ✅ Result stored in DB and published to `uem.commands.responses`

### 5. Verify Results

Check database:
```sql
SELECT * FROM command_executions ORDER BY created_at DESC LIMIT 5;
SELECT * FROM command_execution_results ORDER BY completed_at DESC LIMIT 5;
```

Check Kafka topics:
```bash
docker exec -it kafka-broker kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic uem.commands.responses \
  --from-beginning
```

## Root Cause Analysis

The JWT validation was silently failing because:
1. Agent registers → receives JWT signed with `Jwt:SigningKey`
2. Agent sends heartbeat with JWT in Authorization header
3. Satellite tries to validate JWT using `Jwt:SecretKey` (doesn't exist in config)
4. Validation uses fallback key "your-super-secret-jwt-key-here"
5. Signature doesn't match → JWT invalid → HTTP 401 Unauthorized

## Configuration Reference

`appsettings.json` has:
```json
"Jwt": { 
  "SigningKey": "3f9a2b6c9d1e4f7081b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdeff" 
}
```

Both `TokenService.cs` and `Program.cs` now use `Jwt:SigningKey` consistently.

## Next Steps After Fix

1. ✅ Verify agent heartbeat works (HTTP 200)
2. Execute database migration: `UEM.Satellite.API/Migrations/001_create_command_execution_tables.sql`
3. Test complete command execution workflow
4. Monitor Kafka topics for command and response messages
5. Verify SignalR real-time updates working

## Related Files
- `UEM.Satellite.API/Program.cs` - JWT validation configuration
- `UEM.Satellite.API/Services/TokenService.cs` - JWT issuance
- `UEM.Satellite.API/appsettings.json` - Signing key configuration
- `UEM.Endpoint.Agent/Services/HeartbeatService.cs` - Sends JWT with requests
- `UEM.Satellite.API/Controllers/HeartbeatsController.cs` - Requires role="agent"
