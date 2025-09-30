import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SimpleI18nProvider } from "@/i18n/SimpleI18n";
import { useState } from "react";

import { EnterpriseSidebar } from "@/components/EnterpriseSidebar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

// Pages
import DashboardPage from "@/pages/dashboard";
import AssetsPage from "@/pages/assets";
import DiscoveryPage from "@/pages/discovery";
import DiscoveryScriptsPage from "@/pages/discovery-scripts";
import DiscoveryScriptsMarketplacePage from "@/pages/discovery-scripts-marketplace";
import ScriptPoliciesPage from "@/pages/script-policies";
import DiscoveryProbesPage from "@/pages/discovery-probes";
import CredentialProfilesPage from "@/pages/credential-profiles";
import EnterpriseCredentialProfilesPage from "@/pages/enterprise-credential-profiles";
import AgentlessDiscoveryPage from "@/pages/agentless-discovery-unified";
import AgentlessJobCreationWizard from "@/pages/agentless-job-creation-wizard";
import AgentlessJobDetails from "@/pages/agentless-job-details";
import AgentlessJobsPage from "@/pages/agentless-jobs";
import AgentBasedDiscoveryPage from "@/pages/agent-based-discovery";
import AgentStatusReportsPage from "@/pages/agent-status-reports";
import UserManagementPage from "@/pages/user-management";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import I18nDemoPage from "@/pages/i18n-demo";
import SimpleI18nDemoPage from "@/pages/simple-i18n-demo";
import SatelliteJobQueuePage from "@/pages/satellite-job-queue";
import ExternalIntegrationsPage from "@/pages/external-integrations";
import DomainManagementPage from "@/pages/domain-management";
import TenantManagementPage from "@/pages/tenant-management";
import AssetInventoryPage from "@/pages/asset-inventory";
import RemoteAgentDeploymentPage from "@/pages/remote-agent-deployment";
import { DomainTenantProvider } from "@/contexts/DomainTenantContext";
import { EnterpriseTopHeader } from "@/components/EnterpriseTopHeader";
import { cn } from "@/lib/utils";

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { t } = useLanguage();

  const getPageInfo = (pathname?: string) => {
    if (!pathname) return { title: "Loading...", subtitle: "Please wait" };
    if (pathname === "/") return { title: t("dashboard"), subtitle: t("overview_subtitle") };
    if (pathname.startsWith("/assets")) {
      if (pathname.includes("/agent-based")) return { title: t("agent_based"), subtitle: "Agent-based endpoint management" };
      if (pathname.includes("/agentless")) return { title: t("agentless"), subtitle: "Agentless endpoint management" };
      return { title: t("assets"), subtitle: "Endpoint asset management" };
    }
    if (pathname.startsWith("/discovery")) {
      if (pathname.includes("/scripts")) return { title: "Discovery Scripts", subtitle: "Manage discovery templates and automation scripts" };
      return { title: t("discovery"), subtitle: "Network discovery and scanning" };
    }
    if (pathname === "/scripts") return { title: "Scripts", subtitle: "Discovery scripts and automation templates" };
    if (pathname === "/policies") return { title: "Policies", subtitle: "Group scripts into policies for streamlined deployment" };
    if (pathname === "/discovery-scripts-marketplace") return { title: "Discovery Scripts Marketplace", subtitle: "Browse and download enterprise-grade discovery scripts from our comprehensive library" };
    if (pathname === "/discovery-probes") return { title: "Discovery Probes", subtitle: "Manage data collectors deployed across your network infrastructure" };
    if (pathname === "/satellite-job-queue") return { title: "Satellite Job Queue", subtitle: "Manage job queue for satellite server operations" };
    if (pathname === "/credential-profiles") return { title: "Enterprise Credential Vault", subtitle: "Advanced credential management with enterprise-grade security, compliance, and audit capabilities" };
    if (pathname === "/external-integrations") return { title: "External Integrations", subtitle: "Manage bidirectional integrations with external systems" };
    if (pathname === "/domain-management") return { title: "Domain Management", subtitle: "Manage multi-domain configuration and hierarchical relationships" };
    if (pathname === "/tenant-management") return { title: "Tenant Management", subtitle: "Manage multi-tenant configuration and resource allocation" };
    if (pathname === "/asset-inventory") return { title: "Asset Inventory", subtitle: "Comprehensive enterprise asset inventory management with dynamic fields and hierarchical reporting" };
    if (pathname === "/agentless-discovery") return { title: "Agentless Discovery", subtitle: "Manage automated network discovery and compliance scanning" };
    if (pathname === "/agentless-jobs") return { title: "Agentless Discovery Jobs", subtitle: "Manage and monitor automated network discovery jobs with enterprise-grade filtering" };
    if (pathname.startsWith("/agentless-discovery/view/")) return { title: "Job Details", subtitle: "View discovery job results and configuration" };
    if (pathname === "/agent-discovery") return { title: "Agent-Based Discovery", subtitle: "Deploy discovery policies to agent-based endpoints" };
    if (pathname === "/agent-status-reports") return { title: "Agent Status Reports", subtitle: "Comprehensive analysis of agent discovery effectiveness and policy compliance" };
    if (pathname === "/remote-agent-deployment") return { title: "Remote Agent Deployment", subtitle: "Enterprise-grade remote agent deployment with multi-OS support and comprehensive monitoring" };
    if (pathname === "/user-management") return { title: t("user_management"), subtitle: "User accounts and permissions" };
    if (pathname === "/settings") return { title: t("settings"), subtitle: "System configuration" };
    return { title: "Page", subtitle: "Description" };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <EnterpriseSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300",
        isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        <EnterpriseTopHeader setIsSidebarOpen={setIsSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/assets" component={AssetsPage} />
            <Route path="/assets/agent-based" component={AssetsPage} />
            <Route path="/assets/agentless" component={AssetsPage} />
            <Route path="/discovery" component={DiscoveryPage} />
            <Route path="/discovery/scheduled" component={DiscoveryPage} />
            <Route path="/discovery/scripts" component={DiscoveryScriptsPage} />
            <Route path="/scripts" component={DiscoveryScriptsPage} />
            <Route path="/policies" component={ScriptPoliciesPage} />
            <Route path="/discovery-scripts-marketplace" component={DiscoveryScriptsMarketplacePage} />
            <Route path="/script-policies" component={ScriptPoliciesPage} />
            <Route path="/discovery-probes" component={DiscoveryProbesPage} />
            <Route path="/satellite-job-queue" component={SatelliteJobQueuePage} />
            <Route path="/credential-profiles" component={EnterpriseCredentialProfilesPage} />
            <Route path="/external-integrations" component={ExternalIntegrationsPage} />
            <Route path="/domain-management" component={DomainManagementPage} />
            <Route path="/tenant-management" component={TenantManagementPage} />
            <Route path="/asset-inventory" component={AssetInventoryPage} />
            <Route path="/agentless-discovery" component={AgentlessDiscoveryPage} />
            <Route path="/agentless-jobs" component={AgentlessJobsPage} />
            <Route path="/agentless-discovery/create" component={AgentlessJobCreationWizard} />
            <Route path="/agentless-discovery/view/:id" component={AgentlessJobDetails} />
            <Route path="/agent-discovery" component={AgentBasedDiscoveryPage} />
            <Route path="/agent-status-reports" component={AgentStatusReportsPage} />
            <Route path="/remote-agent-deployment" component={RemoteAgentDeploymentPage} />
            <Route path="/user-management" component={UserManagementPage} />
            <Route path="/alerts" component={() => <div>Alerts & Notifications page</div>} />
            <Route path="/reports" component={() => <div>Reports page</div>} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/i18n-demo" component={I18nDemoPage} />
            <Route path="/simple-i18n-demo" component={SimpleI18nDemoPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <SimpleI18nProvider>
            <DomainTenantProvider>
              <TooltipProvider>
                <AppContent />
                <Toaster />
              </TooltipProvider>
            </DomainTenantProvider>
          </SimpleI18nProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
