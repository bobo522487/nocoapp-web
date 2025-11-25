import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Table, MoreVertical, Pencil, Trash2, Copy, Lock } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAppStore } from '../../../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { DbTable } from '../../../types';

const TablePanel: React.FC = () => {
  const navigate = useNavigate();
  const { tables, activeTableId, addTable, updateTable, deleteTable } = useAppStore();
  
  const [activeMenuTable, setActiveMenuTable] = useState<string | null>(null);
  
  // Rename State
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuTable(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleAddTable = () => {
      const newId = `table_${Date.now()}`;
      addTable({ id: newId, name: 'New Table' });
      navigate(`/data/${newId}`);
  };

  const startRenaming = (table: DbTable, e: React.MouseEvent) => {
      e.stopPropagation();
      setRenamingId(table.id);
      setRenameValue(table.name);
      setActiveMenuTable(null);
  };

  const saveRename = () => {
      if (renamingId && renameValue.trim()) {
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
               <span className="text-[10px] bg-muted px-1.5 rounded-full text-muted-foreground">{tables.length}</span>
            </div>

            {/* Search Box */}
            <div className="px-3 mb-2 relative">
                <Search size={12} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                    placeholder="Search tables..." 
                    className="h-8 pl-8 text-xs bg-muted/30 focus-visible:ring-primary"
                />
            </div>

            {tables.map(table => {
                const isActive = activeTableId === table.id;
                const isRenaming = renamingId === table.id;
                
                return (
                    <div 
                        key={table.id} 
                        onClick={() => handleTableClick(table.id)}
                        className={`relative px-4 py-1.5 flex items-center gap-2 text-sm cursor-pointer transition-colors group ${
                            isActive 
                            ? 'bg-accent text-accent-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                    >
                        <Table size={14} className={`${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} transition-colors`} />
                        
                        {isRenaming ? (
                            <input
                                ref={renameInputRef}
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={saveRename}
                                onKeyDown={handleRenameKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 min-w-0 h-6 bg-background border border-primary/50 rounded-sm px-1 text-xs outline-none text-foreground"
                            />
                        ) : (
                            <span className="flex-1 truncate">{table.name}</span>
                        )}
                        
                        {/* Action Menu Button */}
                        {!isRenaming && (
                            <div 
                                className={`rounded opacity-0 group-hover:opacity-100 transition-opacity ${activeMenuTable === table.id ? 'opacity-100' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuTable(activeMenuTable === table.id ? null : table.id);
                                }}
                            >
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical size={14} />
                                </Button>
                            </div>
                        )}

                        {/* Context Menu */}
                        {activeMenuTable === table.id && (
                        <div 
                            ref={menuRef}
                            className="absolute right-2 top-8 w-60 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-3 py-2">
                                <div className="flex items-center justify-between bg-muted/50 rounded border border-border/50 p-1.5 group/header hover:border-border transition-colors cursor-text" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex flex-col gap-0.5 overflow-hidden">
                                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">TABLE ID</span>
                                         <span className="text-xs font-mono font-medium truncate" title={table.id}>{table.id}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover/header:opacity-100 transition-opacity" title="Copy ID">
                                         <Copy size={12} />
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="h-px bg-border/50 mx-2 my-1" />

                            {/* Actions */}
                            <button 
                                onClick={(e) => startRenaming(table, e)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground/80 hover:text-foreground hover:bg-muted mx-1 rounded-md transition-colors"
                            >
                                <Pencil size={14} className="opacity-70" /> Rename table
                            </button>

                             <button 
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground/80 hover:text-foreground hover:bg-muted mx-1 rounded-md transition-colors"
                            >
                                <Copy size={14} className="opacity-70" /> Duplicate table
                            </button>

                            <div className="h-px bg-border/50 mx-2 my-1" />

                             <button 
                                className="flex items-center justify-between px-3 py-1.5 text-xs font-medium text-foreground/80 hover:text-foreground hover:bg-muted mx-1 rounded-md transition-colors group/item"
                            >
                                <div className="flex items-center gap-2">
                                    <Lock size={14} className="opacity-70" /> Edit permissions
                                </div>
                                <span className="text-[9px] font-bold text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-900/50 border border-sky-200 dark:border-sky-800 px-1.5 rounded-sm">Plus</span>
                            </button>

                            <div className="h-px bg-border/50 mx-2 my-1" />

                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTable(table.id);
                                    setActiveMenuTable(null);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 mx-1 rounded-md transition-colors"
                            >
                                <Trash2 size={14} /> Delete table
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

export default TablePanel;