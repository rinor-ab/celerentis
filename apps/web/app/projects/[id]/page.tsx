'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  FileText, 
  Calendar, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Eye,
  Settings,
  X,
  Copy,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusPill } from '@/components/ui/status-pill';
import { ProgressStepper, IM_GENERATION_STEPS } from '@/components/ui/progress-stepper';
import { useProject, useJob, useDownloadProject } from '@/lib/hooks/use-api';
import { useJobPolling } from '@/lib/hooks/use-job-polling';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatRelativeTime, copyToClipboard, formatFileSize } from '@/lib/utils';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');
  const [logsOpen, setLogsOpen] = useState(false);

  // Fetch data
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { job, isLoading: jobLoading } = useJobPolling(project?.jobId);
  const downloadProject = useDownloadProject();

  // Handle download
  const handleDownload = async () => {
    try {
      await downloadProject.mutateAsync(projectId);
      toast({
        title: 'Download Started',
        description: 'Your Information Memorandum is being downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle copy to clipboard
  const handleCopyId = async () => {
    if (project?.id) {
      await copyToClipboard(project.id);
      toast({
        title: 'Copied',
        description: 'Project ID copied to clipboard.',
      });
    }
  };

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Project not found</h3>
        <p className="text-muted-foreground mb-4">
          The project you're looking for doesn't exist or has been deleted.
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const canDownload = project.status === 'complete';
  const isProcessing = project.status === 'processing' || project.status === 'queued';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <StatusPill status={project.status} />
              {project.domain && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <span>{project.domain}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isProcessing && (
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          {canDownload && (
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download IM
            </Button>
          )}
        </div>
      </div>

      {/* Progress Section */}
      {isProcessing && job && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Generation Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressStepper
              steps={IM_GENERATION_STEPS.map(step => ({
                ...step,
                status: step.id === job.stage ? 'current' :
                       IM_GENERATION_STEPS.findIndex(s => s.id === job.stage) > 
                       IM_GENERATION_STEPS.findIndex(s => s.id === step.id) ? 'completed' : 'upcoming'
              }))}
              currentStep={job.stage}
            />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{job.progress}%</span>
              </div>
              <Progress value={job.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Project Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Project ID</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {project.id}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyId}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Created</span>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatRelativeTime(project.createdAt)}</span>
                    </div>
                  </div>
                  {project.costCents && project.costCents > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cost</span>
                      <div className="flex items-center space-x-1 text-sm">
                        <DollarSign className="h-3 w-3" />
                        <span>{formatCurrency(project.costCents)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Information */}
            {job && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Job Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Job ID</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {job.id}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stage</span>
                      <Badge variant="outline">{job.stage}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm">{job.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Updated</span>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeTime(job.updatedAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent>
              {project.files && project.files.length > 0 ? (
                <div className="space-y-3">
                  {project.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {file.kind} • {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{file.kind}</Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No files uploaded</h3>
                  <p className="text-muted-foreground">
                    Files will appear here once uploaded.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {job && job.logs && job.logs.length > 0 ? (
                <div className="space-y-2">
                  {job.logs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-2 bg-muted/50 rounded text-sm font-mono"
                    >
                      <span className="text-muted-foreground text-xs">
                        {new Date().toLocaleTimeString()}
                      </span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No logs available</h3>
                  <p className="text-muted-foreground">
                    Logs will appear here once generation starts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Settings Coming Soon</h3>
                <p className="text-muted-foreground">
                  Project settings and configuration options will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
