import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  MousePointerClick,
  Table,
  FileText,
  TextCursor,
  CalendarClock,
  Type,
  ToggleLeft,
  MessageSquare,
  AppWindow,
  Box,
  GalleryHorizontal,
  List,
  Calendar,
  Kanban,
  BarChart3,
  LayoutGrid,
  GripVertical
} from 'lucide-react';
import { Input } from "../../../components/ui/input";
import { useDraggable } from '@dnd-kit/core';

// --- Config Data ---
const SECTIONS = [
  {
    title: "Commonly used",
    items: [
      { name: "Button", icon: MousePointerClick, isNew: false, type: 'button' },
      { name: "Input", icon: TextCursor, isNew: false, type: 'input' },
      { name: "Text Area", icon: FileText, isNew: false, type: 'textarea' },
      { name: "Text", icon: Type, isNew: false, type: 'text' },
      { name: "Table", icon: Table, isNew: false, type: 'table' },
    ]
  },
  {
    title: "Data",
    items: [
      { name: "Chart", icon: BarChart3, isNew: false, type: 'chart' },
      { name: "Stat Card", icon: BarChart3, isNew: false, type: 'stat' },
    ]
  }
];

interface DraggableItemProps {
  item: {
    name: string;
    icon: React.ElementType;
    isNew?: boolean;
    type: string;
  };
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${item.type}-${item.name}`,
    data: item
  });

  return (
    <div 
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`flex flex-col items-center justify-center p-2 rounded border border-transparent hover:bg-muted hover:border-border cursor-grab active:cursor-grabbing transition-all group relative ${isDragging ? 'opacity-50' : ''}`}
    >
        <div className="w-10 h-10 flex items-center justify-center mb-1 relative bg-muted/50 rounded-md group-hover:bg-background transition-colors border border-transparent group-hover:border-border">
            <item.icon size={20} strokeWidth={1.5} className="text-muted-foreground group-hover:text-primary transition-colors" />
            {item.isNew && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1 rounded-sm font-bold">New</span>
            )}
        </div>
        <span className="text-[10px] text-muted-foreground text-center leading-tight group-hover:text-foreground mt-1">
            {item.name}
        </span>
    </div>
  );
};

interface ComponentsPanelProps {
    onClose: () => void;
}

const ComponentsPanel: React.FC<ComponentsPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'components' | 'modules'>('components');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ "Commonly used": true, "Data": true });

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="flex flex-col h-full bg-card animate-in slide-in-from-left-4 duration-200">
      {/* Header Tabs */}
      <div className="flex items-center p-3 pb-0 border-b border-border shrink-0">
         <div className="flex-1 flex gap-4">
            <button 
                onClick={() => setActiveTab('components')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'components' 
                    ? 'text-primary border-primary' 
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
            >
                Components
            </button>
            <button 
                onClick={() => setActiveTab('modules')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'modules' 
                    ? 'text-primary border-primary' 
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
            >
                Modules
            </button>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent p-3">
        
        {/* Search Bar */}
        <div className="mb-4 relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
             <Input 
               type="text" 
               placeholder="Search components" 
               className="pl-9 h-8 text-xs bg-muted/30"
             />
        </div>

        {activeTab === 'components' ? (
            /* Components Tab */
            <div className="space-y-1">
                {SECTIONS.map((section) => (
                    <div key={section.title} className="border-b border-transparent">
                        <button 
                            onClick={() => toggleSection(section.title)}
                            className="w-full flex items-center justify-between py-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
                        >
                            <span>{section.title}</span>
                            {openSections[section.title] ? (
                                <ChevronDown size={12} className="text-muted-foreground group-hover:text-primary" />
                            ) : (
                                <ChevronRight size={12} className="text-muted-foreground group-hover:text-primary" />
                            )}
                        </button>
                        
                        {openSections[section.title] && (
                            <div className="grid grid-cols-3 gap-2 pb-3 animate-in fade-in zoom-in-95 duration-150">
                                {section.items.map((item, idx) => (
                                    <DraggableItem key={`${section.title}-${idx}`} item={item} />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            /* Modules Tab */
            <div className="space-y-3">
                {[
                    { id: 1, title: 'Auth Form', icon: LayoutGrid },
                    { id: 2, title: 'Header', icon: GripVertical }
                ].map((mod) => (
                    <div 
                        key={mod.id} 
                        className="flex items-center p-2 rounded border border-transparent hover:bg-muted hover:border-border cursor-pointer transition-all group"
                    >
                        <div className="w-12 h-10 flex items-center justify-center bg-muted/50 rounded mr-3 group-hover:bg-background transition-colors">
                             <mod.icon size={20} strokeWidth={1.5} className="text-muted-foreground group-hover:text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{mod.title}</span>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
};

export default ComponentsPanel;