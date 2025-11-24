
import React, { useState, useRef, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    File, 
    MoreVertical, 
    Pencil, 
    Trash2, 
    LayoutGrid, 
    ShoppingCart, 
    Settings, 
    Home, 
    Monitor,
    Table,
    Type,
    MousePointerClick,
    BarChart3,
    TextCursor,
    FileText,
    ChevronDown,
    ChevronRight,
    Eye
} from 'lucide-react';
import ComponentsPanel from './ComponentsPanel';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAppStore } from '../../../store/useAppStore';
import { Page, GridItemData } from '../../../types';

const PagesPanel = () => {
  const { 
      pages, 
      activePageId, 
      setActivePageId, 
      addPage, 
      deletePage, 
      layouts, // Updated to layouts
      selectedComponentId, 
      setSelectedComponentId 
  } = useAppStore();

  // Use LG layout for outline view source of truth
  const desktopLayout = layouts['lg'] || [];

  const [activeMenuPage, setActiveMenuPage] = useState<string | null>(null);
  const [showComponents, setShowComponents] = useState(false);
  const [pagesHeight, setPagesHeight] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const splitterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Menu Logic
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuPage(null);
      }
      
      // Components Panel Logic
      if (showComponents && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowComponents(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showComponents, activeMenuPage]);

  // Resizing Logic for Vertical Split
  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (isResizing) {
            const newHeight = e.clientY - 120; // 120px approx header offset
            if (newHeight > 100 && newHeight < window.innerHeight - 200) {
                setPagesHeight(newHeight);
            }
          }
      };

      const handleMouseUp = () => {
          setIsResizing(false);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
      };

      if (isResizing) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = 'row-resize';
          document.body.style.userSelect = 'none';
      }

      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isResizing]);

  const handleAddPage = () => {
      const newId = `page-${Date.now()}`;
      const newPage: Page = {
          id: newId,
          name: 'New Page',
          icon: 'File',
          isHome: false,
          isHidden: false,
          isDisabled: false,
          height: '800'
      };
      addPage(newPage);
  };

  const getPageIcon = (iconName: string) => {
      switch(iconName) {
          case 'LayoutGrid': return <LayoutGrid size={14} className="mr-2" />;
          case 'ShoppingCart': return <ShoppingCart size={14} className="mr-2" />;
          case 'Settings': return <Settings size={14} className="mr-2" />;
          case 'Home': return <Home size={14} className="mr-2" />;
          default: return <File size={14} className="mr-2" />;
      }
  };

  const getComponentIcon = (type: string) => {
      switch(type) {
          case 'button': return <MousePointerClick size={14} className="text-muted-foreground" />;
          case 'input': return <TextCursor size={14} className="text-muted-foreground" />;
          case 'textarea': return <FileText size={14} className="text-muted-foreground" />;
          case 'text': return <Type size={14} className="text-muted-foreground" />;
          case 'table': return <Table size={14} className="text-muted-foreground" />;
          case 'chart': return <BarChart3 size={14} className="text-muted-foreground" />;
          case 'stat': return <BarChart3 size={14} className="text-muted-foreground" />;
          default: return <LayoutGrid size={14} className="text-muted-foreground" />;
      }
  };

  const getComponentLabel = (type: string) => {
      switch(type) {
          case 'button': return 'Button';
          case 'input': return 'Input';
          case 'textarea': return 'Text Area';
          case 'text': return 'Text';
          case 'table': return 'Table';
          case 'chart': return 'Chart';
          case 'stat': return 'Stat Card';
          default: return 'Component';
      }
  };

  if (showComponents) {
    return (
        <div ref={panelRef} className="h-full">
            <ComponentsPanel onClose={() => setShowComponents(false)} />
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      
      {/* 1. Add Component Button Area */}
      <div className="p-3 shrink-0 border-b border-border">
          <Button 
            onClick={() => setShowComponents(true)}
            className="w-full justify-center h-9 text-xs font-medium" 
            variant="secondary"
          >
            <Plus size={14} className="mr-2" /> Add Component
        </Button>
      </div>

      {/* 2. Top Pane: Pages */}
      <div 
        style={{ height: pagesHeight }} 
        className="flex flex-col shrink-0 min-h-[100px]"
      >
          {/* Header */}
          <div className="h-9 px-4 flex justify-between items-center shrink-0 bg-muted/10">
            <span className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Pages</span>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleAddPage}>
                    <Plus size={12} className="text-muted-foreground hover:text-foreground"/>
                </Button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-1">
             {pages.map(page => {
                const isActive = page.id === activePageId;
                return (
                    <div 
                        key={page.id} 
                        onClick={() => setActivePageId(page.id)}
                        className={`relative px-3 py-1.5 flex items-center text-sm cursor-pointer transition-colors rounded-sm group mb-0.5 ${
                            isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                    >
                        <div className={`${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} transition-colors flex items-center`}>
                           {getPageIcon(page.icon)}
                        </div>
                        <span className="flex-1 truncate text-xs">{page.name}</span>
                        {page.isHome && <Home size={10} className="text-muted-foreground mr-1" />}
                        
                        {/* Action Menu */}
                        <div 
                            className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeMenuPage === page.id ? 'opacity-100' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuPage(activeMenuPage === page.id ? null : page.id);
                            }}
                        >
                            <MoreVertical size={12} className="text-muted-foreground hover:text-foreground" />
                        </div>

                        {/* Context Menu */}
                        {activeMenuPage === page.id && (
                        <div 
                            ref={menuRef}
                            className="absolute right-2 top-6 w-32 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col py-1"
                        >
                            <button className="flex items-center gap-2 px-3 py-2 text-xs text-popover-foreground hover:bg-muted w-full text-left transition-colors">
                                <Pencil size={12} /> Rename
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deletePage(page.id);
                                    setActiveMenuPage(null);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-muted w-full text-left transition-colors"
                            >
                                <Trash2 size={12} /> Delete
                            </button>
                        </div>
                        )}
                    </div>
                );
             })}
          </div>
      </div>

      {/* 3. Resizer */}
      <div 
         ref={splitterRef}
         onMouseDown={() => setIsResizing(true)}
         className="h-1 bg-border hover:bg-primary/50 cursor-row-resize shrink-0 transition-colors z-10"
      />

      {/* 4. Bottom Pane: Component Tree */}
      <div className="flex-1 flex flex-col min-h-[100px] overflow-hidden">
          {/* Header */}
          <div className="h-9 px-4 flex justify-between items-center shrink-0 bg-muted/10 border-b border-border/50">
             <span className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Outline</span>
          </div>

          {/* Tree View */}
          <div className="flex-1 overflow-y-auto p-1">
              
              {/* Root Node (Desktop) */}
              <div className="mb-1">
                 <div className="flex items-center px-2 py-1 text-xs font-medium text-foreground">
                    <ChevronDown size={12} className="mr-1 text-muted-foreground" />
                    <Monitor size={12} className="mr-2 text-muted-foreground" />
                    Desktop
                 </div>
                 
                 {/* Children (Components) */}
                 <div className="ml-4 border-l border-border/50 pl-1">
                     {desktopLayout.length === 0 ? (
                         <div className="px-3 py-2 text-[10px] text-muted-foreground italic">
                             No components
                         </div>
                     ) : (
                         desktopLayout.map((item) => {
                             const isSelected = item.i === selectedComponentId;
                             return (
                                 <div 
                                    key={item.i}
                                    onClick={() => setSelectedComponentId(item.i)}
                                    className={`group flex items-center px-2 py-1.5 rounded-sm cursor-pointer text-xs mb-0.5 transition-colors ${
                                        isSelected 
                                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                 >
                                    <div className="flex items-center flex-1 min-w-0">
                                        <span className="mr-2 opacity-70">
                                            {getComponentIcon(item.type)}
                                        </span>
                                        <span className="truncate font-medium">
                                            {item.title || getComponentLabel(item.type)}
                                        </span>
                                    </div>
                                    
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Eye size={12} className="text-muted-foreground hover:text-foreground" />
                                    </div>
                                 </div>
                             );
                         })
                     )}
                 </div>
              </div>

          </div>
      </div>
      
    </div>
  );
};

export default PagesPanel;
