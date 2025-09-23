# Dual Enterprise Management Platform

## Overview
This workspace contains two comprehensive enterprise management systems:

### 1. UEM (Unified Endpoint Management) - .NET Microservices
A robust .NET-based enterprise UEM system with PostgreSQL backend, featuring:
- **Satellite API** (port 8000): Endpoint data collection and agent management
- **ServiceBroker API** (port 8099): Centralized service coordination
- **Agent simulation**: 3 active simulated endpoints sending real-time asset data
- **Enterprise repositories**: Dapper-based data layer with graceful fallbacks

### 2. EndpointMaster - TypeScript Full-Stack
A modern TypeScript application providing a comprehensive dashboard for enterprise endpoint management and security monitoring. It enables real-time management of network endpoints, security compliance monitoring, and tracking of system activities. The project aims to deliver an enterprise-grade solution for managing IT assets, automating discovery, and orchestrating agent deployments, ensuring robust security and operational efficiency.

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
- **Framework**: Express.js with TypeScript
- **Data Storage**: PostgreSQL with Drizzle ORM
- **API**: RESTful API design
- **Development**: Vite integration for HMR

### Database
- **Type**: PostgreSQL (Neon Database serverless)
- **ORM**: Drizzle ORM (schema-first with Zod validation)
- **Management**: Drizzle Kit for migrations (`npm run db:push`), comprehensive seed data

### Key Features & Components
- **Data Models**: Users, Endpoints, Activities, System Status.
- **UI Components**: Dashboard, Assets Management, Discovery, Scripts, Policies, Discovery Probes, User Management, Settings.
- **Authentication & Authorization**: Role-based access control (administrator, operator, viewer) with session management ready for implementation.
- **Data Flow**: Client (TanStack Query) -> API (Express, validation) -> Storage (PostgreSQL) -> Responses (JSON) -> UI Updates.
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