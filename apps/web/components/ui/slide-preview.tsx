'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Download, 
  MoreHorizontal,
  FileText,
  Image,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TemplateSlide } from '@/lib/types';

interface SlidePreviewProps {
  slide: TemplateSlide;
  onToggleVisibility?: (slideId: string, visible: boolean) => void;
  onRegenerate?: (slideId: string) => void;
  onDownload?: (slideId: string) => void;
  className?: string;
}

export function SlidePreview({ 
  slide, 
  onToggleVisibility, 
  onRegenerate, 
  onDownload,
  className 
}: SlidePreviewProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getSlideIcon = (content: string) => {
    if (content.toLowerCase().includes('chart') || content.toLowerCase().includes('graph')) {
      return <BarChart3 className="h-4 w-4" />;
    }
    if (content.toLowerCase().includes('image') || content.toLowerCase().includes('photo')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const getSlideType = (content: string) => {
    if (content.toLowerCase().includes('executive summary')) return 'summary';
    if (content.toLowerCase().includes('financial')) return 'financial';
    if (content.toLowerCase().includes('market')) return 'market';
    if (content.toLowerCase().includes('team')) return 'team';
    return 'content';
  };

  const slideType = getSlideType(slide.content);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card 
        className={`relative overflow-hidden transition-all duration-200 ${
          slide.visible ? 'opacity-100' : 'opacity-60'
        } ${isHovered ? 'shadow-lg' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  #{slide.order}
                </Badge>
                <Badge 
                  variant={slideType === 'summary' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {slideType}
                </Badge>
              </div>
              <CardTitle className="text-sm font-medium truncate">
                {slide.title}
              </CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onToggleVisibility?.(slide.id, !slide.visible)}>
                  {slide.visible ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Hide Slide
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Show Slide
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRegenerate?.(slide.id)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Regenerate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload?.(slide.id)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Slide Preview */}
          <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              {getSlideIcon(slide.content)}
              <p className="text-xs text-muted-foreground mt-1">Slide Preview</p>
            </div>
            
            {/* Overlay for hidden slides */}
            {!slide.visible && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <EyeOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Hidden</p>
                </div>
              </div>
            )}
          </div>

          {/* Slide Content Preview */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground line-clamp-3">
              {slide.content}
            </p>
          </div>

          {/* Quick Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center justify-between pt-3 border-t"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleVisibility?.(slide.id, !slide.visible)}
                  className="h-8 px-2"
                >
                  {slide.visible ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRegenerate?.(slide.id)}
                    className="h-8 px-2"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload?.(slide.id)}
                    className="h-8 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
