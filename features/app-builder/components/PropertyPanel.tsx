
import React, { useState } from 'react';
import { 
  MoreVertical, 
  ChevronDown, 
  ChevronRight, 
  Info, 
  Plus, 
  ExternalLink,
  LayoutGrid
} from 'lucide-react';
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { GridItemData, Page } from '../../../types';

// --- Reusable UI Components for the Panel ---

const FxButton = ({ active = false }: { active?: boolean }) => (
  <Button 
    variant="ghost"
    size="sm"
    className={`ml-auto h-5 px-1 text-[10px] font-mono font-medium ${
        active 
        ? 'text-primary' 
        : 'text-muted-foreground'
    }`}
    title="Toggle Dynamic Value"
  >
    Fx
  </Button>
);

const ControlHeader = ({ label, fx = true }: { label: string, fx?: boolean }) => (
  <div className="flex items-center justify-between mb-2">
    <Label className="text-[11px] text-muted-foreground font-medium">{label}</Label>
    {fx && <FxButton />}
  </div>
);

interface ControlProps {
  value?: string | number;
  placeholder?: string;
  onChange?: (val: string) => void;
  className?: string;
}

const InputControl = ({ value, placeholder, onChange, className = "" }: ControlProps) => (
  <div className={`relative ${className}`}>
    <Input 
        type="text" 
        value={value || ''} 
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-xs"
    />
  </div>
);

