# Unified Enterprise Management Platform

## Overview
This is a comprehensive enterprise UEM (Unified Endpoint Management) solution with unified C# backend architecture.

**ARCHITECTURAL MILESTONE (September 2025)**: Successfully migrated from dual-server architecture (TypeScript + C#) to unified C#-only backend, achieving complete system integration.

### Unified UEM System - .NET + React Integration
A robust enterprise UEM system with single-backend architecture, featuring:
- **Satellite API** (port 8000): Endpoint data collection and agent management  
- **Integrated Web UI** (port 5000): React frontend served directly by C# API
- **ServiceBroker API** (port 8099): Centralized service coordination
- **Agent simulation**: 3 active simulated endpoints sending real-time asset data
- **Enterprise repositories**: Dapper-based data layer with graceful fallbacks
- **Unified data flow**: React frontend → C# API → PostgreSQL → Real-time updates

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: TanStack Query for server state, Context API for global state (theme, language)

### Backend
- **Framework**: ASP.NET Core 8 with C#
- **Data Storage**: PostgreSQL with Dapper ORM
- **API**: RESTful API design with comprehensive controllers
- **Static Files**: Integrated serving of React build assets

### Database
- **Type**: PostgreSQL (Enterprise-grade with 44+ tables)
- **ORM**: Dapper with raw SQL for performance
- **Management**: C# repositories with graceful fallbacks, comprehensive agent data

### Key Features & Components
- **Data Models**: Users, Endpoints, Activities, System Status.
- **UI Components**: Dashboard, Assets Management, Discovery, Scripts, Policies, Discovery Probes, User Management, Settings.
- **Authentication & Authorization**: Role-based access control (administrator, operator, viewer) with session management ready for implementation.
- **Data Flow**: Client (TanStack Query) -> C# API Controllers -> Dapper/PostgreSQL -> JSON Responses -> React UI Updates.
- **Multi-Tenancy**: Universal multi-tenant support across all application screens with data isolation and tenant-aware data fetching.
- **Internationalization**: Comprehensive i18n framework supporting 7 languages (English, Spanish, French, German, Chinese, Japanese, Arabic) with RTL support.
- **Asset Management**: Comprehensive asset inventory with dynamic custom fields, table designer, hierarchical views, and reporting.
- **Agent Deployment**: Complete remote agent deployment platform for Windows, Mac, and Linux, with job management, real-time monitoring, and multi-OS support.
- **Discovery**: Unified agentless and agent-based discovery with wizard-driven job creation, policy deployment, and detailed asset tracking.
- **Script Management**: Enhanced script editor with output processing, real-time validation, and code templates.
- **Policy Management**: Improved execution flow visualization and professional step-card layouts.
- **System Status**: Enterprise-grade footer displaying internet connectivity, system version, and real-time clock.

## External Dependencies

### UI & Styling
- **Radix UI**: Headless component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

### Data & State Management
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **date-fns**: Date manipulation

### Development Tools
- **Vite**: Build tool and HMR
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **PostCSS**: CSS processing