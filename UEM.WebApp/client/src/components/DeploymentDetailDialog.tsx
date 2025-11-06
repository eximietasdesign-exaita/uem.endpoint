import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Server, CheckCircle, XCircle, Clock, Activity, FileText, User, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  type AgentPolicyDeployment,
  type ScriptPolicy,
  type CredentialProfile,
  type DiscoveryProbe
} from '../../../shared/types';

type ParsedTargets = {
  ipRanges: string[];
  ipSegments: string[];
  hostnames: string[];
  ouPaths: string[];
};

const deepParseJson = (value: any, depth = 5): any => {
  if (value == null || depth <= 0) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;

  let s = value.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }

  // try replacing doubled quotes commonly seen from some serializers
  if (s.includes('""')) {
    try {
      return JSON.parse(s.replace(/""/g, '"'));
    } catch { /* fallthrough */ }
  }

  try {
    const parsed = JSON.parse(s);
    return typeof parsed === 'string' ? deepParseJson(parsed, depth - 1) : parsed;
  } catch {
    try {
      const unescaped = s.replace(/\\"/g, '"').replace(/\\'/g, "'");
      const parsed2 = JSON.parse(unescaped);
      return typeof parsed2 === 'string' ? deepParseJson(parsed2, depth - 1) : parsed2;
    } catch {
      return null;
    }
  }
};

const parseJsonb = <T,>(value: any): T | null => {
  if (value == null) return null;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    const v = deepParseJson(value);
    return (v as T) ?? null;
  }
  return null;
};

const normalizeArray = (v: any): string[] => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof v === 'string') {
    const parsed = deepParseJson(v);
    if (Array.isArray(parsed)) return parsed.map(String).map(s => s.trim()).filter(Boolean);
    return v.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (typeof v === 'object') {
    const keys = Object.keys(v);
    if (keys.every(k => /^\d+$/.test(k))) {
      return keys.map(k => String((v as any)[k]).trim()).filter(Boolean);
    }
  }
  return [];
};

const parseTargets = (value: any): ParsedTargets => {
  const empty: ParsedTargets = { ipRanges: [], ipSegments: [], hostnames: [], ouPaths: [] };
  if (value == null) return empty;

  const payload = deepParseJson(value) ?? value;
  if (!payload || typeof payload !== 'object') return empty;

  const get = (keys: string[]) => {
    for (const k of keys) {
      if (k in payload) return normalizeArray((payload as any)[k]);
    }
    return [];
  };

  const ipRanges = get(['IpRanges', 'ipRanges', 'ip_ranges', 'Ip_Ranges', 'ipRange', 'iprange']);
  const ipSegments = get(['IpSegments', 'ipSegments', 'ip_segments', 'Ip_Segments', 'ipSegment', 'cidr', 'CIDR']);
  const hostnames = get(['Hostnames', 'hostnames', 'host_name', 'HostName', 'hosts']);
  const ouPaths = get(['OuPaths', 'ouPaths', 'ou_paths', 'OUPaths', 'ouPath']);

  return {
    ipRanges,
    ipSegments,
    hostnames,
    ouPaths
  };
};

const getStatusAppearance = (status?: string) => {
  const s = (status ?? 'pending').toString().trim().toLowerCase().replace(/_/g, ' ');
  switch (s) {
    case 'completed':
    case 'success':
      return { color: 'bg-green-100 text-green-800', label: 'Completed', Icon: CheckCircle };
    case 'failed':
    case 'error':
      return { color: 'bg-red-100 text-red-800', label: 'Failed', Icon: XCircle };
    case 'in progress':
    case 'running':
      return { color: 'bg-blue-100 text-blue-800', label: 'In Progress', Icon: Activity };
    case 'scheduled':
      return { color: 'bg-purple-100 text-purple-800', label: 'Scheduled', Icon: Clock };
    default:
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', Icon: Clock };
  }
};

