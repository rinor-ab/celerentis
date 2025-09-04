'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  FolderOpen, 
  FileText, 
  Settings, 
  User, 
  CreditCard,
  Key,
  Command,
  ArrowRight,
  Download,
  BarChart3
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords: string[];
  category: string;
}

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    {
      id: 'new-project',
      title: 'Create New Project',
      description: 'Start a new Information Memorandum project',
      icon: Plus,
      action: () => router.push('/projects/new'),
      keywords: ['new', 'create', 'project', 'im'],
      category: 'Projects',
    },
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      description: 'View your project overview and KPIs',
      icon: BarChart3,
      action: () => router.push('/'),
      keywords: ['dashboard', 'home', 'overview'],
      category: 'Navigation',
    },
    {
      id: 'projects',
      title: 'View All Projects',
      description: 'Browse and manage your projects',
      icon: FolderOpen,
      action: () => router.push('/projects'),
      keywords: ['projects', 'list', 'browse'],
      category: 'Navigation',
    },
    {
      id: 'templates',
      title: 'Template Library',
      description: 'Browse and manage IM templates',
      icon: FileText,
      action: () => router.push('/templates'),
      keywords: ['templates', 'library', 'browse'],
      category: 'Navigation',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage your account and preferences',
      icon: Settings,
      action: () => router.push('/settings'),
      keywords: ['settings', 'preferences', 'account'],
      category: 'Navigation',
    },
    {
      id: 'team',
      title: 'Team Management',
      description: 'Manage team members and permissions',
      icon: User,
      action: () => router.push('/settings/team'),
      keywords: ['team', 'members', 'users', 'permissions'],
      category: 'Settings',
    },
    {
      id: 'billing',
      title: 'Billing & Usage',
      description: 'View billing information and usage',
      icon: CreditCard,
      action: () => router.push('/settings/billing'),
      keywords: ['billing', 'usage', 'invoices', 'payment'],
      category: 'Settings',
    },
    {
      id: 'api-keys',
      title: 'API Keys',
      description: 'Manage your API keys and integrations',
      icon: Key,
      action: () => router.push('/settings/api-keys'),
      keywords: ['api', 'keys', 'integrations', 'developer'],
      category: 'Settings',
    },
  ];

  const filteredCommands = commands.filter(command => {
    if (!query) return true;
    const searchTerm = query.toLowerCase();
    return (
      command.title.toLowerCase().includes(searchTerm) ||
      command.description.toLowerCase().includes(searchTerm) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;

      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setQuery('');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setCommandPaletteOpen(false);
          setQuery('');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredCommands, selectedIndex, setCommandPaletteOpen]);

  const executeCommand = (command: Command) => {
    command.action();
    setCommandPaletteOpen(false);
    setQuery('');
  };

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="mr-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 p-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <div className="ml-auto flex items-center space-x-2">
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">↑↓</span>
            </kbd>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">↵</span>
            </kbd>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">esc</span>
            </kbd>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No commands found for "{query}"
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedCommands).map(([category, commands]) => (
                <div key={category} className="mb-4">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {commands.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <motion.button
                          key={command.id}
                          onClick={() => executeCommand(command)}
                          className={cn(
                            "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            isSelected
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50"
                          )}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <command.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{command.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {command.description}
                            </div>
                          </div>
                          {isSelected && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Command className="h-3 w-3" />
                <span>Command Palette</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
