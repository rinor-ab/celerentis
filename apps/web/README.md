# Celerentis - AI IM Generator Frontend

A production-ready, responsive, accessible dark-theme SaaS UI for Celerentis Information Memorandum generator built with Next.js 14, TypeScript, and modern React patterns.

## 🚀 Features

### Core Functionality
- **Dashboard** - KPI cards, project overview, and analytics
- **Project Management** - Create, view, and manage IM projects
- **File Upload** - Drag-and-drop file upload with validation
- **Progress Tracking** - Real-time job progress with stepper UI
- **Template Library** - Browse and manage IM templates
- **Settings** - User profile, team management, billing, and API keys

### UI/UX Features
- **Dark Theme** - Default dark theme with light mode toggle
- **Responsive Design** - Mobile-first responsive layout
- **Accessibility** - WCAG AA compliant with keyboard navigation
- **Micro-interactions** - Smooth animations with Framer Motion
- **Command Palette** - Quick actions with ⌘K shortcut
- **Real-time Updates** - Live job polling and notifications

### Stretch Features Implemented
- **Spend Over Time Chart** - Interactive spending analytics with Recharts
- **Project Tags** - Colorful, filterable project tags
- **Slide Preview Grid** - Template slide management with visibility toggles

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Mocking**: MSW (Mock Service Worker)
- **Font**: Plus Jakarta Sans

## 🎨 Design System

### Brand Colors
- **Primary**: #0F766E (Teal)
- **Background**: #0B0F12 (Dark)
- **Card**: #0F1419 (Dark Gray)
- **Border**: #23303A (Muted)

### Typography
- **Font Family**: Plus Jakarta Sans
- **Weights**: 400, 500, 600, 700

### Components
- **Border Radius**: 2xl (1rem) for modern look
- **Shadows**: Subtle glow effects for interactive elements
- **Spacing**: Consistent 4px grid system

## 📁 Project Structure

```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── projects/          # Project management
│   ├── templates/         # Template library
│   └── settings/          # User settings
├── components/            # Reusable UI components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and configurations
│   ├── hooks/            # Custom React hooks
│   ├── mocks/            # MSW mock handlers
│   └── types.ts          # TypeScript definitions
└── styles/               # Global styles and themes
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCKS=true
```

### Mock API

The application uses MSW (Mock Service Worker) for development. Mock data includes:

- **Projects**: 3 sample projects with different statuses
- **Templates**: Sample IM templates
- **User Data**: Mock user and team information
- **Billing**: Usage and invoice data

To disable mocks, set `NEXT_PUBLIC_ENABLE_MOCKS=false`.

## 🎯 Key Components

### Layout Components
- **TopNav** - Header with search, notifications, and user menu
- **SideNav** - Collapsible sidebar navigation
- **CommandPalette** - Quick actions with keyboard shortcuts
- **MainLayout** - Root layout with providers

### UI Components
- **KPICard** - Dashboard metrics with trend indicators
- **ProjectCard** - Project overview with actions
- **StatusPill** - Status indicators with animations
- **ProgressStepper** - Multi-step progress visualization
- **FileDropzone** - Drag-and-drop file upload
- **SpendChart** - Interactive spending analytics
- **ProjectTags** - Colorful, filterable tags
- **SlidePreview** - Template slide management

### Custom Hooks
- **useJobPolling** - Real-time job status updates
- **useApi** - TanStack Query API hooks
- **useUIStore** - Zustand global state management

## 🔄 Data Flow

1. **API Layer** - MSW mocks with realistic data
2. **Query Layer** - TanStack Query for caching and synchronization
3. **State Layer** - Zustand for UI state (sidebar, notifications)
4. **Component Layer** - React components with TypeScript

## 🎨 Theming

### CSS Variables
The app uses CSS custom properties for theming:

```css
:root {
  --brand: 175 84% 32%;           /* #0F766E */
  --background: 210 40% 4%;       /* #0B0F12 */
  --card: 210 40% 6%;             /* #0F1419 */
  --border: 210 40% 15%;          /* #23303A */
}
```

### Dark/Light Mode
- Default: Dark theme
- Toggle: Theme switcher in top navigation
- Persistence: User preference saved in localStorage

## 📱 Responsive Design

- **Mobile**: < 768px - Single column, collapsible sidebar
- **Tablet**: 768px - 1024px - Two column layout
- **Desktop**: > 1024px - Full layout with sidebar

## ♿ Accessibility

- **Keyboard Navigation** - Full keyboard support
- **Screen Readers** - ARIA labels and semantic HTML
- **Color Contrast** - WCAG AA compliant
- **Focus Management** - Visible focus indicators
- **Reduced Motion** - Respects user preferences

## 🧪 Testing

### Component Testing
```bash
npm run test
```

### E2E Testing
```bash
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Docker
```bash
docker build -t celerentis-web .
docker run -p 3000:3000 celerentis-web
```

## 🔮 Future Enhancements

- **Real-time Collaboration** - WebSocket integration
- **Advanced Analytics** - More detailed insights
- **Template Editor** - Visual template builder
- **API Documentation** - Interactive API docs
- **Mobile App** - React Native companion

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.
