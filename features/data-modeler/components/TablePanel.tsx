import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Table, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAppStore } from '../../../store/useAppStore';
import { useNavigate } from 'react-router-dom';

const TablePanel: React.FC = () => {
  const navigate = useNavigate();
  const { activeTableId } = useAppStore();
  const [activeMenuTable, setActiveMenuTable] = useState<string | null>(null);
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

  const handleTableClick = (table: string) => {
    navigate(`/data/${table}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-12 px-4 border-b border-border flex justify-between items-center shrink-0 bg-muted/10">
          <span className="font-medium text-sm text-muted-foreground">Database</span>
          <Button variant="ghost" size="icon" className="h-6 w-6">
             <Plus size={14} className="text-muted-foreground hover:text-foreground"/>
          </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
         
         {/* New Table Button */}
         <div className="px-3 mb-4">
            <Button variant="secondary" className="w-full justify-start h-8 text-xs font-medium" size="sm">
               <Plus size={14} className="mr-2" /> New Table
            </Button>
         </div>

         <div className="mb-4">
            <div className="px-4 py-1 text-xs font-bold text-muted-foreground uppercase mb-2 flex justify-between items-center">
               <span>Tables</span>
               <span className="text-[10px] bg-muted px-1.5 rounded-full text-muted-foreground">4</span>
            </div>

            {/* Search Box */}
            <div className="px-3 mb-2 relative">
                <Search size={12} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                    placeholder="Search tables..." 
                    className="h-8 pl-8 text-xs bg-muted/30"
                />
            </div>

            {['users', 'orders', 'products', 'inventory_logs'].map(table => {
                const isActive = activeTableId === table;
                return (
                    <div 
                        key={table} 
                        onClick={() => handleTableClick(table)}
                        className={`relative px-4 py-1.5 flex items-center gap-2 text-sm cursor-pointer transition-colors group ${
                            isActive 
                            ? 'bg-accent text-accent-foreground font-medium' 
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                    >
                        <Table size={14} className={`${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} transition-colors`} />
                        <span className="flex-1 truncate">{table}</span>
                        
                        {/* Action Menu Button */}
                        <div 
                        className={`rounded opacity-0 group-hover:opacity-100 transition-opacity`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuTable(activeMenuTable === table ? null : table);
                        }}
                        >
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical size={14} />
                            </Button>
                        </div>

                        {/* Context Menu */}
                        {activeMenuTable === table && (
                        <div 
                            ref={menuRef}
                            className="absolute right-2 top-8 w-32 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col py-1"
                        >
                            <button className="flex items-center gap-2 px-3 py-2 text-xs text-popover-foreground hover:bg-muted w-full text-left transition-colors">
                                <Pencil size={12} /> Rename
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-muted w-full text-left transition-colors">
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

export default TablePanel;