import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check } from 'lucide-react';

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  group?: string;
}

interface DropdownProps {
  triggerLabel: React.ReactNode;
  triggerIcon?: React.ElementType;
  items: DropdownItem[];
  selectedId?: string;
  onSelect: (item: DropdownItem) => void;
  searchPlaceholder?: string;
  width?: number;
  footer?: React.ReactNode;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  triggerLabel,
  triggerIcon: Icon,
  items,
  selectedId,
  onSelect,
  searchPlaceholder = "Search...",
  width = 240,
  footer,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
      setSearchTerm('');
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both the dropdown content AND the trigger
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = (event: Event) => {
      // Ignore scrolls happening inside the dropdown itself
      if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
        return;
      }
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Use capture to detect scroll on any element, but filter inside handleScroll
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    const group = item.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, DropdownItem[]>);

  const DropdownContent = (
    <div 
      ref={dropdownRef}
      className="fixed z-[100] bg-popover text-popover-foreground border border-border rounded-lg shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col"
      style={{ 
        top: position.top, 
        left: position.left,
        width: width
      }}
      onMouseDown={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      {/* Search */}
      <div className="flex items-center px-3 border-b border-border/50">
        <Search size={14} className="shrink-0 opacity-50 text-muted-foreground" />
        <input 
          className="flex h-9 w-full rounded-md bg-transparent py-3 px-2 text-sm outline-none placeholder:text-muted-foreground border-none focus:ring-0 text-foreground" 
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      {/* List */}
      <div className="max-h-[300px] overflow-y-auto p-1">
        {Object.entries(groupedItems).map(([group, groupItems]: [string, DropdownItem[]]) => (
          <div key={group}>
             {group !== 'General' && (
                <div className="px-2 py-1.5 text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
                  {group}
                </div>
             )}
             {groupItems.map(item => (
               <div 
                 key={item.id}
                 onClick={(e) => {
                   e.stopPropagation();
                   onSelect(item);
                   setIsOpen(false);
                 }}
                 className={`relative flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium outline-none cursor-pointer select-none transition-colors ${
                   selectedId === item.id 
                   ? 'bg-accent text-accent-foreground' 
                   : 'text-foreground hover:bg-muted hover:text-foreground'
                 }`}
               >
                 {item.icon && <item.icon size={14} className="text-muted-foreground" />}
                 <span className="flex-1 truncate">{item.label}</span>
                 {selectedId === item.id && <Check size={14} className="text-primary" />}
               </div>
             ))}
          </div>
        ))}
        {filteredItems.length === 0 && (
            <div className="px-2 py-4 text-center text-xs text-muted-foreground">No results found</div>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-border p-1 bg-muted/20">
           {footer}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div 
        ref={triggerRef}
        onMouseDown={toggleDropdown} // Use onMouseDown to prevent focus loss/click timing issues
        className={`flex items-center gap-2 hover:bg-muted/50 px-2 py-1.5 rounded-md cursor-pointer transition-colors group select-none ${
            isOpen ? 'bg-muted/50' : ''
        } ${className}`}
      >
         {Icon && <Icon size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />}
         <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[150px]">{triggerLabel}</span>
         <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
      </div>
      {isOpen && createPortal(DropdownContent, document.body)}
    </>
  );
};

export default Dropdown;