const SummaryTab = ({ deployment }: { deployment: AgentPolicyDeployment }) => {
  if (!deployment) return null;

  const { data: rawDeployment, isLoading: isRawLoading } = useQuery<any>({
    queryKey: ['deployment-details-raw', deployment.id],
    queryFn: async () => {
      const resp = await apiRequest('GET', `/api/policy-deployments/${deployment.id}/details`);
      if (resp && typeof (resp as Response).json === 'function') return await (resp as Response).json();
      return resp;
    },
    enabled: !!deployment.id,
    staleTime: 30_000
  });

  const source = rawDeployment ?? deployment;

  const policyIds = parseJsonb<number[]>(source.policy_ids ?? source.policyIds ?? source.selectedPolicyIds) ?? [];
  const parsedTargets = parseTargets(source.targets ?? source.target ?? source.targets_json ?? deployment.targets ?? null);
  const targets = {
    ipRanges: parsedTargets.ipRanges ?? [],
    ipSegments: parsedTargets.ipSegments ?? [],
    hostnames: parsedTargets.hostnames ?? [],
    ouPaths: parsedTargets.ouPaths ?? []
  };

  const rawSchedule = source.schedule ?? source.Schedule ?? deployment.schedule ?? null;
  const parsedScheduleRaw = deepParseJson(rawSchedule) ?? rawSchedule;
  const schedule = {
    type: String(parsedScheduleRaw?.Type ?? parsedScheduleRaw?.type ?? 'now').toLowerCase(),
    frequency: parsedScheduleRaw?.Frequency ?? parsedScheduleRaw?.frequency ?? null,
    time: parsedScheduleRaw?.Time ?? parsedScheduleRaw?.time ?? null,
    businessHours: parsedScheduleRaw?.BusinessHours ?? parsedScheduleRaw?.businessHours ?? null
  };

  const progress = parseJsonb<{ total: number; applied: number; inProgress: number; pending: number; failed: number }>(source.progress ?? source.deployedMachines) ?? { total: 0, applied: 0, inProgress: 0, pending: 0, failed: 0 };
  const results = parseJsonb<any>(source.deployment_results ?? source.results) ?? {};

  const deploymentMethod = source.deployment_method ?? source.deploymentMethod ?? (deployment as any).deploymentMethod ?? '—';
  const credentialId = source.credential_profile_id ?? source.credentialProfileId ?? deployment.credentialProfileId ?? null;
  const probeCandidates = source.probe_id ?? source.probeIds ?? deployment.selectedProbeIds ?? null;
  const probeIds = Array.isArray(probeCandidates) ? probeCandidates : (probeCandidates ? [probeCandidates] : []);
  const policyIdList: number[] = Array.isArray(policyIds) ? policyIds.map((v: any) => Number(v)).filter(n => !Number.isNaN(n)) : [];
  const probeIdList: number[] = Array.isArray(probeIds) ? probeIds.map((v: any) => Number(v)).filter(n => !Number.isNaN(n)) : [];

  const { data: policies = [], isLoading: policiesLoading } = useQuery<ScriptPolicy[]>({
    queryKey: ['script-policies-by-id', policyIdList.join(',')],
    queryFn: async () => {
      if (policyIdList.length === 0) return [];
      const res = await apiRequest('GET', `/api/policy/script-policies?ids=${policyIdList.join(',')}`);
      if (res && typeof (res as Response).json === 'function') return await (res as Response).json();
      return res;
    },
    enabled: policyIdList.length > 0
  });

  const { data: credentialProfile, isLoading: credentialLoading } = useQuery<CredentialProfile>({
    queryKey: ['credential-profile-by-id', credentialId],
    queryFn: async () => {
      if (!credentialId) return null;
      const res = await apiRequest('GET', `/api/credential-profiles/${credentialId}`);
      if (res && typeof (res as Response).json === 'function') return await (res as Response).json();
      return res;
    },
    enabled: !!credentialId
  });

  const { data: probes = [], isLoading: probesLoading } = useQuery<DiscoveryProbe[]>({
    queryKey: ['discovery-probes-by-id', probeIdList.join(',')],
    queryFn: async () => {
      if (probeIdList.length === 0) return [];
      const res = await apiRequest('GET', `/api/discovery-probes?ids=${probeIdList.join(',')}`);
      if (res && typeof (res as Response).json === 'function') return await (res as Response).json();
      return res;
    },
    enabled: probeIdList.length > 0
  });

  const { total = 0, applied = 0, inProgress = 0, pending = 0, failed = 0 } = progress;
  const progressPct = total > 0 ? Math.round((applied / total) * 100) : 0;
  const statusAppearance = getStatusAppearance(rawDeployment?.status ?? deployment.status);
  const formatDate = (d?: string | number) => d ? new Date(d).toLocaleString() : '—';

  if (isRawLoading) return <div className="text-center p-8">Loading deployment details...</div>;

  return (
    <ScrollArea className="h-[500px] p-1 pr-4">
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{rawDeployment?.name ?? deployment.name}</h3>
            <p className="text-sm text-muted-foreground">{rawDeployment?.description ?? deployment.description}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <Badge className={`${statusAppearance.color} font-medium`}>
              <statusAppearance.Icon className="w-4 h-4 mr-1.5" />
              {statusAppearance.label}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              Created: {formatDate(rawDeployment?.created_at ?? deployment.createdAt)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <h4 className="font-semibold text-base mb-4 text-gray-700 dark:text-gray-300">Deployment Stats</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between items-center"><span>Total Targets</span><span className="font-bold text-gray-800 dark:text-gray-200 text-lg">{total}</span></div>
              <div className="flex justify-between items-center"><span>Applied</span><span className="font-bold text-green-600 text-lg">{applied}</span></div>
              <div className="flex justify-between items-center"><span>In Progress</span><span className="font-bold text-blue-600 text-lg">{inProgress}</span></div>
              <div className="flex justify-between items-center"><span>Pending</span><span className="font-bold text-yellow-600 text-lg">{pending}</span></div>
              <div className="flex justify-between items-center"><span>Failed</span><span className="font-bold text-red-600 text-lg">{failed}</span></div>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Overall Progress</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-base mb-4 text-gray-700 dark:text-gray-300">Configuration</h4>
            <div className="space-y-4 text-sm">
              <div>
                <strong className="flex items-center font-semibold text-gray-600 dark:text-gray-400"><FileText className="w-4 h-4 mr-2" />Policies:</strong>
                <div className="mt-1 pl-6 text-muted-foreground">
                  {policiesLoading ? <span>Loading...</span> :
                    policyIdList.length > 0 ? policyIdList.map(id => (<div key={id}>{(policies as ScriptPolicy[]).find(p => Number(p.id) === Number(id))?.name ?? `Policy ${id}`}</div>)) :
                      <span>No policies selected</span>}
                </div>
              </div>

              <div>
                <strong className="flex items-center font-semibold text-gray-600 dark:text-gray-400"><User className="w-4 h-4 mr-2" />Credential Profile:</strong>
                <div className="mt-1 pl-6 text-muted-foreground">
                  {credentialLoading ? <span>Loading...</span> :
                    credentialProfile ? <span>{credentialProfile.name}</span> :
                      <span>Not set</span>}
                </div>
              </div>

              <div>
                <strong className="flex items-center font-semibold text-gray-600 dark:text-gray-400"><Server className="w-4 h-4 mr-2" />Satellite Server(s):</strong>
                <div className="mt-1 pl-6 text-muted-foreground">
                  {probesLoading ? <span>Loading...</span> :
                    probeIdList.length > 0 ? probeIdList.map(id => (<div key={id}>{(probes as DiscoveryProbe[]).find(p => Number(p.id) === Number(id))?.name ?? `Server ${id}`}</div>)) :
                      <span>Not set</span>}
                </div>
              </div>

              <div>
                <strong className="font-semibold text-gray-600 dark:text-gray-400">Schedule:</strong>
                <div className="mt-1 pl-6 text-muted-foreground">
                  {schedule.type === 'now' ? 'Run now' :
                    schedule.type === 'later' ? (schedule.frequency ? `Scheduled: ${schedule.frequency}${schedule.time ? ` at ${schedule.time}` : ''}` : 'Scheduled (no frequency set)') :
                      `Scheduled: ${String(schedule.type)}${schedule.time ? ` at ${schedule.time}` : ''}`}
                  {schedule.businessHours ? <div className="text-xs text-muted-foreground mt-1">Business hours: enabled</div> : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-base mb-2 text-gray-700 dark:text-gray-300">Targets</h4>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-sm text-muted-foreground">
            {(targets.ipRanges.length === 0 && targets.ipSegments.length === 0 && targets.hostnames.length === 0 && targets.ouPaths.length === 0) ? (
              <p>Criteria-based targeting / no explicit targets</p>
            ) : (
              <div className="space-y-1">
                {targets.ipRanges.length > 0 && <p><strong>IP Ranges:</strong> {targets.ipRanges.join(', ')}</p>}
                {targets.ipSegments.length > 0 && <p><strong>IP Segments:</strong> {targets.ipSegments.join(', ')}</p>}
                {targets.hostnames.length > 0 && <p><strong>Hostnames:</strong> {targets.hostnames.join(', ')}</p>}
                {targets.ouPaths.length > 0 && <p><strong>OU Paths:</strong> {targets.ouPaths.join(', ')}</p>}
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-base mb-2 text-gray-700 dark:text-gray-300">Metadata</h4>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="space-y-3">
                <div className="flex">
                  <strong className="w-32 flex-shrink-0">Deployment Method:</strong>
                  <span className="text-muted-foreground capitalize">{String(deploymentMethod).replace('_', ' ')}</span>
                </div>
                <div className="flex"><strong className="w-32 flex-shrink-0">Credential Profile ID:</strong> <span className="text-muted-foreground">{credentialId ?? '—'}</span></div>
                <div className="flex"><strong className="w-32 flex-shrink-0">Started At:</strong> <span className="text-muted-foreground">{formatDate(rawDeployment?.started_at)}</span></div>
                <div className="flex"><strong className="w-32 flex-shrink-0">Created At:</strong> <span className="text-muted-foreground">{formatDate(rawDeployment?.created_at ?? deployment.createdAt)}</span></div>
                <div className="flex"><strong className="w-32 flex-shrink-0">Domain ID:</strong> <span className="text-muted-foreground">{rawDeployment?.domain_id ?? '—'}</span></div>
              </div>
              <div className="space-y-3">
                <div className="flex"><strong className="w-32 flex-shrink-0">Probe ID(s):</strong> <span className="text-muted-foreground">{probeIdList.join(', ') || '—'}</span></div>
                <div className="flex"><strong className="w-32 flex-shrink-0">Created By:</strong> <span className="text-muted-foreground">{rawDeployment?.created_by ?? '—'}</span></div>
                <div className="flex"><strong className="w-32 flex-shrink-0">Completed At:</strong> <span className="text-muted-foreground">{formatDate(rawDeployment?.completed_at)}</span></div>
                <div className="flex"><strong className="w-32 flex-shrink-0">Updated At:</strong> <span className="text-muted-foreground">{formatDate(rawDeployment?.updated_at)}</span></div>
                <div className="flex"><strong className="w-32 flex-shrink-0">Tenant ID:</strong> <span className="text-muted-foreground">{rawDeployment?.tenant_id ?? '—'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

const AgentStatusTab = ({ jobId }: { jobId: number }) => {
  type AgentStatus = {
    agentId?: string | number;
    hostname?: string;
    status?: string;
    message?: string;
    updatedAt?: string | number | Date;
    [key: string]: any;
  };

  const { data: agents = [], isLoading, isError, error } = useQuery<AgentStatus[]>({
    queryKey: ['deployment-details-agents', jobId],
    queryFn: async () => {
      const resp = await apiRequest('GET', `/api/policy-deployments/${jobId}/details`);
      if (resp && typeof (resp as Response).json === 'function') {
        const data = await (resp as Response).json();
        if (Array.isArray(data)) return data as AgentStatus[];
        return (data.agents ?? data.results?.agents ?? data.agent_statuses ?? data.agentStatuses ?? []) as AgentStatus[];
      }
      return [];
    },
    enabled: !!jobId,
    refetchInterval: 5000
  });

  const normalizedAgents: AgentStatus[] = Array.isArray(agents) ? agents : (agents as any).agents ?? [];

  if (isLoading) return <p className="text-center p-8">Loading agent statuses...</p>;
  if (isError) return <p className="text-center p-8 text-red-500">Error: {(error as Error).message}</p>;
  if (normalizedAgents.length === 0) return <p className="text-center p-8 text-gray-500">No agent tasks found for this deployment job yet.</p>;

  return (
    <ScrollArea className="h-[450px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hostname</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-1/2">Message</TableHead>
            <TableHead>Last Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {normalizedAgents.map((agent) => {
            const { color, Icon, label } = getStatusAppearance(agent.status);
            return (
              <TableRow key={agent.agentId}>
                <TableCell className="font-medium">{agent.hostname ?? agent.agentId}</TableCell>
                <TableCell>
                  <Badge className={color}>
                    <Icon className="h-3 w-3 mr-1.5" />
                    {label}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{agent.message ?? 'No message.'}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{agent.updatedAt ? new Date(agent.updatedAt).toLocaleTimeString() : 'N/A'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export function DeploymentDetailDialog({ deployment, onClose }: { deployment: AgentPolicyDeployment | null, onClose: () => void }) {
  if (!deployment) return null;

  return (
    <Dialog open={!!deployment} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Deployment Details: {deployment.name}
          </DialogTitle>
          <DialogDescription>
            Detailed configuration and live agent status for job #{deployment.id}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="agent-status">Agent Status</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="pt-6">
              <SummaryTab deployment={deployment} />
            </TabsContent>
            <TabsContent value="agent-status" className="pt-6">
              <AgentStatusTab jobId={deployment.id} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}