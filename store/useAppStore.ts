
import { create } from 'zustand';
import { ViewMode, Page, GridItemData } from '../types';

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

  // Data State
  activeTableId: string;
  setActiveTableId: (id: string) => void;

  // App Builder / Layout State
  layouts: Record<string, GridItemData[]>;
  selectedComponentId: string | null;
  setLayouts: (layouts: Record<string, GridItemData[]>) => void;
  setSelectedComponentId: (id: string | null) => void;
  updateLayoutItem: (id: string, updates: Partial<GridItemData>) => void;
}

const INITIAL_PAGES: Page[] = [
  { id: 'page-1', name: 'Dashboard', icon: 'LayoutGrid', isHome: true, isHidden: false, isDisabled: false, height: '800' },
  { id: 'page-2', name: 'Orders', icon: 'ShoppingCart', isHome: false, isHidden: false, isDisabled: false, height: '1000' },
  { id: 'page-3', name: 'Settings', icon: 'Settings', isHome: false, isHidden: false, isDisabled: false, height: '600' },
];

const INITIAL_LAYOUT: GridItemData[] = [
  { i: 'stat1', x: 0, y: 0, w: 3, h: 3, type: 'stat', title: 'Total Revenue', content: { value: '$45,231.89', trend: '+20.1%' } },
  { i: 'stat2', x: 3, y: 0, w: 3, h: 3, type: 'stat', title: 'Subscriptions', content: { value: '+2350', trend: '+180.1%' } },
  { i: 'stat3', x: 6, y: 0, w: 3, h: 3, type: 'stat', title: 'Sales', content: { value: '+12,234', trend: '+19%' } },
  { i: 'chart1', x: 0, y: 3, w: 8, h: 8, type: 'chart', title: 'Revenue Overview', content: {} },
  { i: 'list1', x: 8, y: 3, w: 4, h: 8, type: 'table', title: 'Recent Sales', content: {} },
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

  // Data State
  activeTableId: 'users',
  setActiveTableId: (id) => set({ activeTableId: id }),

  // Layout State Implementation
  layouts: { lg: INITIAL_LAYOUT }, // Initialize with desktop layout
  selectedComponentId: null,
  setLayouts: (layouts) => set({ layouts }),
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  updateLayoutItem: (id, updates) => set((state) => {
    // Update the item in ALL breakpoints to keep content/properties in sync across devices
    const newLayouts: Record<string, GridItemData[]> = {};
    Object.keys(state.layouts).forEach(bp => {
        newLayouts[bp] = state.layouts[bp].map(item => 
          item.i === id ? { ...item, ...updates } : item
        );
    });
    return { layouts: newLayouts };
  }),
}));
