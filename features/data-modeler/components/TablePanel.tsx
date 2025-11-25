
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Table, MoreVertical, Pencil, Trash2, Files, Eye } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAppStore } from '../../../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { DbTable } from '../../../types';

const TablePanel: React.FC = () => {
  const navigate = useNavigate();
  const { tables, activeTableId, addTable, updateTable, deleteTable } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');

  // State for Menu Position and Active Item
  const [activeMenu, setActiveMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  
  // Rename State
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Handle Outside Click and Scroll to Close Menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    const handleScroll = () => {
       if (activeMenu) setActiveMenu(null);
    };
    
    const handleResize = () => {
        if (activeMenu) setActiveMenu(null);
    };

    if (activeMenu) {
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeMenu]);

  // Focus input when renaming starts
  useEffect(() => {
      if (renamingId && renameInputRef.current) {
          renameInputRef.current.focus();
          renameInputRef.current.select();
      }
  }, [renamingId]);

  const handleTableClick = (tableId: string) => {
    if (renamingId === tableId) return;
    navigate(`/data/${tableId}`);
  };

  const handleMenuOpen = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveMenu({
          id,
          x: rect.left,
          y: rect.bottom + 4
      });
  };

  const handleAddTable = () => {
      const timestamp = Date.now();
      const newId = `table_${timestamp}`;
      addTable({ 
          id: newId, 
          name: 'New Table', 
          code: `new_table_${timestamp}`,
          kind: 'table'
      });
      navigate(`/data/${newId}`);
  };
  
  const handleDuplicateTable = (table: DbTable, e: React.MouseEvent) => {
      e.stopPropagation();
      const timestamp = Date.now();
      const newId = `${table.id}_copy_${Math.floor(Math.random() * 1000)}`;
      const newName = `${table.name} Copy`;
      const newCode = `${table.code}_copy_${timestamp}`;
      
      addTable({ 
          id: newId, 
          name: newName,
          code: newCode,
          kind: table.kind,
          description: table.description
      });
      setActiveMenu(null);
  };

  const startRenaming = (table: DbTable, e: React.MouseEvent) => {
      e.stopPropagation();
      setRenamingId(table.id);
      setRenameValue(table.name);
      setActiveMenu(null);
  };

  const saveRename = () => {
      if (renamingId && renameValue.trim()) {
          // Also simple slugify for code if it was default? For now just update name.
          updateTable(renamingId, { name: renameValue.trim() });
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

  const filteredTables = tables.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="h-12 px-4 border-b border-border flex justify-between items-center shrink-0 bg-muted/10">
          <span className="font-medium text-sm text-muted-foreground">Database</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddTable}>
             <Plus size={14} className="text-muted-foreground hover:text-foreground"/>
          </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
         
         {/* New Table Button */}
         <div className="px-3 mb-4">
            <Button 
                variant="secondary" 
                className="w-full justify-start h-8 text-xs font-medium" 
                size="sm"
                onClick={handleAddTable}
            >
               <Plus size={14} className="mr-2" /> New Table
            </Button>
         </div>

         <div className="mb-4">
            <div className="px-4 py-1 text-xs font-bold text-muted-foreground uppercase mb-2 flex justify-between items-center">
               <span>Tables</span>
               <span className="text-[10px] bg-muted px-1.5 rounded-full text-muted-foreground">{filteredTables.length}</span>
            </div>

            {/* Search Box */}
            <div className="px-3 mb-2 relative">
                <Search size={12} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                    placeholder="Search tables..." 
                    className="h-8 pl-8 text-xs bg-muted/30 focus-visible:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredTables.map(table => {
                const isActive = activeTableId === table.id;
                const isRenaming = renamingId === table.id;
                
                return (
                    <div 
                        key={table.id} 
                        onClick={() => handleTableClick(table.id)}
                        className={`relative px-4 py-2 flex items-center gap-2 text-sm cursor-pointer transition-colors group ${
                            isActive 
                            ? 'bg-accent text-accent-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                    >
                        <div className="flex flex-col items-center justify-center pt-0.5">
                            {table.kind === 'view' ? (
                                <Eye size={14} className={`${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} transition-colors`} />
                            ) : (
                                <Table size={14} className={`${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} transition-colors`} />
                            )}
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
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="truncate leading-tight">{table.name}</span>
                            </div>
                        )}
                        
                        {/* Action Menu Button */}
                        {!isRenaming && (
                            <div 
                                className={`rounded opacity-0 group-hover:opacity-100 transition-opacity ${activeMenu?.id === table.id ? 'opacity-100' : ''}`}
                                onClick={(e) => handleMenuOpen(e, table.id)}
                            >
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical size={14} />
                                </Button>
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
                {tables.find(t => t.id === activeMenu.id) && (
                    <div className="flex flex-col py-1">
                        {/* Rename */}
                        <div className="px-1">
                            <button 
                                onClick={(e) => startRenaming(tables.find(t => t.id === activeMenu.id)!, e)} 
                                className="flex items-center w-full px-2 py-1.5 text-xs text-foreground hover:bg-muted rounded-md transition-colors gap-2"
                            >
                                <Pencil size={14} className="opacity-70" /> Rename table
                            </button>
                        </div>

                        {/* Duplicate */}
                        <div className="px-1">
                            <button 
                                onClick={(e) => handleDuplicateTable(tables.find(t => t.id === activeMenu.id)!, e)} 
                                className="flex items-center w-full px-2 py-1.5 text-xs text-foreground hover:bg-muted rounded-md transition-colors gap-2"
                            >
                                <Files size={14} className="opacity-70" /> Duplicate table
                            </button>
                        </div>

                        {/* Delete */}
                        <div className="px-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); deleteTable(activeMenu.id); setActiveMenu(null); }} 
                                className="flex items-center w-full px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-md transition-colors gap-2"
                            >
                                <Trash2 size={14} /> Delete table
                            </button>
                        </div>
                    </div>
                )}
            </div>,
            document.body
         )}

      </div>
    </div>
  );
};

export default TablePanel;
