import React, { useState, useCallback, useEffect } from 'react';
import ActivityBar from '../components/layout/ActivityBar';
import Sidebar from '../components/layout/Sidebar';
import Editor from '../features/editor/components/Editor';
import DataPage from '../features/data-modeler/pages/DataPage';
import Header from '../components/layout/Header';
import AppBuilderPage from '../features/app-builder/pages/AppBuilderPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import { INITIAL_FILES } from '../constants';
import { FileSystemNode, FileType, ViewMode, Tab } from '../types';
import { useResizable } from '../hooks/useResizable';
import { useAppStore } from '../store/useAppStore';
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  DragStartEvent, 
  DragEndEvent 
} from '@dnd-kit/core';

const App: React.FC = () => {
  // State from Zustand Store
  const { activeView, isDarkMode } = useAppStore();

  // Local State
  const [files, setFiles] = useState<FileSystemNode[]>(INITIAL_FILES);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  
  // Data View State
  const [activeTable, setActiveTable] = useState<string>('users');

  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [droppedItem, setDroppedItem] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Use custom hook for Left Sidebar Resizing
  const { 
    width: sidebarWidth, 
    isResizing: isResizingSidebar, 
    startResizing: startResizingSidebar 
  } = useResizable({
    initialWidth: 260,
    minWidth: 180,
    maxWidth: 480,
    edge: 'left',
    leftOffset: 56 // Width of ActivityBar
  });

  // Initialize Theme (using store value)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Helper to find node by ID (recursive)
  const findNode = useCallback((nodes: FileSystemNode[], id: string): FileSystemNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Helper to update node (recursive)
  const updateNode = (nodes: FileSystemNode[], id: string, updates: Partial<FileSystemNode>): FileSystemNode[] => {
    return nodes.map(node => {
      if (node.id === id) return { ...node, ...updates };
      if (node.children) return { ...node, children: updateNode(node.children, id, updates) };
      return node;
    });
  };

  // Actions
  const handleToggleFolder = (id: string) => {
    const node = findNode(files, id);
    if (node && node.type === FileType.FOLDER) {
      setFiles(prev => updateNode(prev, id, { isOpen: !node.isOpen }));
    }
  };

  const handleSelectFile = (node: FileSystemNode) => {
    if (node.type === FileType.FILE) {
      // Check if tab already exists
      const existingTab = tabs.find(t => t.fileId === node.id);
      if (existingTab) {
        setActiveTabId(existingTab.id);
      } else {
        const newTab: Tab = {
          id: `tab-${node.id}`,
          fileId: node.id,
          title: node.name
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
      }
    }
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        // Activate the tab to the left, or the first one
        const newActiveIndex = Math.max(0, tabIndex - 1);
        setActiveTabId(newTabs[newActiveIndex].id);
      } else {
        setActiveTabId(null);
      }
    }
  };

  const handleContentChange = (newContent: string) => {
    if (!activeTabId) return;
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (currentTab) {
        setFiles(prev => updateNode(prev, currentTab.fileId, { content: newContent }));
    }
  };

  // DnD Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setDraggedItem(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'canvas-droppable') {
      // Pass the dropped data to the active view (AppBuilderPage -> Canvas)
      setDroppedItem({
        ...active.data.current,
        id: `widget-${Date.now()}` // Generate a unique ID for the new instance
      });
    }

    setDraggedItem(null);
  };

  // Derived state for editor
  const activeTab = tabs.find(t => t.id === activeTabId);
  const activeFileNode = activeTab ? findNode(files, activeTab.fileId) : null;
  const activeContent = activeFileNode?.content || '';

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className={`flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-200 ${isResizingSidebar ? 'cursor-col-resize select-none' : ''}`}>
        
        <Header />

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden">
          <ActivityBar />
          
          {/* Sidebar and Resizer - Hidden on Home View */}
          {activeView !== ViewMode.HOME && (
            <>
              <Sidebar 
                  files={files} 
                  onToggleFolder={handleToggleFolder} 
                  onSelectFile={handleSelectFile}
                  selectedFileId={activeTab?.fileId || null}
                  width={sidebarWidth}
                  activeTable={activeTable}
                  onTableSelect={setActiveTable}
              />
              {/* Sidebar Resizer */}
              <div
                  className="w-[1px] bg-border hover:bg-primary cursor-col-resize z-50 relative transition-colors"
                  onMouseDown={startResizingSidebar}
              >
                 {/* Invisible Hit Area */}
                 <div className="absolute inset-y-0 -left-1 w-3 cursor-col-resize z-50" />
              </div>
            </>
          )}
          
          {/* Content Area */}
          <main className="flex-1 flex overflow-hidden relative bg-background min-w-0">
              {activeView === ViewMode.HOME ? (
                  <DashboardPage />
              ) : activeView === ViewMode.APPS ? (
                  <AppBuilderPage 
                    draggedItem={draggedItem}
                    droppedItem={droppedItem} 
                    onItemConsumed={() => setDroppedItem(null)}
                  />
              ) : activeView === ViewMode.DATA ? (
                  <DataPage tableName={activeTable} />
              ) : (
                  <Editor 
                      tabs={tabs}
                      activeTabId={activeTabId}
                      activeFileContent={activeContent}
                      onCloseTab={handleCloseTab}
                      onSelectTab={setActiveTabId}
                      onContentChange={handleContentChange}
                  />
              )}
          </main>
        </div>

        {/* Drag Overlay for Visual Feedback */}
        <DragOverlay>
          {draggedItem ? (
            <div className="opacity-80 pointer-events-none transform scale-105 cursor-grabbing">
               <div className="flex flex-col items-center justify-center p-2 rounded-md border bg-card shadow-xl w-20 h-20">
                  {draggedItem.icon && <draggedItem.icon size={24} className="text-primary mb-1" />}
                  <span className="text-[10px] font-medium text-foreground">{draggedItem.name}</span>
               </div>
            </div>
          ) : null}
        </DragOverlay>

      </div>
    </DndContext>
  );
};

export default App;