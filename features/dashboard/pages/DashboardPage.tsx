import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Database, Plus, MoreVertical, Search, Box } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeMenuAppId, setActiveMenuAppId] = useState<string | null>(null);
  const [activeMenuSourceId, setActiveMenuSourceId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuAppId(null);
        setActiveMenuSourceId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAppClick = (appId: string) => {
      // Navigate to the first page of the app (default behavior)
      navigate(`/apps/${appId}`);
  };

  const handleSourceClick = (srcId: string) => {
      // Navigate to data view
      navigate(`/data`);
  };

  // Mock Data
  const apps = [
    {
      id: 'app-1',
      name: 'Order Management System',
      description: 'Internal tool for managing customer orders.',
      lastEdited: '15d ago',
    },
    {
      id: 'app-2',
      name: 'CRM Dashboard',
      description: 'Customer relationship management.',
      lastEdited: '12d ago',
    },
    {
      id: 'app-3',
      name: 'Employee Portal',
      description: 'HR portal for leave requests.',
      lastEdited: '3d ago',
    },
    {
      id: 'app-4',
      name: 'E-commerce Frontend',
      description: 'Store with cart and checkout.',
      lastEdited: '5h ago',
    },
    {
      id: 'app-5',
      name: 'Inventory Tracker',
      description: 'Warehouse stock monitoring.',
      lastEdited: '1h ago',
    }
  ];

  const dataSources = [
    {
      id: 'src-1',
      name: 'nocoapp-db',
      type: 'PostgreSQL',
      lastEdited: '2d ago',
    },
    {
      id: 'src-2',
      name: 'production-analytics',
      type: 'MySQL',
      lastEdited: '5d ago',
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto transition-colors">
      <div className="container max-w-[1600px] mx-auto py-8 px-6">
        
        {/* Hero / Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Welcome back, Developer</h1>
          <p className="text-muted-foreground text-base">Select an application or data source to start building.</p>
        </div>

        {/* Applications Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">All Applications</h2>
                  <Badge variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground hover:bg-muted">{apps.length}</Badge>
              </div>
              
              <div className="flex items-center gap-3">
                  <div className="relative w-64 hidden sm:block">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search applications..." className="h-8 pl-8 text-xs bg-muted/30" />
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {apps.map(app => (
                  <div 
                    key={app.id} 
                    className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md cursor-pointer h-[150px]"
                    onClick={() => handleAppClick(app.id)}
                  >
                    {/* Header */}
                    <div>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                {/* Icon Container */}
                                <div className="w-8 h-8 rounded flex items-center justify-center bg-primary/10 transition-colors">
                                    <LayoutGrid size={18} className="text-primary" />
                                </div>
                                {/* Name */}
                                <span className="font-medium text-sm text-foreground truncate max-w-[140px] leading-tight mt-1 group-hover:text-primary transition-colors">{app.name}</span>
                            </div>
                            
                            <div className="relative">
                                <button 
                                    className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuAppId(activeMenuAppId === app.id ? null : app.id);
                                        setActiveMenuSourceId(null);
                                    }}
                                >
                                    <MoreVertical size={16} />
                                </button>

                                {/* Action Menu Popover */}
                                {activeMenuAppId === app.id && (
                                    <div 
                                        ref={menuRef} 
                                        className="absolute right-0 top-6 w-48 bg-popover border border-border rounded-lg shadow-xl z-50 p-1 flex flex-col animate-in fade-in zoom-in-95 duration-100"
                                        onClick={(e) => e.stopPropagation()}
                                        data-cy="card-options"
                                    >
                                        <div className="px-3 py-2 hover:bg-muted rounded-md cursor-pointer" role="button">
                                            <span className="text-xs font-medium">Rename app</span>
                                        </div>
                                        <div className="px-3 py-2 hover:bg-muted rounded-md cursor-pointer" role="button">
                                            <span className="text-xs font-medium">Export app</span>
                                        </div>
                                        <div className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 text-destructive rounded-md cursor-pointer" role="button">
                                            <span className="text-xs font-medium">Delete app</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Stats */}
                    <div className="flex items-center justify-between mt-auto pt-3">
                        <div className="text-[11px] text-muted-foreground font-medium">
                             <span>Edited {app.lastEdited}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                            <Box size={11} />
                            <span>Application</span>
                        </div>
                    </div>
                  </div>
              ))}
              
              {/* New Application Placeholder Card */}
              <div 
                className="group relative flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/5 overflow-hidden hover:border-primary/50 hover:bg-muted/20 transition-all cursor-pointer h-[150px]"
                onClick={() => navigate('/apps/new')}
              >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-background group-hover:shadow-sm transition-all">
                      <Plus size={20} className="text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Create New Application</span>
              </div>
          </div>
        </div>

        {/* Data Sources Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">Data Sources</h2>
                  <Badge variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground hover:bg-muted">{dataSources.length}</Badge>
              </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dataSources.map(src => (
                  <div 
                    key={src.id} 
                    className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md cursor-pointer h-[150px]"
                    onClick={() => handleSourceClick(src.id)}
                  >
                      {/* Header */}
                      <div>
                          <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded flex items-center justify-center bg-primary/10 transition-colors">
                                        <Database size={16} className="text-primary" />
                                    </div>
                                    <span className="font-medium text-sm text-foreground truncate max-w-[140px] leading-tight mt-1 group-hover:text-primary transition-colors">{src.name}</span>
                              </div>
                              
                              <div className="relative">
                                  <button 
                                      className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuSourceId(activeMenuSourceId === src.id ? null : src.id);
                                          setActiveMenuAppId(null);
                                      }}
                                  >
                                      <MoreVertical size={16} />
                                  </button>

                                  {/* Action Menu Popover */}
                                  {activeMenuSourceId === src.id && (
                                    <div 
                                        ref={menuRef} 
                                        className="absolute right-0 top-6 w-48 bg-popover border border-border rounded-lg shadow-xl z-50 p-1 flex flex-col animate-in fade-in zoom-in-95 duration-100"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="px-3 py-2 hover:bg-muted rounded-md cursor-pointer">
                                            <span className="text-xs font-medium">Rename source</span>
                                        </div>
                                        <div className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 text-destructive rounded-md cursor-pointer">
                                            <span className="text-xs font-medium">Delete source</span>
                                        </div>
                                    </div>
                                )}
                              </div>
                          </div>
                      </div>
                      
                      {/* Footer / Stats */}
                      <div className="flex items-center justify-between mt-auto pt-3">
                          <div className="text-[11px] text-muted-foreground font-medium">
                              <span>Edited {src.lastEdited}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                             <Database size={11} />
                             <span>Data Source</span>
                          </div>
                      </div>
                  </div>
              ))}

              {/* New Data Source Placeholder Card */}
              <div 
                className="group relative flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/5 overflow-hidden hover:border-primary/50 hover:bg-muted/20 transition-all cursor-pointer h-[150px]"
                onClick={() => navigate('/data')}
              >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-background group-hover:shadow-sm transition-all">
                      <Plus size={20} className="text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Create New Data Source</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;