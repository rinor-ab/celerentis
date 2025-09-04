'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  MoreHorizontal, 
  Download, 
  Eye, 
  Calendar, 
  DollarSign,
  Tag,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusPill } from './status-pill';
import { ProjectTags } from './project-tags';
import { Project } from '@/lib/types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const canDownload = project.status === 'complete';
  const canView = project.status !== 'queued';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className={cn('h-full transition-all duration-200 hover:shadow-lg', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-brand transition-colors">
                {project.name}
              </h3>
              {project.domain && (
                <div className="flex items-center space-x-1 mt-1">
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">
                    {project.domain}
                  </span>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canView && (
                  <DropdownMenuItem asChild>
                    <Link href={`/projects/${project.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                )}
                {canDownload && (
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download IM
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <StatusPill status={project.status} />
            {project.costCents && project.costCents > 0 && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>{formatCurrency(project.costCents)}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <ProjectTags 
              tags={project.tags} 
              filterable={true}
              className="mb-2"
            />
          )}

          {/* Files */}
          {project.files && project.files.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Files ({project.files.length})
              </div>
              <div className="space-y-1">
                {project.files.slice(0, 2).map((file) => (
                  <div key={file.id} className="flex items-center justify-between text-xs">
                    <span className="truncate text-muted-foreground">{file.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {file.kind}
                    </Badge>
                  </div>
                ))}
                {project.files.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{project.files.length - 2} more files
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Created {formatRelativeTime(project.createdAt)}</span>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            {canView && (
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/projects/${project.id}`}>
                  <Eye className="mr-2 h-3 w-3" />
                  View
                </Link>
              </Button>
            )}
            {canDownload && (
              <Button size="sm" className="flex-1">
                <Download className="mr-2 h-3 w-3" />
                Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
