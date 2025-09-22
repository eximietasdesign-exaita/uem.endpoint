# UEM (Unified Endpoint Management) System

## Overview
This is a .NET-based UEM system with multiple microservices and a React frontend. The system enables centralized management of endpoints with features like agent registration, heartbeat monitoring, and command execution via Kafka messaging.

## Project Architecture

### Frontend
- **Technology**: React + TypeScript with Vite
- **Port**: 5000 (configured for Replit environment)
- **Location**: `UEM.Web.UI/`
- **Features**: Agent dashboard, endpoint management, real-time monitoring

### Backend Services
- **UEM.Satellite.API**: Main API service (typically runs on port 7200)
- **UEM.ServiceBroker.API**: Message broker service (typically runs on port 7201)
- **UEM.Endpoint.Agent**: Client agent for endpoint monitoring
- **UEM.Endpoint.Service**: Windows service wrapper
- **UEM.Shared.Infrastructure**: Common utilities and services
- **UEM.ScriptExecLib**: Script execution library

## Current Configuration
- **.NET 8.0** SDK installed
- **Node.js 20** runtime installed
- **PostgreSQL** database configured with Replit Neon backend
- **Frontend workflow** configured to run on port 5000 with host 0.0.0.0
- **Database connection** updated for Replit PostgreSQL environment
- **Deployment** configured for autoscale with Vite build process

## Recent Changes (Sept 22, 2025)
- Fixed .NET solution file project paths from `src/` to root directory
- Updated PostgreSQL connection string to use Replit Neon database
- Configured Vite dev server for port 5000 with 0.0.0.0 host binding
- Corrected project references in UEM.Endpoint.Agent
- Added missing projects to solution file
- Set up deployment configuration for production

## Dependencies
- **Backend**: Kafka (for messaging), PostgreSQL (for data persistence)
- **Frontend**: Standard React ecosystem with Tailwind CSS
- **Monitoring**: Serilog for logging across all services

## Development Notes
- Frontend proxies `/sat` requests to Satellite API and `/broker` requests to ServiceBroker API
- System designed to fall back to in-memory storage if PostgreSQL is unavailable
- All services use JWT authentication with SignalR for real-time communication
- The system is currently configured to run the frontend only in Replit environment