const SelectControl = ({ value, options, onChange }: { value: string, options: string[], onChange: (val: string) => void }) => (
  <select 
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const ToggleControl = ({ label, checked = false, onChange }: { label: string, checked?: boolean, onChange?: (val: boolean) => void }) => {
    const [internalChecked, setInternalChecked] = useState(checked);
    
    // Determine if controlled or uncontrolled
    const isChecked = onChange ? checked : internalChecked;

    const handleToggle = () => {
        const newValue = !isChecked;
        if (onChange) {
            onChange(newValue);
        } else {
            setInternalChecked(newValue);
        }
    };

    return (
        <div className="flex items-center justify-between mb-3">
            <Label className="text-[11px] text-muted-foreground font-medium cursor-pointer" onClick={handleToggle}>{label}</Label>
            <div className="flex items-center gap-2">
                <FxButton />
                <button 
                    onClick={handleToggle}
                    className={`inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                        isChecked ? 'bg-primary' : 'bg-input'
                    }`}
                >
                    <span className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                        isChecked ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                </button>
            </div>
        </div>
    );
};

const ColorPickerControl = ({ label, color, colorLabel }: { label: string, color: string, colorLabel: string }) => (
    <div className="mb-4">
        <ControlHeader label={label} fx={false} />
        <div className="flex items-center gap-2 p-1 border border-input rounded-md bg-card cursor-pointer hover:border-ring transition-colors shadow-sm">
            <div className="w-8 h-6 rounded-sm border border-border" style={{ backgroundColor: color }}></div>
            <span className="text-xs text-muted-foreground">{colorLabel}</span>
        </div>
    </div>
);

const Accordion = ({ title, children, defaultOpen = true, icon: Icon }: { title: string, children?: React.ReactNode, defaultOpen?: boolean, icon?: any }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <Button 
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-6 h-auto hover:bg-muted/50 rounded-none"
      >
        <div className="flex items-center gap-2">
            {Icon && <Icon size={14} className="text-muted-foreground" />}
            <span className="text-xs font-semibold text-foreground capitalize">{title}</span>
        </div>
        {isOpen ? (
            <ChevronDown size={14} className="text-muted-foreground" />
        ) : (
            <ChevronRight size={14} className="text-muted-foreground" />
        )}
      </Button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 animate-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

interface PropertyPanelProps {
  width: number;
  selectedItem?: GridItemData | null;
  onUpdate?: (id: string, updates: Partial<GridItemData>) => void;
  pageSettings?: Page;
  onPageUpdate?: (updates: Partial<Page>) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
  width, 
  selectedItem, 
  onUpdate,
  pageSettings,
  onPageUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'PROPERTIES' | 'STYLES'>('PROPERTIES');

  // If no item is selected, show Page Properties
  if (!selectedItem) {
      return (
        <div 
            style={{ width }}
            className="bg-card flex flex-col h-full shrink-0 overflow-hidden transition-colors border-l border-border"
        >
             {/* Header for Page Properties */}
             <div className="p-4 border-b border-border bg-card shrink-0">
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">Page Properties</span>
                 </div>
                 <p className="text-xs text-muted-foreground">Configure general page settings.</p>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
                <Accordion title="Page Group">
                    <div className="space-y-4">
                        <div>
                            <ControlHeader label="Page name" fx={false} />
                            <InputControl 
                                value={pageSettings?.name} 
                                onChange={(v) => onPageUpdate && onPageUpdate({ name: v })}
                                placeholder="e.g. Dashboard"
                            />
                        </div>
                        
                        <div>
                            <ControlHeader label="Icon" fx={false} />
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="w-full justify-start text-xs font-normal text-muted-foreground h-8">
                                    <LayoutGrid size={14} className="mr-2 text-foreground" /> 
                                    {pageSettings?.icon || 'Select Icon'}
                                </Button>
                            </div>
                        </div>

                        <div className="pt-2 space-y-1">
                            <ToggleControl 
                                label="Mark as home" 
                                checked={pageSettings?.isHome}
                                onChange={(checked) => onPageUpdate && onPageUpdate({ isHome: checked })}
                            />
                            <ToggleControl 
                                label="Hide" 
                                checked={pageSettings?.isHidden}
                                onChange={(checked) => onPageUpdate && onPageUpdate({ isHidden: checked })}
                            />
                            <ToggleControl 
                                label="Disable" 
                                checked={pageSettings?.isDisabled}
                                onChange={(checked) => onPageUpdate && onPageUpdate({ isDisabled: checked })}
                            />
                        </div>
                    </div>
                </Accordion>

                <Accordion title="Size Group">
                    <div>
                        <ControlHeader label="Height" fx={false} />
                        <div className="flex items-center gap-2 relative">
                            <InputControl 
                                value={pageSettings?.height} 
                                onChange={(v) => onPageUpdate && onPageUpdate({ height: v })}
                                placeholder="800"
                            />
                            <span className="text-[10px] text-muted-foreground absolute right-3 pointer-events-none">px</span>
                        </div>
                    </div>
                </Accordion>
            </div>
        </div>
      );
  }

  const handleTitleChange = (val: string) => {
      if (onUpdate && selectedItem) {
          onUpdate(selectedItem.i, { title: val });
      }
  };

  const handleContentChange = (key: string, val: any) => {
      if (onUpdate && selectedItem) {
          onUpdate(selectedItem.i, { 
              content: { ...selectedItem.content, [key]: val } 
          });
      }
  };

  return (
    <div 
      style={{ width }}
      className="bg-card flex flex-col h-full shrink-0 overflow-hidden transition-colors border-l border-border"
    >
      
      {/* Header */}
      <div className="p-4 border-b border-border bg-card shrink-0">
         <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
                <div className="text-[10px] text-muted-foreground font-mono mb-1 uppercase tracking-wider">{selectedItem.type}</div>
                <Input 
                    type="text" 
                    value={selectedItem.i}
                    readOnly
                    className="h-7 text-xs font-mono bg-muted/50 text-muted-foreground"
                />
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 mt-4">
                <MoreVertical size={16} className="text-muted-foreground" />
            </Button>
         </div>

         {/* Tabs */}
         <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full">
            <button 
                onClick={() => setActiveTab('PROPERTIES')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${
                    activeTab === 'PROPERTIES' 
                    ? 'bg-background text-foreground shadow' 
                    : 'hover:bg-background/50 hover:text-foreground'
                }`}
            >
                Properties
            </button>
            <button 
                onClick={() => setActiveTab('STYLES')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${
                    activeTab === 'STYLES' 
                    ? 'bg-background text-foreground shadow' 
                    : 'hover:bg-background/50 hover:text-foreground'
                }`}
            >
                Styles
            </button>
         </div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
        
        {activeTab === 'PROPERTIES' ? (
            <div className="pb-8">
                <Accordion title="General">
                    <div className="space-y-4">
                        <div>
                            <ControlHeader label="Label / Title" />
                            <InputControl 
                                value={selectedItem.title} 
                                onChange={handleTitleChange} 
                                placeholder="Component Title"
                            />
                        </div>
                        
                        {/* Dynamic Fields based on Type */}
                        
                        {(selectedItem.type === 'stat') && (
                            <>
                                <div>
                                    <ControlHeader label="Value" />
                                    <InputControl 
                                        value={selectedItem.content?.value} 
                                        onChange={(v) => handleContentChange('value', v)} 
                                        placeholder="e.g. $10,000"
                                    />
                                </div>
                                <div>
                                    <ControlHeader label="Trend" />
                                    <InputControl 
                                        value={selectedItem.content?.trend} 
                                        onChange={(v) => handleContentChange('trend', v)} 
                                        placeholder="e.g. +10%"
                                    />
                                </div>
                            </>
                        )}

                        {(selectedItem.type === 'button') && (
                            <>
                                <div>
                                    <ControlHeader label="Variant" fx={false} />
                                    <SelectControl 
                                        value={selectedItem.content?.variant || 'default'}
                                        options={['default', 'secondary', 'destructive', 'outline', 'ghost', 'link']}
                                        onChange={(v) => handleContentChange('variant', v)}
                                    />
                                </div>
                            </>
                        )}

                        {(selectedItem.type === 'input' || selectedItem.type === 'textarea') && (
                            <>
                                <div>
                                    <ControlHeader label="Placeholder" />
                                    <InputControl 
                                        value={selectedItem.content?.placeholder} 
                                        onChange={(v) => handleContentChange('placeholder', v)}
                                        placeholder="Placeholder text..."
                                    />
                                </div>
                                <div>
                                    <ControlHeader label="Default Value" />
                                    <InputControl 
                                        value={selectedItem.content?.defaultValue} 
                                        onChange={(v) => handleContentChange('defaultValue', v)}
                                    />
                                </div>
                            </>
                        )}

                    </div>
                </Accordion>

                <Accordion title="Layout & Visibility">
                    <div className="space-y-4">
                        <ToggleControl label="Visible" checked={true} />
                        <div>
                             <ControlHeader label="Tooltip" />
                             <InputControl placeholder="Enter tooltip text" />
                        </div>
                    </div>
                </Accordion>

                <Accordion title="Events">
                    <div className="border border-dashed border-border rounded-md p-4 flex flex-col items-center justify-center text-center mb-3 bg-muted/20">
                        <Info size={16} className="text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">No event handlers attached</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full h-8 gap-2 text-xs">
                        <Plus size={14} /> New event handler
                    </Button>
                </Accordion>

            </div>
        ) : (
            <div className="pb-8">
                <Accordion title="Typography">
                    <ColorPickerControl label="Text Color" color="#374151" colorLabel="Text/Primary" />
                </Accordion>

                <Accordion title="Container">
                    <div className="mb-4">
                        <ControlHeader label="Padding" fx={false} />
                        <div className="flex bg-muted rounded-md p-1">
                            <button className="flex-1 py-1 text-[10px] rounded-sm bg-background text-foreground shadow-sm">Default</button>
                            <button className="flex-1 py-1 text-[10px] rounded-sm text-muted-foreground hover:text-foreground transition-colors">None</button>
                        </div>
                    </div>
                    <ColorPickerControl label="Background" color="#ffffff" colorLabel="Surface/Card" />
                </Accordion>

                <Accordion title="Border & Shadow">
                     <div className="space-y-4">
                        <ColorPickerControl label="Border Color" color="#e5e7eb" colorLabel="Border/Default" />
                        
                        <div>
                            <ControlHeader label="Border Radius" fx={true} />
                            <div className="flex items-center gap-2 relative">
                                <Input type="number" defaultValue={6} className="h-8 text-xs" />
                                <span className="text-[10px] text-muted-foreground absolute right-3 pointer-events-none">px</span>
                            </div>
                        </div>

                        <ColorPickerControl label="Box Shadow" color="rgba(0,0,0,0.1)" colorLabel="#00000040" />
                    </div>
                </Accordion>
            </div>
        )}

        {/* Documentation Link */}
        <div className="p-4 mt-4 border-t border-border bg-muted/20">
            <a href="#" className="flex items-center gap-2 text-xs text-primary hover:underline transition-colors group">
                <ExternalLink size={12} />
                <span className="group-hover:underline">Read documentation for {selectedItem.type}</span>
            </a>
        </div>

      </div>
    </div>
  );
};

export default PropertyPanel;
