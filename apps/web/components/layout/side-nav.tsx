'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  Key,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderOpen,
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: FileText,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    children: [
      { name: 'Profile', href: '/settings', icon: Settings },
      { name: 'Team', href: '/settings/team', icon: Users },
      { name: 'Billing', href: '/settings/billing', icon: CreditCard },
      { name: 'API Keys', href: '/settings/api-keys', icon: Key },
    ],
  },
];

export function SideNav() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const hasActiveChild = (children: typeof navigation[0]['children']) => {
    return children?.some(child => isActive(child.href)) || false;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-border bg-card"
    >
      <div className="flex h-full flex-col">
        {/* Toggle Button */}
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 p-0"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 pb-4">
          {navigation.map((item) => {
            const isItemActive = isActive(item.href);
            const hasActiveChildItem = hasActiveChild(item.children);

            return (
              <div key={item.name}>
                {/* Main Navigation Item */}
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isItemActive || hasActiveChildItem
                        ? "bg-brand text-brand-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      sidebarCollapsed ? "mx-auto" : "mr-3"
                    )} />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </motion.div>
                </Link>

                {/* Sub Navigation Items */}
                {item.children && !sidebarCollapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = isActive(child.href);
                      return (
                        <Link key={child.name} href={child.href}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              isChildActive
                                ? "bg-brand/20 text-brand-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{child.name}</span>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="border-t border-border p-4">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium">Celerentis</div>
              <div>AI IM Generator</div>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
