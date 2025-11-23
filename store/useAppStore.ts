import { create } from 'zustand';
import { ViewMode } from '../types';

interface AppState {
  isDarkMode: boolean;
  activeView: ViewMode;
  toggleTheme: () => void;
  setActiveView: (view: ViewMode) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isDarkMode: true,
  activeView: ViewMode.HOME,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setActiveView: (view) => set({ activeView: view }),
}));
