import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

interface JobPollingState {
  pollingJobs: Set<string>;
  addPollingJob: (jobId: string) => void;
  removePollingJob: (jobId: string) => void;
  isPolling: (jobId: string) => boolean;
}

interface NotificationState {
  notifications: Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
  }>;
  addNotification: (notification: Omit<NotificationState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

export const useJobPollingStore = create<JobPollingState>((set, get) => ({
  pollingJobs: new Set(),
  addPollingJob: (jobId) => set((state) => {
    const newSet = new Set(state.pollingJobs);
    newSet.add(jobId);
    return { pollingJobs: newSet };
  }),
  removePollingJob: (jobId) => set((state) => {
    const newSet = new Set(state.pollingJobs);
    newSet.delete(jobId);
    return { pollingJobs: newSet };
  }),
  isPolling: (jobId) => get().pollingJobs.has(jobId),
}));

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [
      ...state.notifications,
      {
        ...notification,
        id: `notification-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        read: false,
      }
    ]
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearAll: () => set({ notifications: [] }),
}));
