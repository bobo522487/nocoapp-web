import React from 'react';
import { Home, LayoutGrid, Database, Settings, Code2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const ActivityBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveId = (pathname: string) => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/apps')) return 'apps';
    if (pathname.startsWith('/data')) return 'data';
    if (pathname.startsWith('/code')) return 'code';
    return '';
  };

  const activeId = getActiveId(location.pathname);

  const icons = [
    { id: 'home', icon: Home, label: '首页', path: '/' },
    { id: 'apps', icon: LayoutGrid, label: '应用', path: '/apps' },
    { id: 'data', icon: Database, label: '数据', path: '/data' },
    { id: 'code', icon: Code2, label: '代码', path: '/code' },
  ];

  return (
    <div className="w-14 flex flex-col items-center py-4 bg-muted/40 border-r border-border text-muted-foreground z-20 select-none transition-colors">
      {icons.map((item) => (
        <div
          key={item.id}
          title={item.label}
          onClick={() => navigate(item.path)}
          className={`group w-10 h-10 mb-4 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all relative hover:bg-accent hover:text-accent-foreground ${
            activeId === item.id ? 'bg-accent text-primary shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <item.icon size={20} strokeWidth={1.5} />
        </div>
      ))}
      
      <div className="flex-1" />
      
      <div className="w-10 h-10 flex items-center justify-center mb-2 cursor-pointer text-muted-foreground hover:text-accent-foreground rounded-lg hover:bg-accent transition-colors">
        <Settings size={20} strokeWidth={1.5} />
      </div>
    </div>
  );
};

export default ActivityBar;