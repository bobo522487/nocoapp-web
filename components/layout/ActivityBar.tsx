import React from 'react';
import { Home, LayoutGrid, Database, Settings } from 'lucide-react';
import { ViewMode } from '../../types';
import { Button } from "../ui/button";

interface ActivityBarProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
}

const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, setActiveView }) => {
  const icons = [
    { id: ViewMode.HOME, icon: Home, label: '首页' },
    { id: ViewMode.APPS, icon: LayoutGrid, label: '应用' },
    { id: ViewMode.DATA, icon: Database, label: '数据' },
  ];

  return (
    <div className="w-14 flex flex-col items-center py-4 bg-muted/40 border-r border-border text-muted-foreground z-20 select-none transition-colors">
      {icons.map((item) => (
        <Button
          key={item.id}
          title={item.label}
          onClick={() => setActiveView(item.id)}
          variant={activeView === item.id ? "secondary" : "ghost"}
          size="icon"
          className={`mb-4 w-10 h-10 ${activeView === item.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <item.icon size={20} strokeWidth={1.5} />
        </Button>
      ))}
      
      <div className="flex-1" />
      
      <Button 
        variant="ghost" 
        size="icon"
        className="w-10 h-10 mb-2 text-muted-foreground hover:text-foreground"
      >
        <Settings size={20} strokeWidth={1.5} />
      </Button>
    </div>
  );
};

export default ActivityBar;