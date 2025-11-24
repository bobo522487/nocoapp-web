
import React, { useState, useEffect, useRef } from 'react';
import { WidthProvider, Responsive, Layout } from "react-grid-layout";
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
  layout: GridItemData[];
  onLayoutChange: (layout: GridItemData[]) => void;
  selectedItemId?: string | null;
  onSelectItem?: (id: string | null) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  device = 'desktop', 
  droppedItem, 
  onItemConsumed, 
  layout, 
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

      // 1. Check if we are hovering over the canvas
      if (!over || over.id !== 'canvas-droppable' || !containerRef.current) {
        if (droppingItem) setDroppingItem(undefined);
        return;
      }

      // 2. Check if the active item is a component from the library
      if (!active.data.current || !active.data.current.type) {
         return;
      }

      const type = active.data.current.type;
      const { w, h } = getItemDimensions(type);
      
      // 3. Calculate Grid Position based on pointer location
      // dnd-kit provides the translated rect of the dragged item (the drag overlay)
      const activeRect = active.rect.current.translated;
      if (!activeRect) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Use the center of the dragged item for calculation
      const itemCenterX = activeRect.left + (activeRect.width / 2);
      const itemCenterY = activeRect.top + (activeRect.height / 2);

      // Relative position inside the container
      const relativeX = itemCenterX - containerRect.left;
      const relativeY = itemCenterY - containerRect.top;

      // 4. Convert pixels to grid units
      const currentCols = colsConfig[currentBreakpoint as keyof typeof colsConfig] || 12;
      const containerWidth = containerRect.width;
      
      // RGL Column Width Formula: 
      // colWidth = (containerWidth - (margin * (cols + 1))) / cols
      const marginX = margin[0];
      const colWidth = (containerWidth - (marginX * (currentCols + 1))) / currentCols;
      
      // Calculate Grid X and Y
      let gridX = Math.floor((relativeX - marginX) / (colWidth + marginX));
      let gridY = Math.floor((relativeY - marginX) / (rowHeight + margin[1]));

      // Clamp values
      gridX = Math.max(0, Math.min(gridX, currentCols - w));
      gridY = Math.max(0, gridY);

      // Update state only if changed to prevent excessive renders
      setDroppingItem(prev => {
        if (prev && prev.x === gridX && prev.y === gridY && prev.w === w && prev.h === h) {
          return prev;
        }
        return {
          i: '__dropping-elem__', // Special ID used by RGL for the placeholder
          w,
          h,
          x: gridX,
          y: gridY
        };
      });
    },
    onDragEnd() {
      // Clear placeholder on drop
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

      // Use the last known dropping position, or default to bottom
      const newItem: GridItemData = {
        i: droppedItem.id,
        x: droppingItem ? droppingItem.x : 0, 
        y: droppingItem ? droppingItem.y : Infinity, 
        w,
        h,
        type: droppedItem.type,
        title: droppedItem.name,
        content: { label: droppedItem.name } // Default content
      };

      if (!layout.find(i => i.i === newItem.i)) {
          onLayoutChange([...layout, newItem]);
          if (onSelectItem) onSelectItem(newItem.i); // Auto-select new item
      }
      onItemConsumed();
    }
  }, [droppedItem, onItemConsumed, layout, onLayoutChange, droppingItem, onSelectItem]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    const newLayout = layout.filter(item => item.i !== id);
    onLayoutChange(newLayout);
    if (selectedItemId === id && onSelectItem) {
        onSelectItem(null);
    }
  };

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    const item = layout.find(l => l.i === id);
    if (item) {
       const newItem = {
         ...item,
         i: `${item.type}-${Date.now()}`,
         y: Infinity, // Let grid layout handle placement
         x: item.x
       };
       onLayoutChange([...layout, newItem]);
       if (onSelectItem) onSelectItem(newItem.i);
    }
  };

  const handleLayoutChangeInternal = (newLayout: Layout[]) => {
      // Merge geometry from RGL with data from our state
      const mergedLayout = newLayout.map(l => {
          const original = layout.find(o => o.i === l.i);
          if (l.i === '__dropping-elem__') return null;
          
          if (original) {
              return {
                  ...original,
                  x: l.x,
                  y: l.y,
                  w: l.w,
                  h: l.h
              };
          }
          return null;
      }).filter(Boolean) as GridItemData[];

      onLayoutChange(mergedLayout);
  };

  const getContainerWidth = () => {
    switch(device) {
        case 'mobile': return 375;
        case 'tablet': return 768;
        case 'desktop': default: return 1200; // Constrained max width for aesthetics
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

  // --- Renderers for specific widget types ---

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
             {/* Mock Chart Visual */}
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

  const handleCanvasClick = (e: React.MouseEvent) => {
     // If clicking the canvas background (not an item), deselect
     if (e.target === e.currentTarget && onSelectItem) {
        onSelectItem(null);
     }
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/10 min-w-0 overflow-auto transition-colors relative">
      
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ 
               backgroundImage: 'radial-gradient(circle, #a1a1aa 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
           }}
      ></div>

      {/* Canvas Area */}
      <div 
        className="flex-1 flex justify-center p-8 z-10 min-h-full cursor-default"
        onClick={handleCanvasClick}
      >
         
         <div 
            ref={containerRef}
            className={getContainerClass()}
            style={{ width: device !== 'desktop' ? undefined : '100%', maxWidth: device === 'desktop' ? '1200px' : undefined }}
         >
            {/* Set Drop Ref on the wrapper for dnd-kit detection */}
            <div ref={setNodeRef} className="w-full h-full">

            {/* Grid Container */}
            {mounted && (
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{ lg: layout }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={colsConfig}
                    rowHeight={rowHeight}
                    width={getContainerWidth()}
                    margin={margin}
                    isDraggable={true}
                    isResizable={true}
                    // Enable Dropping via RGL native props controlled by dnd-kit monitor
                    isDropping={!!droppingItem}
                    droppingItem={droppingItem}
                    // Listeners
                    onLayoutChange={handleLayoutChangeInternal}
                    onBreakpointChange={(bp) => setCurrentBreakpoint(bp)}
                    draggableHandle=".drag-handle"
                >
                    {layout.map((item) => {
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
                              {/* Drag Handle (Left) */}
                              <div className="drag-handle absolute top-2 left-2 z-50 p-1 rounded-sm cursor-grab active:cursor-grabbing hover:bg-muted bg-background/80 border border-border backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                  <GripVertical size={14} className="text-muted-foreground" />
                              </div>

                              {/* Action Buttons (Right) */}
                              <div className="absolute top-2 right-2 z-50 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {/* Copy */}
                                  <div 
                                      onClick={(e) => handleDuplicate(e, item.i)} 
                                      className="p-1 rounded-sm cursor-pointer hover:bg-muted bg-background/80 border border-border backdrop-blur-sm"
                                      title="Duplicate"
                                  >
                                      <Copy size={14} className="text-muted-foreground hover:text-foreground" />
                                  </div>
                                  {/* Delete */}
                                  <div 
                                      onClick={(e) => handleDelete(e, item.i)} 
                                      className="p-1 rounded-sm cursor-pointer hover:bg-muted bg-background/80 border border-border backdrop-blur-sm"
                                      title="Delete"
                                  >
                                      <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                                  </div>
                              </div>

                              {/* Widget Content */}
                              {renderItemContent(item)}
                          </div>
                      );
                    })}
                </ResponsiveGridLayout>
            )}
            
            {/* Empty State / Drop Hint */}
            {layout.length === 0 && !droppingItem && (
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
