import React from 'react';
import { LayoutGrid, Database, Plus, MoreHorizontal, Pencil, Play } from 'lucide-react';
import { ViewMode } from '../../../types';
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";

interface DashboardPageProps {
  setActiveView: (view: ViewMode) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveView }) => {
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
    <div className="flex-1 flex flex-col h-full bg-muted/20 overflow-y-auto p-8 transition-colors">
      
      {/* Hero / Welcome Section */}
      <div className="max-w-6xl mx-auto w-full mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome back, Developer</h1>
        <p className="text-muted-foreground">Select an application or data source to start building.</p>
      </div>

      {/* Applications Section */}
      <div className="max-w-6xl mx-auto w-full mb-12">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <LayoutGrid className="text-muted-foreground" size={20} />
                <h2 className="text-xl font-semibold text-foreground">Applications</h2>
            </div>
            <Button 
                variant="ghost" 
                className="gap-2 text-primary hover:text-primary/80"
                onClick={() => setActiveView(ViewMode.APPS)}
            >
                New Application <Plus size={16} />
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map(app => (
                <Card key={app.id} className="hover:shadow-md transition-all duration-300 group flex flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div className={`w-10 h-10 rounded-lg ${app.color} bg-opacity-10 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5`}>
                                <LayoutGrid size={20} className={app.color.replace('bg-', 'text-')} />
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal size={16} />
                            </Button>
                        </div>
                        <CardTitle 
                            className="text-lg mt-3 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => setActiveView(ViewMode.APPS)}
                        >
                            {app.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1.5">
                            {app.description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-3 flex-1">
                         <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                            <span>Edited {app.lastEdited}</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                            <span>{app.pages.length} Pages</span>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-3 border-t bg-muted/5 opacity-0 group-hover:opacity-100 transition-opacity gap-3">
                        <Button 
                            className="flex-1 gap-2" 
                            variant="default"
                            onClick={() => setActiveView(ViewMode.APPS)}
                        >
                            <Pencil size={14} /> Edit
                        </Button>
                        <Button 
                            className="flex-1 gap-2" 
                            variant="secondary"
                        >
                            <Play size={14} className="opacity-80" /> Launch
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>

      <Separator className="my-8 max-w-6xl mx-auto" />

      {/* Data Sources Section */}
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <Database className="text-muted-foreground" size={20} />
                <h2 className="text-xl font-semibold text-foreground">Data Sources</h2>
            </div>
            <Button 
                variant="ghost" 
                className="gap-2 text-primary hover:text-primary/80"
                onClick={() => setActiveView(ViewMode.DATA)}
            >
                Connect Data <Plus size={16} />
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataSources.map(src => (
                <Card key={src.id} className="hover:shadow-md transition-all duration-300 group flex flex-col">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                             <div className={`w-10 h-10 rounded-lg ${src.color} bg-opacity-10 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5`}>
                                <Database size={20} className={src.color.replace('bg-', 'text-')} />
                             </div>
                             <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal size={16} />
                            </Button>
                        </div>
                        <CardTitle 
                             className="text-lg mt-3 cursor-pointer hover:text-primary transition-colors"
                             onClick={() => setActiveView(ViewMode.DATA)}
                        >
                            {src.name}
                        </CardTitle>
                        <div className="mt-2">
                            <Badge variant="secondary" className="font-normal">{src.type}</Badge>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="pb-3 flex-1">
                        <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                            <span>Edited {src.lastEdited}</span>
                             <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                            <span>{src.tables.length} Tables</span>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-3 border-t bg-muted/5 opacity-0 group-hover:opacity-100 transition-opacity gap-3">
                        <Button 
                            className="flex-1 gap-2" 
                            variant="default"
                            onClick={() => setActiveView(ViewMode.DATA)}
                        >
                            <Pencil size={14} /> Edit
                        </Button>
                        <Button 
                             className="flex-1 gap-2" 
                             variant="secondary"
                        >
                            <Database size={14} /> View
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;