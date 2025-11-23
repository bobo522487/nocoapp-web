
import React, { useState } from 'react';
import Canvas, { GridItemData } from '../components/Canvas';
import PropertyPanel from '../components/PropertyPanel';
import { useResizable } from '../../../hooks/useResizable';
import { Button } from "../../../components/ui/button";
import { Undo2, Redo2, Monitor, Tablet, Smartphone, Save, Play, Rocket, MousePointer2, Hand, Trash2 } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { Page } from '../../../types';

// Initial Layout Data
const INITIAL_LAYOUT: GridItemData[] = [
  { i: 'stat1', x: 0, y: 0, w: 3, h: 3, type: 'stat', title: 'Total Revenue', content: { value: '$45,231.89', trend: '+20.1%' } },
  { i: 'stat2', x: 3, y: 0, w: 3, h: 3, type: 'stat', title: 'Subscriptions', content: { value: '+2350', trend: '+180.1%' } },
  { i: 'stat3', x: 6, y: 0, w: 3, h: 3, type: 'stat', title: 'Sales', content: { value: '+12,234', trend: '+19%' } },
  { i: 'chart1', x: 0, y: 3, w: 8, h: 8, type: 'chart', title: 'Revenue Overview', content: {} },
  { i: 'list1', x: 8, y: 3, w: 4, h: 8, type: 'table', title: 'Recent Sales', content: {} },
];

interface AppToolbarProps {
  device: 'desktop' | 'tablet' | 'mobile';
  setDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onClearCanvas: () => void;
  pageName: string;
}

const AppToolbar: React.FC<AppToolbarProps> = ({ device, setDevice, onClearCanvas, pageName }) => {
  const [mode, setMode] = useState<'edit' | 'move'>('edit');

  return (
    <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0 z-10 transition-colors">
        {/* Left: Modes & History Actions */}
        <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex bg-muted/50 p-1 rounded-md">
                <Button 
                    variant={mode === 'edit' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setMode('edit')}
                    title="Edit Mode"
                >
                    <MousePointer2 size={16} />
                </Button>
                <Button 
                    variant={mode === 'move' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setMode('move')}
                    title="Move Mode"
                >
                    <Hand size={16} />
                </Button>
            </div>

            <div className="w-px h-6 bg-border"></div>

            <span className="text-sm font-medium text-muted-foreground">{pageName}</span>
        </div>

        {/* Center: Device Switcher */}
        <div className="flex bg-muted/50 p-1 rounded-md">
            <Button 
                variant={device === 'desktop' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setDevice('desktop')}
                title="Desktop"
            >
                <Monitor size={16} />
            </Button>
            <Button 
                variant={device === 'tablet' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setDevice('tablet')}
                title="Tablet"
            >
                <Tablet size={16} />
            </Button>
            <Button 
                variant={device === 'mobile' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setDevice('mobile')}
                title="Mobile"
            >
                <Smartphone size={16} />
            </Button>
        </div>

        {/* Right: Main Actions */}
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Undo">
                    <Undo2 size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Redo">
                    <Redo2 size={16} />
                </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={onClearCanvas} className="gap-2 h-8 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 size={14} /> Clear
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 h-8 text-muted-foreground">
                <Save size={14} /> Save
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-8">
                <Play size={14} /> Preview
            </Button>
            <Button variant="default" size="sm" className="gap-2 h-8 bg-blue-600 hover:bg-blue-700 text-white">
                <Rocket size={14} /> Publish
            </Button>
        </div>
    </div>
  );
};

interface AppBuilderPageProps {
  draggedItem?: any;
  droppedItem?: any;
  onItemConsumed?: () => void;
}

const AppBuilderPage: React.FC<AppBuilderPageProps> = ({ draggedItem, droppedItem, onItemConsumed }) => {
  const { pages, activePageId, updatePage } = useAppStore();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [layout, setLayout] = useState<GridItemData[]>(INITIAL_LAYOUT);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Derived active page
  const activePage = pages.find(p => p.id === activePageId);

  const { width, startResizing } = useResizable({
    initialWidth: 260,
    minWidth: 240,
    maxWidth: 600,
    edge: 'right'
  });

  const handleClearCanvas = () => {
    // Immediate clear without confirmation dialog to avoid blocking UI events
    setLayout([]);
    setSelectedItemId(null);
  };

  const handleUpdateItem = (id: string, updates: Partial<GridItemData>) => {
      setLayout(prev => prev.map(item => item.i === id ? { ...item, ...updates } : item));
  };

  const handlePageUpdate = (updates: Partial<Page>) => {
      if (activePageId) {
          updatePage(activePageId, updates);
      }
  };

  const selectedItem = layout.find(i => i.i === selectedItemId);

  return (
    <>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <AppToolbar 
            device={device} 
            setDevice={setDevice} 
            onClearCanvas={handleClearCanvas} 
            pageName={activePage?.name || 'Page'}
          />
          <div className="flex-1 flex overflow-hidden relative">
             <Canvas 
               device={device} 
               draggedItem={draggedItem}
               droppedItem={droppedItem}
               onItemConsumed={onItemConsumed}
               layout={layout}
               onLayoutChange={setLayout}
               selectedItemId={selectedItemId}
               onSelectItem={setSelectedItemId}
             />
          </div>
      </div>
      
      {/* PropertyPanel Resizer */}
      <div
        className="w-[1px] bg-border hover:bg-primary cursor-col-resize z-50 relative transition-colors"
        onMouseDown={startResizing}
      >
        <div className="absolute inset-y-0 -left-1 w-3 cursor-col-resize z-50" />
      </div>

      <PropertyPanel 
        width={width} 
        selectedItem={selectedItem} 
        onUpdate={handleUpdateItem}
        pageSettings={activePage}
        onPageUpdate={handlePageUpdate}
      />
    </>
  );
};

export default AppBuilderPage;
