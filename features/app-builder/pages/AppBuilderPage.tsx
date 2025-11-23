import React, { useState } from 'react';
import Canvas from '../components/Canvas';
import PropertyPanel from '../components/PropertyPanel';
import { useResizable } from '../../../hooks/useResizable';
import { Button } from "../../../components/ui/button";
import { Undo2, Redo2, Monitor, Tablet, Smartphone, Save, Play, Rocket, MousePointer2, Hand } from 'lucide-react';

interface AppToolbarProps {
  device: 'desktop' | 'tablet' | 'mobile';
  setDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

const AppToolbar: React.FC<AppToolbarProps> = ({ device, setDevice }) => {
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

            {/* History */}
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Undo">
                    <Undo2 size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Redo">
                    <Redo2 size={16} />
                </Button>
            </div>
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
  droppedItem?: any;
  onItemConsumed?: () => void;
}

const AppBuilderPage: React.FC<AppBuilderPageProps> = ({ droppedItem, onItemConsumed }) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const { width, startResizing } = useResizable({
    initialWidth: 260,
    minWidth: 240,
    maxWidth: 600,
    edge: 'right'
  });

  return (
    <>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <AppToolbar device={device} setDevice={setDevice} />
          <div className="flex-1 flex overflow-hidden relative">
             <Canvas 
               device={device} 
               droppedItem={droppedItem}
               onItemConsumed={onItemConsumed}
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

      <PropertyPanel width={width} />
    </>
  );
};

export default AppBuilderPage;