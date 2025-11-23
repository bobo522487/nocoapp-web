
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, File, MoreVertical, Pencil, Trash2, LayoutGrid, ShoppingCart, Settings, Home } from 'lucide-react';
import ComponentsPanel from './ComponentsPanel';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAppStore } from '../../../store/useAppStore';
import { Page } from '../../../types';

const PagesPanel = () => {
  const { pages, activePageId, setActivePageId, addPage, deletePage, updatePage } = useAppStore();
  const [activeMenuPage, setActiveMenuPage] = useState<string | null>(null);
  const [showComponents, setShowComponents] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  const getIcon = (iconName: string) => {
      switch(iconName) {
          case 'LayoutGrid': return <LayoutGrid size={14} className="mr-2" />;
          case 'ShoppingCart': return <ShoppingCart size={14} className="mr-2" />;
          case 'Settings': return <Settings size={14} className="mr-2" />;
          case 'Home': return <Home size={14} className="mr-2" />;
          default: return <File size={14} className="mr-2" />;
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
    <div className="flex flex-col h-full">
      <div className="h-12 px-4 border-b border-border flex justify-between items-center shrink-0 bg-muted/10">
          <span className="font-medium text-sm text-muted-foreground">Application</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddPage}>
             <Plus size={14} className="text-muted-foreground hover:text-foreground"/>
          </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
         
         {/* Add Component Button */}
         <div className="px-3 mb-4">
            <Button 
                onClick={() => setShowComponents(true)}
                className="w-full justify-start h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white" 
                size="sm"
            >
               <Plus size={14} className="mr-2" /> Add Component
            </Button>
         </div>

         <div className="mb-4">
            <div className="px-4 py-1 text-xs font-bold text-muted-foreground uppercase mb-2 flex justify-between items-center">
               <span>Pages</span>
               <span className="text-[10px] bg-muted px-1.5 rounded-full text-muted-foreground">{pages.length}</span>
            </div>

            {/* Search Box */}
            <div className="px-3 mb-2 relative">
                <Search size={12} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                    placeholder="Search pages..." 
                    className="h-8 pl-8 text-xs bg-muted/30"
                />
            </div>

            {pages.map(page => {
                const isActive = page.id === activePageId;
                return (
                    <div 
                        key={page.id} 
                        onClick={() => setActivePageId(page.id)}
                        className={`relative px-4 py-1.5 flex items-center text-sm cursor-pointer transition-colors group ${
                            isActive ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                    >
                        <div className={`${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} transition-colors flex items-center`}>
                           {getIcon(page.icon)}
                        </div>
                        <span className="flex-1 truncate">{page.name}</span>
                        {page.isHome && <span className="text-[9px] border border-border px-1 rounded text-muted-foreground mr-1">HOME</span>}
                        
                        {/* Action Menu Button */}
                        <div 
                        className={`rounded opacity-0 group-hover:opacity-100 transition-opacity ${activeMenuPage === page.id ? 'opacity-100' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuPage(activeMenuPage === page.id ? null : page.id);
                        }}
                        >
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical size={14} />
                            </Button>
                        </div>

                        {/* Context Menu */}
                        {activeMenuPage === page.id && (
                        <div 
                            ref={menuRef}
                            className="absolute right-2 top-8 w-32 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col py-1"
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
    </div>
  );
};

export default PagesPanel;
