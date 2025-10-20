import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cloudDiscoveryApi } from "@/lib/api/cloudDiscovery";
import { Loader2, CalendarClock, Play } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface CreateDiscoveryJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: number;
  domainId: number;
}

type ScheduleType = "on-demand" | "hourly" | "daily" | "weekly" | "custom";

const scheduleOptions = [
  { value: "on-demand", label: "On Demand", description: "Run manually when needed" },
  { value: "hourly", label: "Hourly", description: "Every hour", cron: "0 * * * *" },
  { value: "daily", label: "Daily", description: "Once per day at midnight", cron: "0 0 * * *" },
  { value: "weekly", label: "Weekly", description: "Once per week on Monday", cron: "0 0 * * 1" },
  { value: "custom", label: "Custom", description: "Define custom cron expression" },
];

export function CreateDiscoveryJobDialog({
  open,
  onOpenChange,
  tenantId,
  domainId,
}: CreateDiscoveryJobDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [jobName, setJobName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedCredentialId, setSelectedCredentialId] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("on-demand");
  const [customCron, setCustomCron] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data: providers } = useQuery({
    queryKey: ["cloudProviders"],
    queryFn: () => cloudDiscoveryApi.getProviders(),
  });

  const { data: credentials } = useQuery({
    queryKey: ["cloudCredentials", tenantId],
    queryFn: () => cloudDiscoveryApi.getCredentials(tenantId),
    enabled: !!tenantId,
  });

  const filteredCredentials = credentials?.filter(
    (cred: any) => selectedProviderId ? cred.providerId === parseInt(selectedProviderId) : true
  );

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/cloud/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create discovery job");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cloudDiscoveryJobs"] });
      toast({
        title: "Discovery job created",
        description: "Your cloud discovery job has been created successfully.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setJobName("");
    setDescription("");
    setSelectedProviderId("");
    setSelectedCredentialId("");
    setScheduleType("on-demand");
    setCustomCron("");
    setIsActive(true);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!jobName.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a job name.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProviderId) {
      toast({
        title: "Validation error",
        description: "Please select a cloud provider.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCredentialId) {
      toast({
        title: "Validation error",
        description: "Please select credentials.",
        variant: "destructive",
      });
      return;
    }

    const scheduleOption = scheduleOptions.find((opt) => opt.value === scheduleType);
    const cronExpression =
      scheduleType === "custom"
        ? customCron
        : scheduleType === "on-demand"
        ? null
        : scheduleOption?.cron || null;

    if (scheduleType === "custom" && !customCron.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a custom cron expression.",
        variant: "destructive",
      });
      return;
    }

    createJobMutation.mutate({
      jobName: jobName,
      description,
      credentialId: parseInt(selectedCredentialId),
      tenantId,
      domainId,
      cronExpression: cronExpression,
      isEnabled: isActive,
      scheduleType,
    });
  };

  const selectedProvider = providers?.find((p: any) => p.id === parseInt(selectedProviderId));
  const selectedCredential = credentials?.find((c: any) => c.id === parseInt(selectedCredentialId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Create Discovery Job
          </DialogTitle>
          <DialogDescription>
            Schedule automated cloud resource discovery across your infrastructure
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="jobName">Job Name *</Label>
              <Input
                id="jobName"
                placeholder="e.g., Daily AWS Production Scan"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this job discovers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Cloud Provider *</Label>
              <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers?.map((provider: any) => (
                    <SelectItem key={provider.id} value={provider.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{provider.code}</Badge>
                        <span>{provider.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credential">Credentials *</Label>
              <Select
                value={selectedCredentialId}
                onValueChange={setSelectedCredentialId}
                disabled={!selectedProviderId}
              >
                <SelectTrigger id="credential">
                  <SelectValue placeholder="Select credentials" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCredentials?.map((credential: any) => (
                    <SelectItem key={credential.id} value={credential.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{credential.credentialName}</span>
                        {credential.validationStatus === "valid" && (
                          <Badge variant="default" className="text-xs">Valid</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  {filteredCredentials?.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground">
                      No credentials available for this provider
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedProvider && selectedCredential && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="text-sm font-medium">Selected Configuration</div>
                <div className="text-sm text-muted-foreground">
                  <div>Provider: <span className="font-medium">{selectedProvider.name}</span></div>
                  <div>Credentials: <span className="font-medium">{selectedCredential.credentialName}</span></div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label>Schedule Type</Label>
              <RadioGroup value={scheduleType} onValueChange={(value) => setScheduleType(value as ScheduleType)}>
                {scheduleOptions.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="font-medium cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                      {option.cron && (
                        <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                          {option.cron}
                        </code>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {scheduleType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customCron">Custom Cron Expression</Label>
                <Input
                  id="customCron"
                  placeholder="0 */6 * * *"
                  value={customCron}
                  onChange={(e) => setCustomCron(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Format: minute hour day month weekday (e.g., "0 */6 * * *" for every 6 hours)
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-4">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Enable job immediately after creation
              </Label>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={createJobMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createJobMutation.isPending}>
            {createJobMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Create Job
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
