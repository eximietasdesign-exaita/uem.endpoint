import React from "react";
import { Dashboard } from "@/components/Dashboard";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DashboardPage() {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <Dashboard />
    </div>
  );
}
