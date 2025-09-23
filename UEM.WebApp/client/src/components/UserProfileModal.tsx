import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "System Administrator",
    initials: "JD",
  };

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
  ];

  const themeOptions = [
    { value: "light", label: t("light_mode") },
    { value: "dark", label: t("dark_mode") },
    { value: "system", label: t("system_default") },
  ];

  const handleLogout = () => {
    // TODO: Implement logout functionality
    alert("Logout functionality would be implemented here");
    onClose();
  };

  const handleSaveChanges = () => {
    // TODO: Save user preferences to backend
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("user_profile")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-semibold">
                {user.initials}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.role}
              </p>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            {/* Language Preference */}
            <div className="space-y-2">
              <Label>{t("preferred_language")}</Label>
              <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Theme Preference */}
            <div className="space-y-2">
              <Label>{t("theme_preference")}</Label>
              <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">
                  {t("email_notifications")}
                </Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="desktop-notifications">
                  {t("desktop_notifications")}
                </Label>
                <Switch id="desktop-notifications" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button onClick={handleSaveChanges} className="flex-1">
              {t("save_changes")}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              {t("logout")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
