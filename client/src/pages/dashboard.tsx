import React from "react";
import { Dashboard } from "@/components/Dashboard";
import { useLanguage } from "@/contexts/LanguageContext";
import { TenantContextBanner } from "@/components/TenantContextBanner";

export default function DashboardPage() {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <TenantContextBanner />
      <Dashboard />
    </div>
  );
}
