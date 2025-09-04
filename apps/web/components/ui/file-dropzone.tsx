'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatFileSize, isSpreadsheetFile, isPresentationFile } from '@/lib/utils';

interface FileWithPreview extends File {
  id: string;
  status?: 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  onFileRemove?: (fileId: string) => void;
  acceptedFileTypes?: {
    [key: string]: string[];
  };
  maxSize?: number;
  maxFiles?: number;
  files?: FileWithPreview[];
  className?: string;
  disabled?: boolean;
}

export function FileDropzone({
  onFilesAccepted,
  onFileRemove,
  acceptedFileTypes = {
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/zip': ['.zip'],
  },
  maxSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 10,
  files = [],
  className,
  disabled = false,
}: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAccepted(acceptedFiles);
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize,
    maxFiles,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const getFileIcon = (file: File) => {
    if (isPresentationFile(file.name)) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }
    if (isSpreadsheetFile(file.name)) {
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    }
    if (file.name.endsWith('.zip')) {
      return <Archive className="h-4 w-4 text-orange-500" />;
    }
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  const getFileType = (file: File) => {
    if (isPresentationFile(file.name)) return 'template';
    if (isSpreadsheetFile(file.name)) return 'financials';
    if (file.name.endsWith('.zip')) return 'documents';
    return 'other';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive || dragActive
            ? 'border-brand bg-brand/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ 
            scale: isDragActive ? 1.1 : 1,
            rotate: isDragActive ? 5 : 0 
          }}
          transition={{ duration: 0.2 }}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        </motion.div>
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Accepted formats: PPTX, XLSX, ZIP</p>
            <p>Max file size: {formatFileSize(maxSize)}</p>
            <p>Max files: {maxFiles}</p>
          </div>
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium">Uploaded Files</h4>
            <div className="space-y-2">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {getFileType(file)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-error" />
                    )}
                    {onFileRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFileRemove(file.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
