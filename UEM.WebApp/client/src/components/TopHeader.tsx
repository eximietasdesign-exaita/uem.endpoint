import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLocation } from "wouter";

interface TopHeaderProps {
  setIsSidebarOpen: (open: boolean) => void;
  getPageInfo: (pathname?: string) => { title: string; subtitle: string };
}

export function TopHeader({ setIsSidebarOpen, getPageInfo }: TopHeaderProps) {
  const [location] = useLocation();
  const { title, subtitle } = getPageInfo(location);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
