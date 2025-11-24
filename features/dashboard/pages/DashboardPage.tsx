import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Database, Plus, MoreVertical, Search, Box } from 'lucide-react';
import { ViewMode } from '../../../types';
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { useAppStore } from '../../../store/useAppStore';

const DashboardPage: React.FC = () => {
  const { setActiveView } = useAppStore();
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

  // Mock Data
  const apps = [
    {
      id: 'app-1',
      name: 'Order Management System',
      slug: 'order-mgmt-sys',
      description: 'Internal tool for managing customer orders.',
      lastEdited: '15d ago',
      color: 'bg-blue-500',
      pages: ['Dashboard', 'Orders'],
      isPublic: false
    },
    {
      id: 'app-2',
      name: 'CRM Dashboard',
      slug: 'crm-dashboard',
      description: 'Customer relationship management.',
      lastEdited: '12d ago',
      color: 'bg-purple-500',
      pages: ['Leads', 'Opportunities'],
      isPublic: true
    },
    {
      id: 'app-3',
      name: 'Employee Portal',
      slug: 'employee-portal',
      description: 'HR portal for leave requests.',
      lastEdited: '3d ago',
      color: 'bg-green-500',
      pages: ['Home', 'Profile'],
      isPublic: false
    },
    {
      id: 'app-4',
      name: 'E-commerce Frontend',
      slug: 'ecommerce-frontend',
      description: 'Store with cart and checkout.',
      lastEdited: '5h ago',
      color: 'bg-orange-500',
      pages: ['Home', 'Product'],
      isPublic: true
    },
    {
      id: 'app-5',
      name: 'Inventory Tracker',
      slug: 'inventory-tracker',
      description: 'Warehouse stock monitoring.',
      lastEdited: '1h ago',
      color: 'bg-red-500',
      pages: ['Stock', 'Alerts'],
      isPublic: false
    }
  ];

  const dataSources = [
    {
      id: 'src-1',
      name: 'nocoapp-db',
      type: 'PostgreSQL',
      lastEdited: '2d ago',
      color: 'bg-cyan-500',
      tables: ['users', 'orders', 'products', 'inventory_logs']
    },
    {
      id: 'src-2',
      name: 'production-analytics',
      type: 'MySQL',
      lastEdited: '5d ago',
      color: 'bg-indigo-500',
      tables: ['audit_trail', 'page_views', 'events']
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
                    className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-all hover:border-blue-500 hover:shadow-md cursor-pointer h-[150px]"
                    onClick={() => setActiveView(ViewMode.APPS)}
                  >
                    {/* Header */}
                    <div>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                {/* Adjusted Icon Size 16x16 inside a small container */}
                                <div className={`w-6 h-6 rounded flex items-center justify-center ${app.color} bg-opacity-10 transition-colors`}>
                                    <LayoutGrid size={16} className={app.color.replace('bg-', 'text-')} />
                                </div>
                                {/* Name Only */}
                                <span className="font-medium text-sm text-foreground truncate max-w-[140px] leading-tight">{app.name}</span>
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
                                        <div className="px-3 py-2 hover:bg-muted rounded-md cursor-pointer" role="button" data-cy="rename-app-card-option">
                                            <span className="text-xs font-medium">Rename app</span>
                                        </div>
                                        <div className="px-3 py-2 hover:bg-muted rounded-md cursor-pointer" role="button" data-cy="change-icon-card-option">
                                            <span className="text-xs font-medium">Change Icon</span>
                                        </div>
                                        <div className="px-3 py-2 hover:bg-muted rounded-md cursor-pointer" role="button" data-cy="add-to-folder-card-option">
                                            <span className="text-xs font-medium">Add to folder</span>
                                        </div>
                                        <div className="px-3 py-2 hover:bg-muted rounded-md cursor-pointer" role="button" data-cy="clone-app-card-option">
                                            <span className="text-xs font-medium">Clone app</span>
                                        </div>
                                        <div className="px-3 py-2 hover:bg-muted rounded-md cursor-pointer" role="button" data-cy="export-app-card-option">
                                            <span className="text-xs font-medium">Export app</span>
                                        </div>
                                        <div className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 text-destructive rounded-md cursor-pointer" role="button" data-cy="delete-app-card-option">
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
                className="group relative flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/5 overflow-hidden hover:border-blue-500/50 hover:bg-muted/20 transition-all cursor-pointer h-[150px]"
                onClick={() => setActiveView(ViewMode.APPS)}
              >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-background group-hover:shadow-sm transition-all">
                      <Plus size={20} className="text-muted-foreground group-hover:text-blue-500" />
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
                    className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-all hover:border-blue-500 hover:shadow-md cursor-pointer h-[150px]"
                    onClick={() => setActiveView(ViewMode.DATA)}
                  >
                      {/* Header */}
                      <div>
                          <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center ${src.color} bg-opacity-10 transition-colors`}>
                                        <Database size={16} className={src.color.replace('bg-', 'text-')} />
                                    </div>
                                    <span className="font-medium text-sm text-foreground truncate max-w-[140px] leading-tight">{src.name}</span>
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
                                        data-cy="src-card-options"
                                    >
                                        <div className="px-3 py-2 hover:bg-muted rounded-md cursor-pointer">
                                            <span className="text-xs font-medium">Rename source</span>
                                        </div>
                                        <div className="px-3 py-2 hover:bg-muted rounded-md cursor-pointer">
                                            <span className="text-xs font-medium">Sync schema</span>
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
                              {/* Using generic time format */}
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
                className="group relative flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/5 overflow-hidden hover:border-blue-500/50 hover:bg-muted/20 transition-all cursor-pointer h-[150px]"
                onClick={() => setActiveView(ViewMode.DATA)}
              >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-background group-hover:shadow-sm transition-all">
                      <Plus size={20} className="text-muted-foreground group-hover:text-blue-500" />
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