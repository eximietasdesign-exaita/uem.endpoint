import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "/api/cloud";

export interface CloudProvider {
  id: number;
  name: string;
  providerType: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CloudCredential {
  id: number;
  tenantId: number;
  domainId?: number;
  providerId: number;
  credentialName: string;
  encryptedAccessKey: string;
  encryptedSecretKey?: string;
  region?: string;
  accountId?: string;
  projectId?: string;
  subscriptionId?: string;
  isActive: boolean;
  lastValidated?: string;
  validationStatus?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CloudDiscoveryJob {
  id: number;
  tenantId: number;
  domainId?: number;
  credentialId: number;
  jobName: string;
  scheduleType: string;
  cronExpression?: string;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  lastStatus?: string;
  resourceTypes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CloudStats {
  providersCount: number;
  credentialsCount: number;
  jobsCount: number;
  assetsCount: number;
}

export function useCloudProviders() {
  return useQuery<CloudProvider[]>({
    queryKey: ["cloudProviders"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/providers`);
      if (!response.ok) {
        throw new Error("Failed to fetch cloud providers");
      }
      return response.json();
    },
  });
}

export function useCloudCredentials(tenantId?: number, domainId?: number) {
  return useQuery<CloudCredential[]>({
    queryKey: ["cloudCredentials", tenantId, domainId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tenantId) params.append("tenantId", tenantId.toString());
      if (domainId) params.append("domainId", domainId.toString());
      
      const response = await fetch(`${API_BASE}/credentials?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch cloud credentials");
      }
      return response.json();
    },
    enabled: !!tenantId, // Only fetch if tenantId is provided
  });
}

export function useCloudDiscoveryJobs(tenantId?: number, domainId?: number) {
  return useQuery<CloudDiscoveryJob[]>({
    queryKey: ["cloudDiscoveryJobs", tenantId, domainId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tenantId) params.append("tenantId", tenantId.toString());
      if (domainId) params.append("domainId", domainId.toString());
      
      const response = await fetch(`${API_BASE}/jobs?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch cloud discovery jobs");
      }
      return response.json();
    },
    enabled: !!tenantId, // Only fetch if tenantId is provided
  });
}

export function useCloudStats(tenantId?: number, domainId?: number) {
  return useQuery<CloudStats>({
    queryKey: ["cloudStats", tenantId, domainId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tenantId) params.append("tenantId", tenantId.toString());
      if (domainId) params.append("domainId", domainId.toString());
      
      const response = await fetch(`${API_BASE}/stats?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch cloud stats");
      }
      return response.json();
    },
  });
}

export function useCreateCloudCredential() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credential: Partial<CloudCredential>) => {
      const response = await fetch(`${API_BASE}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credential),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create cloud credential");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cloudCredentials"] });
      queryClient.invalidateQueries({ queryKey: ["cloudStats"] });
    },
  });
}

export function useCreateCloudDiscoveryJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (job: Partial<CloudDiscoveryJob>) => {
      const response = await fetch(`${API_BASE}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create cloud discovery job");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cloudDiscoveryJobs"] });
      queryClient.invalidateQueries({ queryKey: ["cloudStats"] });
    },
  });
}
