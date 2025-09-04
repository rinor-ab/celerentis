import { http, HttpResponse } from 'msw';
import { factory, primaryKey } from '@mswjs/data';
import { Project, Job, Template, User, TeamMember, BillingUsage, Invoice, ApiKey } from '../types';

// Create a database
const db = factory({
  project: {
    id: primaryKey(String),
    name: String,
    domain: String,
    createdAt: String,
    status: String,
    costCents: Number,
    tags: Array,
    files: Array,
    jobId: String,
  },
  job: {
    id: primaryKey(String),
    projectId: String,
    stage: String,
    progress: Number,
    logs: Array,
    createdAt: String,
    updatedAt: String,
  },
  template: {
    id: primaryKey(String),
    name: String,
    description: String,
    industry: String,
    thumbnailUrl: String,
    slides: Array,
    createdAt: String,
    updatedAt: String,
  },
  user: {
    id: primaryKey(String),
    name: String,
    email: String,
    timezone: String,
    language: String,
    role: String,
  },
  teamMember: {
    id: primaryKey(String),
    name: String,
    email: String,
    role: String,
    status: String,
    invitedAt: String,
  },
  billingUsage: {
    date: primaryKey(String),
    cost: Number,
    projects: Number,
  },
  invoice: {
    id: primaryKey(String),
    amount: Number,
    status: String,
    createdAt: String,
    dueAt: String,
    downloadUrl: String,
  },
  apiKey: {
    id: primaryKey(String),
    name: String,
    key: String,
    lastUsed: String,
    createdAt: String,
    expiresAt: String,
  },
});

