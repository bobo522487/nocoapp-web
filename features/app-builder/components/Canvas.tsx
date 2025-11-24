
import React, { useState, useEffect, useRef } from 'react';
import { WidthProvider, Responsive, Layout, Layouts } from "react-grid-layout";
import { GripVertical, BarChart3, TrendingUp, Users, DollarSign, ArrowUpRight, Type, MousePointerClick, Copy, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { useDroppable, useDndMonitor, DragMoveEvent } from '@dnd-kit/core';
import { GridItemData } from '../../../types';

// Wrap ResponsiveGridLayout with WidthProvider to handle window resizing automatically
const ResponsiveGridLayout = WidthProvider(Responsive) as any;

interface CanvasProps {
  device?: 'desktop' | 'tablet' | 'mobile';
  draggedItem?: any;
  droppedItem?: any;
  onItemConsumed?: () => void;
  layouts: Record<string, GridItemData[]>;
  onLayoutChange: (layouts: Record<string, GridItemData[]>) => void;
  selectedItemId?: string | null;
  onSelectItem?: (id: string | null) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  device = 'desktop', 
  droppedItem, 
  onItemConsumed, 
  layouts, 
  onLayoutChange,
  selectedItemId,
  onSelectItem
}) => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // RGL Dropping Item State
  const [droppingItem, setDroppingItem] = useState<{ i: string; w: number; h: number; x: number; y: number } | undefined>(undefined);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');

  // Columns configuration to match RGL props
  const colsConfig = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
  const margin: [number, number] = [12, 12];
  const rowHeight = 30;

  // Setup Droppable for detection
  const { setNodeRef } = useDroppable({
    id: 'canvas-droppable',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to determine item dimensions
  const getItemDimensions = (type: string) => {
    let w = 6;
    let h = 4;
    
    if (type === 'stat') { w = 3; h = 3; }
    else if (type === 'button') { w = 2; h = 2; }
    else if (type === 'input' || type === 'text') { w = 4; h = 3; }
    else if (type === 'textarea') { w = 4; h = 4; }
    else if (type === 'table' || type === 'chart') { w = 6; h = 8; }
    
    return { w, h };
  };

  // Monitor DnD events to update dropping placeholder
  useDndMonitor({
    onDragMove(event: DragMoveEvent) {
      const { active, over } = event;

      if (!over || over.id !== 'canvas-droppable' || !containerRef.current) {
        if (droppingItem) setDroppingItem(undefined);
        return;
      }

      if (!active.data.current || !active.data.current.type) {
         return;
      }

      const type = active.data.current.type;
      const { w, h } = getItemDimensions(type);
      
      const activeRect = active.rect.current.translated;
      if (!activeRect) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      
      const itemCenterX = activeRect.left + (activeRect.width / 2);
      const itemCenterY = activeRect.top + (activeRect.height / 2);

      const relativeX = itemCenterX - containerRect.left;
      const relativeY = itemCenterY - containerRect.top;

      const currentCols = colsConfig[currentBreakpoint as keyof typeof colsConfig] || 12;
      const containerWidth = containerRect.width;
      
      const marginX = margin[0];
      const colWidth = (containerWidth - (marginX * (currentCols + 1))) / currentCols;
      
      let gridX = Math.floor((relativeX - marginX) / (colWidth + marginX));
      let gridY = Math.floor((relativeY - marginX) / (rowHeight + margin[1]));

      gridX = Math.max(0, Math.min(gridX, currentCols - w));
      gridY = Math.max(0, gridY);

      setDroppingItem(prev => {
        if (prev && prev.x === gridX && prev.y === gridY && prev.w === w && prev.h === h) {
          return prev;
        }
        return {
          i: '__dropping-elem__',
          w,
          h,
          x: gridX,
          y: gridY
        };
      });
    },
    onDragEnd() {
      setDroppingItem(undefined);
    },
    onDragCancel() {
      setDroppingItem(undefined);
    }
  });

  // Handle Drop (Finalize)
  useEffect(() => {
    if (droppedItem && onItemConsumed) {
      const { w, h } = getItemDimensions(droppedItem.type);

      const newItemBase: GridItemData = {
        i: droppedItem.id,
        x: droppingItem ? droppingItem.x : 0, 
        y: droppingItem ? droppingItem.y : Infinity, 
        w,
        h,
        type: droppedItem.type,
        title: droppedItem.name,
        content: { label: droppedItem.name }
      };

      // Add to all existing layouts to ensure availability across breakpoints
      const newLayouts = { ...layouts };
      // Ensure 'lg' exists at minimum
      if (!newLayouts['lg']) newLayouts['lg'] = [];

      // Add to all keys
      ['lg', 'md', 'sm', 'xs', 'xxs'].forEach(bp => {
          const currentBpLayout = newLayouts[bp] || newLayouts['lg']; // Fallback to lg structure
          
          // Check for duplicate
          if (!currentBpLayout.find(i => i.i === newItemBase.i)) {
              // Adjust width for smaller screens if needed
              let adjustedW = w;
              if (bp === 'xs' && adjustedW > 4) adjustedW = 4;
              if (bp === 'xxs' && adjustedW > 2) adjustedW = 2;

              newLayouts[bp] = [...currentBpLayout, { ...newItemBase, w: adjustedW }];
          }
      });

      onLayoutChange(newLayouts);
      if (onSelectItem) onSelectItem(newItemBase.i);
      onItemConsumed();
    }
  }, [droppedItem, onItemConsumed, layouts, onLayoutChange, droppingItem, onSelectItem]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Remove from all layouts
    const newLayouts: Record<string, GridItemData[]> = {};
    Object.keys(layouts).forEach(bp => {
        newLayouts[bp] = layouts[bp].filter(item => item.i !== id);
    });

    onLayoutChange(newLayouts);
    if (selectedItemId === id && onSelectItem) {
        onSelectItem(null);
    }
  };

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    const newId = `${id.split('-')[0]}-${Date.now()}`;
    const newLayouts: Record<string, GridItemData[]> = {};

    Object.keys(layouts).forEach(bp => {
        const item = layouts[bp].find(l => l.i === id);
        if (item) {
            newLayouts[bp] = [...layouts[bp], {
                ...item,
                i: newId,
                y: Infinity, // Let grid reflow
                x: item.x
            }];
        } else {
            newLayouts[bp] = layouts[bp];
        }
    });

    onLayoutChange(newLayouts);
    if (onSelectItem) onSelectItem(newId);
  };

  const handleLayoutChangeInternal = (currentLayout: Layout[], allLayouts: Layouts) => {
      // Sync RGL layouts back to our GridItemData structure
      // Preserving metadata (type, title, content) from the source of truth (likely LG or previous state)
      
      const newLayoutsState: Record<string, GridItemData[]> = {};
      
      Object.keys(allLayouts).forEach(bp => {
          const bpLayoutRGL = allLayouts[bp];
          // We try to find the original object in the current breakpoint state, or fallback to LG
          const sourceLayout = layouts[bp] || layouts['lg'] || [];
          
          newLayoutsState[bp] = bpLayoutRGL.map(l => {
              if (l.i === '__dropping-elem__') return null;

              const original = sourceLayout.find(o => o.i === l.i) || layouts['lg']?.find(o => o.i === l.i);
              if (!original) return null;
              
              return {
                  ...original,
                  x: l.x,
                  y: l.y,
                  w: l.w,
                  h: l.h
              };
          }).filter(Boolean) as GridItemData[];
      });

      onLayoutChange(newLayoutsState);
  };

  const getContainerWidth = () => {
    switch(device) {
        case 'mobile': return 375;
        case 'tablet': return 768;
        case 'desktop': default: return 1200;
    }
  };

  const getContainerClass = () => {
    const base = "bg-background border border-border shadow-sm transition-all duration-300 ease-in-out relative";
    switch(device) {
        case 'mobile': return `${base} w-[375px] min-h-[667px] my-8 rounded-[2rem] border-8 border-gray-800 dark:border-gray-800`;
        case 'tablet': return `${base} w-[768px] min-h-[1024px] my-8 rounded-lg`;
        case 'desktop': default: return `${base} w-full max-w-[1200px] min-h-[800px] my-8 rounded-md`;
    }
  };

  // --- Renderers ---
  const renderStatWidget = (item: GridItemData) => (
    <Card className="h-full w-full flex flex-col justify-between shadow-none border-0 bg-transparent pointer-events-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
            {item.content?.icon && <item.content.icon className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{item.content?.value || '0'}</div>
            <p className="text-xs text-muted-foreground">
                {item.content?.trend || '+0%'} from last month
            </p>
        </CardContent>
    </Card>
  );

  const renderChartWidget = (item: GridItemData) => (
    <Card className="h-full w-full flex flex-col shadow-none border-0 bg-transparent pointer-events-none">
        <CardHeader className="p-4">
            <CardTitle className="text-base">{item.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-1">
             <div className="w-full h-full flex items-end justify-between gap-2 px-2 pb-2">
                {[40, 65, 30, 70, 45, 80, 55, 30, 60, 45, 85, 50].map((h, i) => (
                    <div 
                        key={i} 
                        className="bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm w-full"
                        style={{ height: `${h}%` }}
                    ></div>
                ))}
             </div>
        </CardContent>
    </Card>
  );

  const renderTableWidget = (item: GridItemData) => (
    <Card className="h-full w-full flex flex-col shadow-none border-0 bg-transparent pointer-events-none">
        <CardHeader className="p-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base">{item.title}</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6"><ArrowUpRight size={14}/></Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
             <div className="space-y-4 px-4">
                {[1,2,3].map(i => (
                    <div key={i} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">OM</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">User Name</span>
                                <span className="text-xs text-muted-foreground">user@email.com</span>
                            </div>
                        </div>
                        <div className="text-sm font-medium">+$1,999.00</div>
                    </div>
                ))}
             </div>
        </CardContent>
    </Card>
  );

  const renderInputWidget = (item: GridItemData) => (
      <div className="p-4 w-full h-full flex flex-col gap-2 pointer-events-none">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {item.title || 'Input Label'}
          </label>
          <Input placeholder={item.content?.placeholder || "Enter text..."} defaultValue={item.content?.defaultValue} className="bg-background" />
      </div>
  );

  const renderTextareaWidget = (item: GridItemData) => (
    <div className="p-4 w-full h-full flex flex-col gap-2 pointer-events-none">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {item.title || 'Description'}
        </label>
        <Textarea placeholder={item.content?.placeholder || "Type your message here."} className="bg-background resize-none h-full" />
    </div>
  );

  const renderButtonWidget = (item: GridItemData) => (
    <div className="p-4 w-full h-full flex items-center justify-center pointer-events-none">
        <Button className="w-full h-full" variant={item.content?.variant || 'default'}>{item.title || 'Button'}</Button>
    </div>
  );

  const renderItemContent = (item: GridItemData) => {
      switch(item.type) {
          case 'stat': return renderStatWidget(item);
          case 'chart': return renderChartWidget(item);
          case 'table': return renderTableWidget(item);
          case 'input': return renderInputWidget(item);
          case 'textarea': return renderTextareaWidget(item);
          case 'button': return renderButtonWidget(item);
          default: return (
            <div className="p-4 text-sm flex flex-col items-center justify-center h-full text-muted-foreground pointer-events-none">
                <Type size={24} className="mb-2 opacity-50"/>
                {item.title}
            </div>
          );
      }
  };

  // Determine which items to render. RGL handles switching based on breakpoints,
  // but we need to pass the correct `layouts` object prop.
  // For the initial `children` generation, using `lg` or fallback is standard,
  // as RGL will position them based on the matching layout key.
  // We ensure we iterate over a set that contains ALL items from all layouts if they differ, 
  // but typically 'lg' has the master list.
  const renderItems = layouts['lg'] || [];

  return (
    <div className="flex-1 flex flex-col bg-muted/10 min-w-0 overflow-auto transition-colors relative">
      
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ 
               backgroundImage: 'radial-gradient(circle, #a1a1aa 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
           }}
      ></div>

      <div 
        className="flex-1 flex justify-center p-8 z-10 min-h-full cursor-default"
        onClick={(e) => {
             if (e.target === e.currentTarget && onSelectItem) {
                onSelectItem(null);
             }
        }}
      >
         
         <div 
            ref={containerRef}
            className={getContainerClass()}
            style={{ width: device !== 'desktop' ? undefined : '100%', maxWidth: device === 'desktop' ? '1200px' : undefined }}
         >
            <div ref={setNodeRef} className="w-full h-full">

            {mounted && (
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layouts}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={colsConfig}
                    rowHeight={rowHeight}
                    width={getContainerWidth()}
                    margin={margin}
                    isDraggable={true}
                    isResizable={true}
                    isDropping={!!droppingItem}
                    droppingItem={droppingItem}
                    onLayoutChange={handleLayoutChangeInternal}
                    onBreakpointChange={setCurrentBreakpoint}
                    draggableHandle=".drag-handle"
                >
                    {renderItems.map((item) => {
                        const isSelected = item.i === selectedItemId;
                        return (
                          <div 
                            key={item.i} 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectItem) onSelectItem(item.i);
                            }}
                            className={`bg-card border rounded-lg shadow-sm transition-all group overflow-hidden ${isSelected ? 'ring-2 ring-blue-500 border-blue-500 z-50' : 'border-border hover:border-blue-300'}`}
                          >
                              <div className="drag-handle absolute top-2 left-2 z-50 p-1 rounded-sm cursor-grab active:cursor-grabbing hover:bg-muted bg-background/80 border border-border backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                  <GripVertical size={14} className="text-muted-foreground" />
                              </div>

                              <div className="absolute top-2 right-2 z-50 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div 
                                      onClick={(e) => handleDuplicate(e, item.i)} 
                                      className="p-1 rounded-sm cursor-pointer hover:bg-muted bg-background/80 border border-border backdrop-blur-sm"
                                      title="Duplicate"
                                  >
                                      <Copy size={14} className="text-muted-foreground hover:text-foreground" />
                                  </div>
                                  <div 
                                      onClick={(e) => handleDelete(e, item.i)} 
                                      className="p-1 rounded-sm cursor-pointer hover:bg-muted bg-background/80 border border-border backdrop-blur-sm"
                                      title="Delete"
                                  >
                                      <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                                  </div>
                              </div>

                              {renderItemContent(item)}
                          </div>
                      );
                    })}
                </ResponsiveGridLayout>
            )}
            
            {renderItems.length === 0 && !droppingItem && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
                    <div className="text-center">
                        <MousePointerClick size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Drag components here</p>
                    </div>
                </div>
            )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Canvas;
