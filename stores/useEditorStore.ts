import { create } from 'zustand';
import { INITIAL_FILES } from '../constants';
import { FileSystemNode, FileType, Tab } from '../types';

interface EditorState {
  files: FileSystemNode[];
  tabs: Tab[];
  activeTabId: string | null;
  
  // Actions
  toggleFolder: (id: string) => void;
  openFile: (node: FileSystemNode) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
}

// Helper to find node (recursive)
const findNode = (nodes: FileSystemNode[], id: string): FileSystemNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Helper to update node (recursive)
const updateNodeContent = (nodes: FileSystemNode[], id: string, content: string): FileSystemNode[] => {
  return nodes.map(node => {
    if (node.id === id) return { ...node, content };
    if (node.children) return { ...node, children: updateNodeContent(node.children, id, content) };
    return node;
  });
};

// Helper to toggle folder
const toggleNodeFolder = (nodes: FileSystemNode[], id: string): FileSystemNode[] => {
  return nodes.map(node => {
    if (node.id === id) return { ...node, isOpen: !node.isOpen };
    if (node.children) return { ...node, children: toggleNodeFolder(node.children, id) };
    return node;
  });
};

export const useEditorStore = create<EditorState>((set, get) => ({
  files: INITIAL_FILES,
  tabs: [],
  activeTabId: null,

  toggleFolder: (id: string) => {
    set((state) => ({
      files: toggleNodeFolder(state.files, id)
    }));
  },

  openFile: (node: FileSystemNode) => {
    if (node.type !== FileType.FILE) return;
    
    set((state) => {
      const existingTab = state.tabs.find(t => t.fileId === node.id);
      if (existingTab) {
        return { activeTabId: existingTab.id };
      }
      
      const newTab: Tab = {
        id: `tab-${node.id}`,
        fileId: node.id,
        title: node.name
      };
      
      return {
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id
      };
    });
  },

  closeTab: (id: string) => {
    set((state) => {
      const tabIndex = state.tabs.findIndex(t => t.id === id);
      const newTabs = state.tabs.filter(t => t.id !== id);
      let newActiveId = state.activeTabId;

      if (state.activeTabId === id) {
        if (newTabs.length > 0) {
          const newActiveIndex = Math.max(0, tabIndex - 1);
          newActiveId = newTabs[newActiveIndex].id;
        } else {
          newActiveId = null;
        }
      }

      return {
        tabs: newTabs,
        activeTabId: newActiveId
      };
    });
  },

  setActiveTab: (id: string) => {
    set({ activeTabId: id });
  },

  updateFileContent: (id: string, content: string) => {
    set((state) => ({
      files: updateNodeContent(state.files, id, content)
    }));
  }
}));

export const selectActiveFileContent = (state: EditorState) => {
  if (!state.activeTabId) return '';
  const activeTab = state.tabs.find(t => t.id === state.activeTabId);
  if (!activeTab) return '';
  const node = findNode(state.files, activeTab.fileId);
  return node?.content || '';
};