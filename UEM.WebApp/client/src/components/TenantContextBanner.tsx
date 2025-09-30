import React from "react";
import { useDomainTenant } from "@/contexts/DomainTenantContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle } from "lucide-react";

interface TenantContextBannerProps {
  showWarning?: boolean;
  className?: string;
}

export function TenantContextBanner({
  showWarning = true,
  className,
}: TenantContextBannerProps) {
  const { selectedDomain, selectedTenant, isLoading, error } = useDomainTenant();
  const hasContext = !!selectedDomain && !!selectedTenant;

  if (isLoading) {
    return (
      <div className={className}>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Loading domain and tenant context...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading domain and tenant context
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!hasContext && showWarning) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No domain or tenant selected. Please select a domain and tenant from
            the header to view data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (hasContext) {
    return (
      <div
        className={`${className} flex items-center justify-between bg-muted/30 p-3 rounded-lg border`}
      >
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Viewing data for:
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{selectedDomain?.displayName}</Badge>
          <span className="text-muted-foreground">/</span>
          <Badge variant="outline">{selectedTenant?.displayName}</Badge>
        </div>
      </div>
    );
  }

  return null;
}

export default TenantContextBanner;
