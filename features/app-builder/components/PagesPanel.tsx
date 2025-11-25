import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    Plus, 
    File, 
    MoreVertical, 
    Pencil, 
    Trash2, 
    LayoutGrid, 
    ShoppingCart, 
    Settings, 
    Home, 
    Monitor,
    Tablet,
    Smartphone,
    Table,
    Type,
    MousePointerClick,
    BarChart3,
    TextCursor,
    FileText,
    ChevronDown,
    Eye,
    Files
} from 'lucide-react';
import ComponentsPanel from './ComponentsPanel';
import { Button } from "../../../components/ui/button";
import { useAppStore } from '../../../store/useAppStore';
import { Page } from '../../../types';
import { useNavigate, useParams } from 'react-router-dom';

const PagesPanel = () => {
  const navigate = useNavigate();
  const { appId } = useParams(); // Get current app context
  const { 
      pages, 
      activePageId, 
      addPage, 
      deletePage, 
      updatePage,
      pageLayouts, 
      selectedComponentId, 
      setSelectedComponentId,
      activeDevice 
  } = useAppStore();

  const [activeMenu, setActiveMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [showComponents, setShowComponents] = useState(false);
  const [pagesHeight, setPagesHeight] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  
  // Rename State
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const splitterRef = useRef<HTMLDivElement>(null);

  // Derive layout key from activeDevice
  const getLayoutKey = (device: string) => {
      switch(device) {
          case 'mobile': return 'xxs'; // 375px -> xxs
          case 'tablet': return 'sm';  // 768px -> sm
          case 'desktop': default: return 'lg'; // 1200px -> lg
      }
  };

  const currentLayoutKey = getLayoutKey(activeDevice);
  const currentLayouts = pageLayouts[activePageId] || { lg: [] };
  const visibleLayout = currentLayouts[currentLayoutKey] || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Menu Logic
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
      
      // Components Panel Logic
      if (showComponents && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowComponents(false);
      }
    };

    const handleScroll = () => {
        if (activeMenu) setActiveMenu(null);
    };
    
    const handleResize = () => {
        if (activeMenu) setActiveMenu(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    if (activeMenu) {
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [showComponents, activeMenu]);

  // Focus input when renaming starts
  useEffect(() => {
      if (renamingId && renameInputRef.current) {
          renameInputRef.current.focus();
          renameInputRef.current.select();
      }
  }, [renamingId]);

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

  const handleMenuOpen = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveMenu({
          id,
          x: rect.left,
          y: rect.bottom + 4
      });
  };

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
      navigate(`/apps/${appId || 'default-app'}/pages/${newId}`);
  };

  const handleDuplicatePage = (page: Page, e: React.MouseEvent) => {
      e.stopPropagation();
      const newId = `page-${Date.now()}`;
      const newPage: Page = {
          ...page,
          id: newId,
          name: `${page.name} Copy`,
          isHome: false
      };
      addPage(newPage);
      setActiveMenu(null);
  };

  const handlePageClick = (pageId: string) => {
      if (renamingId === pageId) return; // Don't navigate while renaming
      navigate(`/apps/${appId || 'default-app'}/pages/${pageId}`);
  };

  const startRenaming = (page: Page, e: React.MouseEvent) => {
      e.stopPropagation();
      setRenamingId(page.id);
      setRenameValue(page.name);
      setActiveMenu(null);
  };

  const saveRename = () => {
      if (renamingId && renameValue.trim()) {
          updatePage(renamingId, { name: renameValue.trim() });
      }
      setRenamingId(null);
      setRenameValue("");
  };

  const cancelRename = () => {
      setRenamingId(null);
      setRenameValue("");
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          saveRename();
      } else if (e.key === 'Escape') {
          cancelRename();
      }
      e.stopPropagation();
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

  const getDeviceIcon = () => {
      switch(activeDevice) {
          case 'mobile': return <Smartphone size={12} className="mr-2 text-muted-foreground" />;
          case 'tablet': return <Tablet size={12} className="mr-2 text-muted-foreground" />;
          case 'desktop': default: return <Monitor size={12} className="mr-2 text-muted-foreground" />;
      }
  };

  const getDeviceLabel = () => {
      switch(activeDevice) {
          case 'mobile': return 'Mobile';
          case 'tablet': return 'Tablet';
          case 'desktop': default: return 'Desktop';
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
                const isRenaming = renamingId === page.id;

                return (
                    <div 
                        key={page.id} 
                        onClick={() => handlePageClick(page.id)}
                        className={`relative px-3 py-1.5 flex items-center text-sm cursor-pointer transition-colors rounded-sm group mb-0.5 ${
                            isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                    >
                        <div className={`${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} transition-colors flex items-center`}>
                           {getPageIcon(page.icon)}
                        </div>
                        
                        {isRenaming ? (
                            <input
                                ref={renameInputRef}
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={saveRename}
                                onKeyDown={handleRenameKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 min-w-0 w-full h-7 -my-1 bg-background border border-primary rounded-sm px-2 text-xs outline-none text-foreground focus:ring-2 focus:ring-primary/20"
                            />
                        ) : (
                            <span className="flex-1 truncate text-xs">{page.name}</span>
                        )}

                        {!isRenaming && page.isHome && <Home size={10} className="text-muted-foreground mr-1" />}
                        
                        {/* Action Menu */}
                        {!isRenaming && (
                            <div 
                                className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeMenu?.id === page.id ? 'opacity-100' : ''}`}
                                onClick={(e) => handleMenuOpen(e, page.id)}
                            >
                                <MoreVertical size={12} className="text-muted-foreground hover:text-foreground" />
                            </div>
                        )}
                    </div>
                );
             })}
          </div>
          
          {/* Portal for Context Menu */}
          {activeMenu && createPortal(
            <div 
                ref={menuRef}
                className="fixed z-[9999] w-64 bg-popover border border-border rounded-lg shadow-xl overflow-hidden flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100"
                style={{ top: activeMenu.y, left: activeMenu.x }}
                onClick={(e) => e.stopPropagation()}
            >
                {pages.find(p => p.id === activeMenu.id) && (
                    <div className="flex flex-col py-1">
                        {/* Rename */}
                        <div className="px-1">
                            <button 
                                onClick={(e) => startRenaming(pages.find(p => p.id === activeMenu.id)!, e)} 
                                className="flex items-center w-full px-2 py-1.5 text-xs text-foreground hover:bg-muted rounded-md transition-colors gap-2"
                            >
                                <Pencil size={14} className="opacity-70" /> Rename page
                            </button>
                        </div>

                        {/* Duplicate */}
                        <div className="px-1">
                            <button 
                                onClick={(e) => handleDuplicatePage(pages.find(p => p.id === activeMenu.id)!, e)} 
                                className="flex items-center w-full px-2 py-1.5 text-xs text-foreground hover:bg-muted rounded-md transition-colors gap-2"
                            >
                                <Files size={14} className="opacity-70" /> Duplicate page
                            </button>
                        </div>

                        {/* Delete */}
                        <div className="px-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); deletePage(activeMenu.id); setActiveMenu(null); }} 
                                className="flex items-center w-full px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-md transition-colors gap-2"
                            >
                                <Trash2 size={14} /> Delete page
                            </button>
                        </div>
                    </div>
                )}
            </div>,
            document.body
          )}
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
              
              {/* Root Node (Device) */}
              <div className="mb-1">
                 <div className="flex items-center px-2 py-1 text-xs font-medium text-foreground">
                    <ChevronDown size={12} className="mr-1 text-muted-foreground" />
                    {getDeviceIcon()}
                    {getDeviceLabel()}
                 </div>
                 
                 {/* Children (Components) */}
                 <div className="ml-4 border-l border-border/50 pl-1">
                     {visibleLayout.length === 0 ? (
                         <div className="px-3 py-2 text-[10px] text-muted-foreground italic">
                             No components
                         </div>
                     ) : (
                         visibleLayout.map((item) => {
                             const isSelected = item.i === selectedComponentId;
                             return (
                                 <div 
                                    key={item.i}
                                    onClick={() => setSelectedComponentId(item.i)}
                                    className={`group flex items-center px-2 py-1.5 rounded-sm cursor-pointer text-xs mb-0.5 transition-colors ${
                                        isSelected 
                                        ? 'bg-primary/10 text-primary' 
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