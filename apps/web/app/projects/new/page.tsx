'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { useCreateProject, useUploadFiles, useGenerateProject } from '@/lib/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { formatFileSize } from '@/lib/utils';
import Link from 'next/link';

interface FileWithPreview extends File {
  id: string;
  status?: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [projectName, setProjectName] = useState('');
  const [domain, setDomain] = useState('');
  const [pullPublicData, setPullPublicData] = useState(true);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  // API hooks
  const createProject = useCreateProject();
  const uploadFiles = useUploadFiles();
  const generateProject = useGenerateProject();

  // File handling
  const handleFilesAccepted = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file && file.name && file.size > 0);
    const filesWithIds = validFiles.map(file => ({
      ...file,
      id: `file-${Date.now()}-${Math.random()}`,
      status: 'uploading' as const,
    }));
    setFiles(prev => [...prev, ...filesWithIds]);
  };

  const handleFileRemove = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Validation
  const isStep1Valid = projectName.trim().length > 0;
  const isStep2Valid = files.some(file => file && file.name && file.name.endsWith('.pptx'));
  const canProceed = step === 1 ? isStep1Valid : isStep2Valid;

  // Cost estimation
  const validFileCount = files.filter(file => file && file.name).length;
  const estimatedCost = validFileCount > 0 ? Math.max(15, validFileCount * 5) : 0;
  const estimatedTime = validFileCount > 0 ? Math.max(5, validFileCount * 2) : 0;

  const handleNext = async () => {
    if (step === 1) {
      if (!isStep1Valid) return;
      
      try {
        setIsSubmitting(true);
        const project = await createProject.mutateAsync({
          name: projectName,
          domain: domain || undefined,
          pullPublicData,
        });
        setProjectId(project.id);
        setStep(2);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create project. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 2) {
      if (!isStep2Valid || !projectId) return;
      
      try {
        setIsSubmitting(true);
        
        // Upload files
        const validFiles = files.filter(file => file && file.name && file.size > 0);
        if (validFiles.length > 0) {
          await uploadFiles.mutateAsync({
            projectId,
            files: validFiles.map(f => f as File),
          });
        }
        
        // Start generation
        const { jobId } = await generateProject.mutateAsync(projectId);
        
        toast({
          title: 'Success',
          description: 'Project created and generation started!',
        });
        
        router.push(`/projects/${projectId}`);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to start generation. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New IM</h1>
          <p className="text-muted-foreground">
            Step {step} of 2: {step === 1 ? 'Project Details' : 'Upload Files'}
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center space-x-4">
        {[1, 2].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
              ${step >= stepNumber 
                ? 'bg-brand border-brand text-brand-foreground' 
                : 'bg-background border-muted-foreground/30 text-muted-foreground'
              }
            `}>
              {step > stepNumber ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{stepNumber}</span>
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step >= stepNumber ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {stepNumber === 1 ? 'Project Details' : 'Upload Files'}
            </span>
            {stepNumber < 2 && (
              <div className="w-8 h-0.5 bg-border mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Project Details */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Project Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    placeholder="e.g., TechCorp Acquisition"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Company Website (optional)</Label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="domain"
                      placeholder="https://example.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                <Toggle
                  pressed={pullPublicData}
                  onPressedChange={setPullPublicData}
                />
                <div className="flex-1">
                  <Label className="text-sm font-medium">
                    Fetch public company data
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically fetch logo, market info, and company details
                  </p>
                </div>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: File Upload */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Files</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileDropzone
                onFilesAccepted={handleFilesAccepted}
                onFileRemove={handleFileRemove}
                files={files}
                maxSize={50 * 1024 * 1024} // 50MB
                maxFiles={5}
              />
            </CardContent>
          </Card>

          {/* Cost & Time Estimation */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Estimation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-success" />
                    <div>
                      <div className="font-medium">Estimated Cost</div>
                      <div className="text-2xl font-bold">${estimatedCost}.00</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-brand" />
                    <div>
                      <div className="font-medium">Estimated Time</div>
                      <div className="text-2xl font-bold">{estimatedTime} min</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="min-w-32"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {step === 1 ? 'Creating...' : 'Starting...'}
            </>
          ) : (
            step === 2 ? 'Generate IM' : 'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}
