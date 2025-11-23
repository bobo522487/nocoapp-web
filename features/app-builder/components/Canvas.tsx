import React, { useState, useEffect } from 'react';
import { WidthProvider, Responsive } from "react-grid-layout";
import { GripVertical, BarChart3, TrendingUp, Users, DollarSign, ArrowUpRight, Type, MousePointerClick } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { useDroppable } from '@dnd-kit/core';

// Wrap ResponsiveGridLayout with WidthProvider to handle window resizing automatically
const ResponsiveGridLayout = WidthProvider(Responsive);

interface CanvasProps {
  device?: 'desktop' | 'tablet' | 'mobile';
  droppedItem?: any;
  onItemConsumed?: () => void;
}

interface GridItemData {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  type: string;
  title?: string;
  content?: any;
}

// Initial Layout Data
const INITIAL_LAYOUT: GridItemData[] = [
  { i: 'stat1', x: 0, y: 0, w: 3, h: 3, type: 'stat', title: 'Total Revenue', content: { value: '$45,231.89', trend: '+20.1%', icon: DollarSign } },
  { i: 'stat2', x: 3, y: 0, w: 3, h: 3, type: 'stat', title: 'Subscriptions', content: { value: '+2350', trend: '+180.1%', icon: Users } },
  { i: 'stat3', x: 6, y: 0, w: 3, h: 3, type: 'stat', title: 'Sales', content: { value: '+12,234', trend: '+19%', icon: TrendingUp } },
  { i: 'chart1', x: 0, y: 3, w: 8, h: 8, type: 'chart', title: 'Revenue Overview', content: {} },
  { i: 'list1', x: 8, y: 3, w: 4, h: 8, type: 'table', title: 'Recent Sales', content: {} },
];

const Canvas: React.FC<CanvasProps> = ({ device = 'desktop', droppedItem, onItemConsumed }) => {
  const [layout, setLayout] = useState<GridItemData[]>(INITIAL_LAYOUT);
  const [mounted, setMounted] = useState(false);

  // Setup Droppable
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Drop
  useEffect(() => {
    if (droppedItem && onItemConsumed) {
      const newItem: GridItemData = {
        i: droppedItem.id,
        x: 0, // In a real implementation, calculate based on drop coordinates
        y: Infinity, // Puts it at the bottom
        w: droppedItem.type === 'stat' || droppedItem.type === 'button' ? 3 : 6,
        h: droppedItem.type === 'chart' || droppedItem.type === 'table' ? 6 : 2,
        type: droppedItem.type,
        title: droppedItem.name,
        content: { label: droppedItem.name }
      };

      // Adjust defaults for basic inputs
      if (['input', 'textarea'].includes(droppedItem.type)) {
        newItem.w = 4;
        newItem.h = 2;
        newItem.title = droppedItem.name;
      }
      if (droppedItem.type === 'button') {
        newItem.w = 2;
        newItem.h = 1;
        newItem.title = 'Button';
      }

      setLayout(prev => [...prev, newItem]);
      onItemConsumed();
    }
  }, [droppedItem, onItemConsumed]);

  const getContainerWidth = () => {
    switch(device) {
        case 'mobile': return 375;
        case 'tablet': return 768;
        case 'desktop': default: return 1200; // Constrained max width for aesthetics
    }
  };

  const getContainerClass = () => {
    const base = "bg-background border border-border shadow-sm transition-all duration-300 ease-in-out relative";
    const highlight = isOver ? "ring-2 ring-primary ring-offset-2" : "";
    
    switch(device) {
        case 'mobile': return `${base} ${highlight} w-[375px] min-h-[667px] my-8 rounded-[2rem] border-8 border-gray-800 dark:border-gray-800`;
        case 'tablet': return `${base} ${highlight} w-[768px] min-h-[1024px] my-8 rounded-lg`;
        case 'desktop': default: return `${base} ${highlight} w-full max-w-[1200px] min-h-[800px] my-8 rounded-md`;
    }
  };

  // --- Renderers for specific widget types ---

  const renderStatWidget = (item: GridItemData) => (
    <Card className="h-full w-full flex flex-col justify-between shadow-none border-0 bg-transparent">
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
    <Card className="h-full w-full flex flex-col shadow-none border-0 bg-transparent">
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
    <Card className="h-full w-full flex flex-col shadow-none border-0 bg-transparent">
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
      <div className="p-4 w-full h-full flex flex-col gap-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {item.title || 'Input Label'}
          </label>
          <Input placeholder="Enter text..." className="bg-background" />
      </div>
  );

  const renderTextareaWidget = (item: GridItemData) => (
    <div className="p-4 w-full h-full flex flex-col gap-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {item.title || 'Description'}
        </label>
        <Textarea placeholder="Type your message here." className="bg-background resize-none h-full" />
    </div>
  );

  const renderButtonWidget = (item: GridItemData) => (
    <div className="p-4 w-full h-full flex items-center justify-center">
        <Button className="w-full h-full">{item.title || 'Button'}</Button>
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
            <div className="p-4 text-sm flex flex-col items-center justify-center h-full text-muted-foreground">
                <Type size={24} className="mb-2 opacity-50"/>
                {item.title}
            </div>
          );
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
      <div className="flex-1 flex justify-center p-8 z-10 min-h-full">
         
         <div 
            ref={setNodeRef}
            className={getContainerClass()}
            style={{ width: device !== 'desktop' ? undefined : '100%', maxWidth: device === 'desktop' ? '1200px' : undefined }}
         >
            {/* Grid Container */}
            {mounted && (
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{ lg: layout }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={30}
                    width={getContainerWidth()}
                    margin={[12, 12]}
                    isDraggable={true}
                    isResizable={true}
                    draggableHandle=".drag-handle"
                    onLayoutChange={(currentLayout) => {
                        // In a real app, layout changes would be persisted here
                    }}
                >
                    {layout.map((item) => (
                        <div key={item.i} className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/50 transition-all group overflow-hidden">
                            {/* Drag Handle Overlay (Visible on Hover) */}
                            <div className="drag-handle absolute top-2 right-2 z-50 p-1 rounded-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity bg-background/80 backdrop-blur-sm border border-border">
                                <GripVertical size={14} className="text-muted-foreground" />
                            </div>

                            {/* Widget Content */}
                            {renderItemContent(item)}
                        </div>
                    ))}
                </ResponsiveGridLayout>
            )}
            
            {/* Empty State / Drop Hint */}
            {layout.length === 0 && (
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
  );
};

export default Canvas;