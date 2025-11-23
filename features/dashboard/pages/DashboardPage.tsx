import React from 'react';
import { LayoutGrid, Database, Plus, MoreHorizontal, Pencil, Play } from 'lucide-react';
import { ViewMode } from '../../../types';
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { useAppStore } from '../../../store/useAppStore';

const DashboardPage: React.FC = () => {
  const { setActiveView } = useAppStore();

  // Mock Data
  const apps = [
    {
      id: 'app-1',
      name: 'Order Management System',
      description: 'Internal tool for managing customer orders and inventory.',
      lastEdited: '15 days ago',
      color: 'bg-blue-500',
      pages: ['Dashboard', 'Orders', 'Customers', 'Inventory']
    },
    {
      id: 'app-2',
      name: 'CRM Dashboard',
      description: 'Customer relationship management and tracking.',
      lastEdited: '12 days ago',
      color: 'bg-purple-500',
      pages: ['Leads', 'Opportunities', 'Contacts', 'Reports']
    },
    {
      id: 'app-3',
      name: 'Employee Portal',
      description: 'HR portal for leave requests and payslips.',
      lastEdited: '3 days ago',
      color: 'bg-green-500',
      pages: ['Home', 'Profile', 'Leave Request']
    }
  ];

  const dataSources = [
    {
      id: 'src-1',
      name: 'nocoapp-db',
      type: 'PostgreSQL',
      lastEdited: '2 days ago',
      color: 'bg-orange-500',
      tables: ['users', 'orders', 'products', 'inventory_logs']
    },
    {
      id: 'src-2',
      name: 'production-analytics',
      type: 'MySQL',
      lastEdited: '5 days ago',
      color: 'bg-indigo-500',
      tables: ['audit_trail', 'page_views', 'events']
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto transition-colors">
      <div className="container max-w-7xl mx-auto py-10 px-6">
        
        {/* Hero / Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome back, Developer</h1>
          <p className="text-muted-foreground text-lg">Select an application or data source to start building.</p>
        </div>

        {/* Applications Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <LayoutGrid className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">Applications</h2>
              </div>
              <Button 
                  onClick={() => setActiveView(ViewMode.APPS)}
              >
                  New Application <Plus size={16} className="ml-2" />
              </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apps.map(app => (
                  <Card key={app.id} className="hover:shadow-lg hover:border-primary/50 transition-all duration-300 group flex flex-col bg-card">
                      <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                              <div className={`w-10 h-10 rounded-lg ${app.color} bg-opacity-10 flex items-center justify-center text-white shadow-sm ring-1 ring-inset ring-black/5`}>
                                  <LayoutGrid size={20} className={app.color.replace('bg-', 'text-')} />
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                  <MoreHorizontal size={16} />
                              </Button>
                          </div>
                          <CardTitle 
                              className="text-xl mt-4 cursor-pointer hover:text-primary transition-colors"
                              onClick={() => setActiveView(ViewMode.APPS)}
                          >
                              {app.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 mt-2 text-sm leading-relaxed">
                              {app.description}
                          </CardDescription>
                      </CardHeader>

                      <CardContent className="pb-3 flex-1">
                          <div className="flex items-center gap-2 mt-2">
                              {app.pages.slice(0, 3).map(page => (
                                <Badge key={page} variant="secondary" className="text-[10px] font-normal">{page}</Badge>
                              ))}
                              {app.pages.length > 3 && <Badge variant="secondary" className="text-[10px] font-normal">+{app.pages.length - 3}</Badge>}
                          </div>
                      </CardContent>

                      <CardFooter className="pt-4 border-t bg-muted/30 text-xs text-muted-foreground flex justify-between items-center">
                          <span>Edited {app.lastEdited}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() => setActiveView(ViewMode.APPS)}
                              >
                                  <Pencil size={12} className="mr-1" /> Edit
                              </Button>
                              <Button 
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                              >
                                  <Play size={12} className="mr-1" /> Launch
                              </Button>
                          </div>
                      </CardFooter>
                  </Card>
              ))}
          </div>
        </div>

        <Separator className="my-10" />

        {/* Data Sources Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Database className="text-primary" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">Data Sources</h2>
              </div>
              <Button 
                  variant="outline"
                  onClick={() => setActiveView(ViewMode.DATA)}
              >
                  Connect Data <Plus size={16} className="ml-2" />
              </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataSources.map(src => (
                  <Card key={src.id} className="hover:shadow-lg hover:border-primary/50 transition-all duration-300 group flex flex-col bg-card">
                      <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                              <div className={`w-10 h-10 rounded-lg ${src.color} bg-opacity-10 flex items-center justify-center text-white shadow-sm ring-1 ring-inset ring-black/5`}>
                                  <Database size={20} className={src.color.replace('bg-', 'text-')} />
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                  <MoreHorizontal size={16} />
                              </Button>
                          </div>
                          <CardTitle 
                              className="text-xl mt-4 cursor-pointer hover:text-primary transition-colors"
                              onClick={() => setActiveView(ViewMode.DATA)}
                          >
                              {src.name}
                          </CardTitle>
                          <div className="mt-2">
                              <Badge variant="outline" className="font-mono text-xs">{src.type}</Badge>
                          </div>
                      </CardHeader>
                      
                      <CardContent className="pb-3 flex-1">
                          <p className="text-sm text-muted-foreground">
                              {src.tables.length} tables configured
                          </p>
                      </CardContent>

                      <CardFooter className="pt-4 border-t bg-muted/30 text-xs text-muted-foreground flex justify-between items-center">
                          <span>Edited {src.lastEdited}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() => setActiveView(ViewMode.DATA)}
                              >
                                  <Pencil size={12} className="mr-1" /> Edit
                              </Button>
                              <Button 
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                              >
                                  <Database size={12} className="mr-1" /> View
                              </Button>
                          </div>
                      </CardFooter>
                  </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;