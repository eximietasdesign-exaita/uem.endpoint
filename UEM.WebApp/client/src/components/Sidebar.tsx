import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Shield,
  LayoutDashboard,
  Monitor,
  Search,
  Users,
  Bell,
  BarChart3,
  Settings,
  ChevronDown,
  Circle,
  FileText,
  Code,
  Radar,
  ShoppingCart,
  ArrowRightLeft,
  Globe,
  Building2,
  Database,
  Zap,
  Cloud,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["assets", "discovery"]),
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: t("dashboard") },
    {
      path: "/agentless-discovery",
      icon: Search,
      label: "Agentless Discovery",
    },
    { path: "/agent-discovery", icon: Monitor, label: "Agent Based Discovery" },
    {
      path: "/agent-status-reports",
      icon: BarChart3,
      label: "Agent Status Reports",
    },
    {
      path: "/remote-agent-deployment",
      icon: Zap,
      label: "Remote Agent Deployment",
    },
    {
      path: "/cloud-discovery",
      icon: Cloud,
      label: "Cloud Discovery",
    },
    { path: "/scripts", icon: Code, label: "Discovery Scripts" },
    { path: "/policies", icon: FileText, label: "Script Orchestrator" },
    {
      path: "/discovery-scripts-marketplace",
      icon: ShoppingCart,
      label: "Scripts Marketplace",
    },
    { path: "/discovery-probes", icon: Radar, label: "Satellite Server" },
    {
      path: "/credential-profiles",
      icon: Shield,
      label: "Credential Profiles",
    },
    {
      path: "/external-integrations",
      icon: ArrowRightLeft,
      label: "External Integrations",
    },
    {
      path: "/domain-management",
      icon: Globe,
      label: "Domain Management",
    },
    {
      path: "/tenant-management",
      icon: Building2,
      label: "Tenant Management",
    },
    {
      path: "/asset-inventory",
      icon: Database,
      label: "Asset Inventory",
    },
    { path: "/user-management", icon: Users, label: t("user_management") },
  ];

  const sectionsConfig = [
    { path: "/reports", icon: BarChart3, label: t("reports") },
    //{      key: "assets",      icon: Monitor,      label: t("assets"),
    // items: [
    //   { path: "/assets", label: t("all_endpoints") },
    //   // { path: "/assets/agent-based", label: t("agent_based") },
    //   // { path: "/assets/agentless", label: t("agentless") },
    // ],
    //},
    //{
    // key: "discovery",
    // icon: Search,
    // label: t("discovery"),
    // items: [
    //   { path: "/discovery", label: t("network_scan") },
    //   { path: "/discovery/scheduled", label: t("scheduled_tasks") },
    // ],
    // },
  ];

  const bottomNavItems = [
    //{ path: "/user-management", icon: Users, label: t("user_management") },
    //{ path: "/alerts", icon: Bell, label: t("alerts") },
    //{ path: "/reports", icon: BarChart3, label: t("reports") },
    { path: "/settings", icon: Settings, label: t("settings") },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Endpoint Management
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enterprise Management
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Main nav items */}
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              href={path}
              onClick={onClose}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive(path)
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </Link>
          ))}

          {/* Additional sections */}
          {sectionsConfig.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              href={path}
              onClick={onClose}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive(path)
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </Link>
          ))}

          {/* Bottom nav items */}
          {bottomNavItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              href={path}
              onClick={onClose}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive(path)
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
            <Circle className="w-2 h-2 text-green-500 fill-current" />
            <span>{t("system_status")}: Online</span>
          </div>
        </div>
      </div>
    </>
  );
}
