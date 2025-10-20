# Unified Enterprise Management Platform

## Overview
This is a comprehensive enterprise UEM (Unified Endpoint Management) solution with unified C# backend architecture.

**ARCHITECTURAL MILESTONES**:
- **September 2025**: Migrated from dual-server architecture (TypeScript + C#) to unified C#-only backend
- **September 30, 2025**: Implemented unified hierarchical domain-tenant tree selector across all UI components for consistent context selection and display
- **October 17, 2025**: Implemented enterprise-grade Cloud Discovery infrastructure for AWS, GCP, and Azure with encrypted credentials, scheduled discovery jobs, and comprehensive audit trails

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
- **Type**: PostgreSQL (Enterprise-grade with 50+ tables)
- **ORM**: Dapper with raw SQL for performance
- **Management**: C# repositories with graceful fallbacks, comprehensive agent data
- **Cloud Discovery Schema**: 6 specialized tables for multi-cloud asset discovery:
  - `cloud_providers`: AWS, GCP, Azure registry with 3 default providers
  - `cloud_credentials`: AES-256 encrypted credential storage with validation tracking
  - `cloud_discovery_jobs`: Scheduled discovery job configuration with cron support
  - `cloud_assets`: Discovered cloud resources with JSONB metadata and cost estimates
  - `cloud_discovery_results`: Execution history and audit trail for all discovery runs
  - `cloud_audit_logs`: Comprehensive security audit trail for all cloud operations

### Key Features & Components
- **Data Models**: Users, Endpoints, Activities, System Status.
- **UI Components**: Dashboard, Assets Management, Discovery, Scripts, Policies, Discovery Probes, User Management, Settings.
- **Authentication & Authorization**: Role-based access control (administrator, operator, viewer) with session management ready for implementation.
- **Data Flow**: Client (TanStack Query) -> C# API Controllers -> Dapper/PostgreSQL -> JSON Responses -> React UI Updates.
- **Multi-Tenancy**: Universal multi-tenant support across all application screens with data isolation and tenant-aware data fetching.
  - **Unified Domain-Tenant Selection**: Hierarchical tree control component (DomainTenantTree) used consistently across:
    - ScriptEditor: Form-based domain/tenant selection for script creation
    - DomainTenantSelector: General-purpose selector component
    - TopHeader: Header-based selection via popover
  - **Context Display**: Consistent context display using useDomainTenant hook in:
    - TenantContextBanner: Alert-style context banner
    - EnterpriseContextBar: Breadcrumb bar with domain/tenant pills
- **Internationalization**: Comprehensive i18n framework supporting 7 languages (English, Spanish, French, German, Chinese, Japanese, Arabic) with RTL support.
- **Asset Management**: Comprehensive asset inventory with dynamic custom fields, table designer, hierarchical views, and reporting.
- **Agent Deployment**: Complete remote agent deployment platform for Windows, Mac, and Linux, with job management, real-time monitoring, and multi-OS support.
- **Discovery**: Unified agentless and agent-based discovery with wizard-driven job creation, policy deployment, and detailed asset tracking.
- **Script Management**: Enhanced script editor with hierarchical domain-tenant tree selection, output processing, real-time validation, and code templates.
- **Policy Management**: Improved execution flow visualization and professional step-card layouts.
- **System Status**: Enterprise-grade footer displaying internet connectivity, system version, and real-time clock.
- **Cloud Discovery** (Phase 1-5 Complete): Enterprise-grade multi-cloud discovery infrastructure:
  - **Database Foundation** ✅: 6 tables with 40+ indexes for optimal query performance
  - **Multi-Cloud Support** ✅: AWS, GCP, Azure provider registry with extensible architecture (3 providers auto-initialized)
  - **Security** ✅: AES-256 encrypted credential storage with validation and expiration tracking
  - **Scheduling** ✅: Cron-based job scheduling (hourly, daily, weekly, custom expressions) with on-demand execution
  - **Asset Tracking**: Comprehensive cloud resource inventory with tags, metadata, cost estimates (in progress)
  - **Audit Trail**: Full execution history and security audit logs for compliance
  - **Tenant Isolation**: Multi-tenant support with domain/tenant-based data isolation
  - **Cloud Provider SDKs** ✅: AWS SDK (EC2, S3, RDS), Google Cloud (Compute, Storage), Azure (ResourceManager, Compute, Storage)
  - **Discovery Services** ✅: Fully implemented AWS, GCP, and Azure discovery engines with authentication, validation, and resource enumeration
  - **Encryption Service** ✅: AES-256 credential encryption with PBKDF2 key derivation and secure credential management
  - **Data Access Layer** ✅: CloudCredentialsRepository, CloudProvidersRepository, CloudDiscoveryJobsRepository with full CRUD operations (fixed column mapping for name/last_validated)
  - **Service Factory** ✅: CloudDiscoveryServiceFactory for provider-based service selection
  - **Dependency Injection** ✅: All services registered and auto-initialized on application startup
  - **Credential Management UI** ✅: Complete credential management with provider-specific forms, validation status badges, and encrypted storage indicators
  - **Discovery Job Management** ✅: CreateDiscoveryJobDialog wizard with tabbed interface (basic settings, scheduling), DiscoveryJobsList with run/pause/delete actions
  - **Backend API** ✅: 13 cloud discovery endpoints including jobs management (create, update, delete, run, list) with enriched provider data
  - **Frontend Integration** ✅: Full credential and job management workflows with real-time validation and status updates

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