// Seed data
const seedData = () => {
  // Create sample projects
  db.project.create({
    id: 'proj-1',
    name: 'TechCorp Acquisition',
    domain: 'techcorp.com',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'complete',
    costCents: 2500, // $25.00
    tags: ['acquisition', 'tech', 'saas'],
    files: [
      { id: 'file-1', name: 'financials.xlsx', size: 1024000, kind: 'financials' },
      { id: 'file-2', name: 'documents.zip', size: 5120000, kind: 'documents' },
    ],
    jobId: 'job-1',
  });

  db.project.create({
    id: 'proj-2',
    name: 'GreenEnergy Solutions',
    domain: 'greenenergy.com',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    status: 'processing',
    costCents: 1800, // $18.00
    tags: ['energy', 'sustainability'],
    files: [
      { id: 'file-3', name: 'template.pptx', size: 2048000, kind: 'template' },
      { id: 'file-4', name: 'financials.xlsx', size: 1536000, kind: 'financials' },
    ],
    jobId: 'job-2',
  });

  db.project.create({
    id: 'proj-3',
    name: 'MedTech Innovations',
    domain: 'medtech.com',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    status: 'error',
    costCents: 0,
    tags: ['healthcare', 'medtech'],
    files: [
      { id: 'file-5', name: 'template.pptx', size: 3072000, kind: 'template' },
    ],
    jobId: 'job-3',
  });

  // Create sample jobs
  db.job.create({
    id: 'job-1',
    projectId: 'proj-1',
    stage: 'complete',
    progress: 100,
    logs: [
      'Job started',
      'Parsing financial data...',
      'Mining documents...',
      'Fetching public data...',
      'Building slides...',
      'Finalizing presentation...',
      'Job completed successfully',
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  });

  db.job.create({
    id: 'job-2',
    projectId: 'proj-2',
    stage: 'building_slides',
    progress: 75,
    logs: [
      'Job started',
      'Parsing financial data...',
      'Mining documents...',
      'Fetching public data...',
      'Building slides...',
    ],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  });

  db.job.create({
    id: 'job-3',
    projectId: 'proj-3',
    stage: 'error',
    progress: 25,
    logs: [
      'Job started',
      'Parsing financial data...',
      'Error: Invalid file format detected',
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  });

  // Create sample templates
  db.template.create({
    id: 'template-1',
    name: 'Tech Startup IM',
    description: 'Modern template for technology startups',
    industry: 'Technology',
    thumbnailUrl: '/templates/tech-startup-thumb.jpg',
    slides: [
      { id: 'slide-1', title: 'Executive Summary', order: 1, visible: true, content: 'Overview of the opportunity' },
      { id: 'slide-2', title: 'Market Analysis', order: 2, visible: true, content: 'Market size and trends' },
      { id: 'slide-3', title: 'Financial Projections', order: 3, visible: true, content: 'Revenue and growth projections' },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Create sample user
  db.user.create({
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    timezone: 'America/New_York',
    language: 'en',
    role: 'owner',
  });

  // Create sample team members
  db.teamMember.create({
    id: 'member-1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'editor',
    status: 'active',
    invitedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Create sample billing usage
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    db.billingUsage.create({
      date: date.toISOString().split('T')[0],
      cost: Math.random() * 100 + 10,
      projects: Math.floor(Math.random() * 5) + 1,
    });
  }

  // Create sample invoices
  db.invoice.create({
    id: 'inv-1',
    amount: 12500, // $125.00
    status: 'paid',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    downloadUrl: '/invoices/inv-1.pdf',
  });

  // Create sample API keys
  db.apiKey.create({
    id: 'key-1',
    name: 'Production API Key',
    key: 'cel_sk_1234567890abcdef',
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
};

// Initialize seed data
seedData();

export const handlers = [
  // Projects API
  http.get('/api/projects', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let projects = db.project.findMany({});

    // Apply filters
    if (search) {
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.domain?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      projects = projects.filter(p => p.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = projects.slice(startIndex, endIndex);

    return HttpResponse.json({
      items: paginatedProjects,
      total: projects.length,
      page,
      limit,
      hasMore: endIndex < projects.length,
    });
  }),

  http.post('/api/projects', async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const domain = formData.get('domain') as string;
    const pullPublicData = formData.get('pullPublicData') === 'true';

    const project = db.project.create({
      id: `proj-${Date.now()}`,
      name,
      domain: domain || undefined,
      createdAt: new Date().toISOString(),
      status: 'queued',
      costCents: 0,
      tags: [],
      files: [],
    });

    return HttpResponse.json(project);
  }),

  http.get('/api/projects/:id', ({ params }) => {
    const project = db.project.findFirst({
      where: { id: { equals: params.id as string } },
    });

    if (!project) {
      return HttpResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return HttpResponse.json(project);
  }),

  http.post('/api/projects/:id/files', async ({ params, request }) => {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    const uploadedFiles = files.map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      kind: file.name.endsWith('.xlsx') ? 'financials' : 
            file.name.endsWith('.zip') ? 'documents' : 'template',
    }));

    const project = db.project.findFirst({
      where: { id: { equals: params.id as string } },
    });

    if (project) {
      db.project.update({
        where: { id: { equals: params.id as string } },
        data: { files: [...project.files, ...uploadedFiles] },
      });
    }

    return HttpResponse.json(uploadedFiles);
  }),

  http.post('/api/projects/:id/generate', ({ params }) => {
    const jobId = `job-${Date.now()}`;
    
    const job = db.job.create({
      id: jobId,
      projectId: params.id as string,
      stage: 'queued',
      progress: 0,
      logs: ['Job started'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update project with job ID
    db.project.update({
      where: { id: { equals: params.id as string } },
      data: { jobId, status: 'processing' },
    });

    return HttpResponse.json({ jobId });
  }),

  // Jobs API
  http.get('/api/jobs/:id', ({ params }) => {
    const job = db.job.findFirst({
      where: { id: { equals: params.id as string } },
    });

    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Simulate progress updates
    if (job.stage !== 'complete' && job.stage !== 'error') {
      const stages = ['queued', 'parsing_financials', 'mining_documents', 'fetching_public_data', 'building_slides', 'finalizing', 'complete'];
      const currentIndex = stages.indexOf(job.stage);
      const progress = Math.min(100, (currentIndex + 1) * 16.67);

      // Randomly advance stage (for demo purposes)
      if (Math.random() > 0.7 && currentIndex < stages.length - 1) {
        const newStage = stages[currentIndex + 1];
        const newLogs = [...job.logs, `Stage: ${newStage}`];
        
        db.job.update({
          where: { id: { equals: params.id as string } },
          data: { 
            stage: newStage, 
            progress: Math.min(100, (currentIndex + 2) * 16.67),
            logs: newLogs,
            updatedAt: new Date().toISOString(),
          },
        });

        // Update project status if job is complete
        if (newStage === 'complete') {
          db.project.update({
            where: { jobId: { equals: params.id as string } },
            data: { status: 'complete' },
          });
        }
      }
    }

    return HttpResponse.json(job);
  }),

  // Templates API
  http.get('/api/templates', ({ request }) => {
    const url = new URL(request.url);
    const industry = url.searchParams.get('industry');
    const search = url.searchParams.get('search');

    let templates = db.template.findMany({});

    if (industry) {
      templates = templates.filter(t => t.industry === industry);
    }

    if (search) {
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    return HttpResponse.json(templates);
  }),

  // User API
  http.get('/api/user', () => {
    const user = db.user.findFirst({ where: { id: { equals: '1' } } });
    return HttpResponse.json(user);
  }),

  // Team API
  http.get('/api/team', () => {
    const members = db.teamMember.findMany({});
    return HttpResponse.json(members);
  }),

  // Billing API
  http.get('/api/billing/usage', () => {
    const usage = db.billingUsage.findMany({});
    return HttpResponse.json(usage);
  }),

  http.get('/api/billing/invoices', () => {
    const invoices = db.invoice.findMany({});
    return HttpResponse.json(invoices);
  }),

  // API Keys API
  http.get('/api/api-keys', () => {
    const keys = db.apiKey.findMany({});
    return HttpResponse.json(keys);
  }),

  http.post('/api/api-keys', async ({ request }) => {
    const body = await request.json() as { name: string };
    const key = db.apiKey.create({
      id: `key-${Date.now()}`,
      name: body.name,
      key: `cel_sk_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
    });

    return HttpResponse.json(key);
  }),

  // Download API
  http.get('/api/projects/:id/download', ({ params }) => {
    // Mock file download
    const blob = new Blob(['Mock PPTX content'], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    return new HttpResponse(blob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="project-${params.id}.pptx"`,
      },
    });
  }),
];
