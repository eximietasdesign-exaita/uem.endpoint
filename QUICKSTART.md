# UEM QuickStart (Dev)

This setup lets you **run end-to-end** (UI ⇄ Broker ⇄ Kafka ⇄ Satellite ⇄ Agent) with sensible defaults.
**Postgres is optional** — heartbeats fall back to in-memory so the UI can list agents even without a DB.

## 1) Prereqs

- .NET 8 SDK
- Node.js 18+
- Kafka (Docker example below)
- (Optional) Postgres (if you want persistent heartbeats/history)

### Docker (Kafka only)
```bash
docker run -d --name zookeeper -p 2181:2181 confluentinc/cp-zookeeper:7.6.1
docker run -d --name kafka -p 9092:9092 --link zookeeper   -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181   -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092   -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092   confluentinc/cp-kafka:7.6.1
```

## 2) Start Satellite (HTTPS 7200)
```bash
cd UEM.Satellite.API
dotnet run
```
- CORS allows http(s)://localhost:5173.
- SignalR Hub is at `/agent-hub` (JWT required).

## 3) Start ServiceBroker (HTTPS 7201)
```bash
cd UEM.ServiceBroker.API
dotnet run
```

## 4) Start UI (Vite dev server on 5173)
```bash
cd UEM.Web.UI
npm i
npm run dev
```
- Proxy forwards `/sat` → https://localhost:7200 and `/broker` → https://localhost:7201.

## 5) Start Agent
```bash
cd UEM.Endpoint.Agent
# optional: set Satellite base URL (defaults to https://localhost:8000, auto-fallbacks to http)
setx SATELLITE_BASE_URL "https://localhost:8000"   # Windows
export SATELLITE_BASE_URL="https://localhost:8000" # macOS/Linux

dotnet run
```
The agent will:
- **Register** with Satellite `/api/agents/register` and receive a JWT.
- **Connect** to SignalR hub `/agent-hub`.
- **Send** heartbeats (authorized with its JWT).

## Notes

- If Postgres is unavailable, Satellite **falls back to in-memory** heartbeat storage automatically.
- Kafka topic defaults:
  - Commands: `uem.commands`
  - Responses: `uem.commands.responses`
