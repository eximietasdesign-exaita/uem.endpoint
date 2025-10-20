import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Pause,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarClock,
} from "lucide-react";
import { cloudDiscoveryApi } from "@/lib/api/cloudDiscovery";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface DiscoveryJobsListProps {
  tenantId: number;
}

export function DiscoveryJobsList({ tenantId }: DiscoveryJobsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteJobId, setDeleteJobId] = useState<number | null>(null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["cloudDiscoveryJobs", tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/cloud/jobs?tenantId=${tenantId}`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
    enabled: !!tenantId,
  });

  const { data: providers } = useQuery({
    queryKey: ["cloudProviders"],
    queryFn: () => cloudDiscoveryApi.getProviders(),
  });

  const runJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch(`/api/cloud/jobs/${jobId}/run`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to run job");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cloudDiscoveryJobs"] });
      toast({
        title: "Job started",
        description: "Discovery job has been queued for execution.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to run job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleJobMutation = useMutation({
    mutationFn: async ({ jobId, isActive }: { jobId: number; isActive: boolean }) => {
      const response = await fetch(`/api/cloud/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Failed to update job");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cloudDiscoveryJobs"] });
      toast({
        title: variables.isActive ? "Job enabled" : "Job disabled",
        description: `Discovery job has been ${variables.isActive ? "enabled" : "disabled"}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch(`/api/cloud/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete job");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cloudDiscoveryJobs"] });
      toast({
        title: "Job deleted",
        description: "Discovery job has been deleted successfully.",
      });
      setDeleteJobId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete job",
        description: error.message,
        variant: "destructive",
      });
      setDeleteJobId(null);
    },
  });

  const getProviderName = (providerId: number) => {
    return providers?.find((p: any) => p.id === providerId)?.name || "Unknown";
  };

  const getScheduleDisplay = (schedule: string | null) => {
    if (!schedule) return "On Demand";
    
    const scheduleMap: Record<string, string> = {
      "0 * * * *": "Hourly",
      "0 0 * * *": "Daily",
      "0 0 * * 1": "Weekly",
    };
    
    return scheduleMap[schedule] || schedule;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: "secondary", icon: Clock, label: "Pending" },
      running: { variant: "default", icon: Loader2, label: "Running" },
      completed: { variant: "default", icon: CheckCircle2, label: "Completed" },
      failed: { variant: "destructive", icon: XCircle, label: "Failed" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className={`h-3 w-3 ${status === "running" ? "animate-spin" : ""}`} />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center p-12 border-2 border-dashed rounded-lg">
        <CalendarClock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Discovery Jobs</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first discovery job to start scanning cloud resources
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job: any) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{job.name}</div>
                    {job.description && (
                      <div className="text-sm text-muted-foreground">{job.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getProviderName(job.providerId)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    {getScheduleDisplay(job.schedule)}
                  </div>
                </TableCell>
                <TableCell>
                  {job.lastRunAt ? (
                    <span className="text-sm">
                      {new Date(job.lastRunAt).toLocaleDateString()} {new Date(job.lastRunAt).toLocaleTimeString()}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Never</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(job.status || "pending")}</TableCell>
                <TableCell>
                  <Badge variant={job.isActive ? "default" : "secondary"}>
                    {job.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runJobMutation.mutate(job.id)}
                      disabled={runJobMutation.isPending}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toggleJobMutation.mutate({ jobId: job.id, isActive: !job.isActive })
                      }
                      disabled={toggleJobMutation.isPending}
                    >
                      {job.isActive ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteJobId(job.id)}
                      disabled={deleteJobMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteJobId !== null} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discovery Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this discovery job? This action cannot be undone.
              All associated discovery results will remain but no future scans will run.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteJobId && deleteJobMutation.mutate(deleteJobId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
