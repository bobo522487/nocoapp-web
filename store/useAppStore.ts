
import { create } from 'zustand';
import { ViewMode, Page } from '../types';

interface AppState {
  isDarkMode: boolean;
  activeView: ViewMode;
  toggleTheme: () => void;
  setActiveView: (view: ViewMode) => void;
  
  // Page State
  pages: Page[];
  activePageId: string;
  setPages: (pages: Page[]) => void;
  setActivePageId: (id: string) => void;
  updatePage: (id: string, updates: Partial<Page>) => void;
  addPage: (page: Page) => void;
  deletePage: (id: string) => void;
}

const INITIAL_PAGES: Page[] = [
  { id: 'page-1', name: 'Dashboard', icon: 'LayoutGrid', isHome: true, isHidden: false, isDisabled: false, height: '800' },
  { id: 'page-2', name: 'Orders', icon: 'ShoppingCart', isHome: false, isHidden: false, isDisabled: false, height: '1000' },
  { id: 'page-3', name: 'Settings', icon: 'Settings', isHome: false, isHidden: false, isDisabled: false, height: '600' },
];

export const useAppStore = create<AppState>((set) => ({
  isDarkMode: true,
  activeView: ViewMode.HOME,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setActiveView: (view) => set({ activeView: view }),

  pages: INITIAL_PAGES,
  activePageId: 'page-1',
  setPages: (pages) => set({ pages }),
  setActivePageId: (id) => set({ activePageId: id }),
  updatePage: (id, updates) => set((state) => ({
    pages: state.pages.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  addPage: (page) => set((state) => ({ 
    pages: [...state.pages, page],
    activePageId: page.id 
  })),
  deletePage: (id) => set((state) => ({ 
    pages: state.pages.filter(p => p.id !== id),
    activePageId: state.activePageId === id && state.pages.length > 1 
        ? state.pages.find(p => p.id !== id)?.id || '' // Fallback to another page
        : state.activePageId
  })),
}));
