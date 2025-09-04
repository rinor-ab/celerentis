'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  DollarSign,
  FolderOpen,
  BarChart3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPICard } from '@/components/ui/kpi-card';
import { ProjectCard } from '@/components/ui/project-card';
import { SpendChart } from '@/components/ui/spend-chart';
import { useProjects, useBillingUsage } from '@/lib/hooks/use-api';
import { ProjectStatus, Project } from '@/lib/types';
import { debounce } from '@/lib/utils';
import Link from 'next/link';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    []
  );

  // Fetch data
  const { data: projectsData, isLoading: projectsLoading } = useProjects({
    search: searchQuery || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const { data: billingData } = useBillingUsage();

  const projects: Project[] = projectsData?.items || [];
  const totalProjects = projectsData?.total || 0;

  // Calculate KPIs
  const kpis = useMemo(() => {
    const completed = projects.filter((p: Project) => p.status === 'complete').length;
    const processing = projects.filter((p: Project) => p.status === 'processing').length;
    const totalSpend = projects.reduce((sum: number, p: Project) => sum + (p.costCents || 0), 0);
    const avgCost = projects.length > 0 ? totalSpend / projects.length : 0;

    return {
      totalProjects,
      completed,
      processing,
      totalSpend,
      avgCost,
    };
  }, [projects, totalProjects]);

  // Recent projects (last 5)
  const recentProjects = projects.slice(0, 5);

  // Billing usage for chart (last 7 days)
  const recentUsage = billingData?.slice(0, 7) || [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const statusOptions: { value: ProjectStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Projects' },
    { value: 'complete', label: 'Complete' },
    { value: 'processing', label: 'Processing' },
    { value: 'error', label: 'Error' },
    { value: 'queued', label: 'Queued' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New IM
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Projects"
          value={kpis.totalProjects}
          icon={FolderOpen}
          change={{ value: 12, type: 'increase' }}
        />
        <KPICard
          title="Completed"
          value={kpis.completed}
          icon={CheckCircle}
          change={{ value: 8, type: 'increase' }}
        />
        <KPICard
          title="Processing"
          value={kpis.processing}
          icon={Clock}
          change={{ value: 2, type: 'decrease' }}
        />
        <KPICard
          title="Total Spend"
          value={`$${(kpis.totalSpend / 100).toFixed(2)}`}
          icon={DollarSign}
          change={{ value: 15, type: 'increase' }}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">All Projects</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Recent Projects</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : recentProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by creating your first Information Memorandum.
                    </p>
                    <Button asChild>
                      <Link href="/projects/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New IM
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentProjects.map((project: Project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{project.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {project.domain || 'No domain'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {project.status}
                            </Badge>
                            {project.costCents && (
                              <span className="text-sm text-muted-foreground">
                                ${(project.costCents / 100).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Spend Chart */}
            {recentUsage.length > 0 ? (
              <SpendChart data={recentUsage} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Usage Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="mx-auto h-12 w-12 mb-4" />
                      <p>Usage data will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      onChange={handleSearchChange}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {statusOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={statusFilter === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
          {projectsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your search or filters.'
                      : 'Get started by creating your first Information Memorandum.'}
                  </p>
                  <Button asChild>
                    <Link href="/projects/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New IM
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project: Project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and insights will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
