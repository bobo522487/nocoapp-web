import React, { useState, useEffect } from 'react';
import DataGrid from '../../../components/DataGrid';
import { ColumnDef } from '../../../components/DataTable';
import { useAppStore } from '../../../store/useAppStore';
import { SchemaField } from '../../../types';
import { FileKey, Type, Mail, CheckCircle2, Calendar, DollarSign, Package, ShoppingCart, ArrowUpDown, Database, TableIcon } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Switch } from "../../../components/ui/switch";
import { Checkbox } from "../../../components/ui/checkbox";

// --- Mock Data Store ---
const MOCK_DB: Record<string, { schema: SchemaField[], records: any[] }> = {
    'users': {
        schema: [
            { id: 'id', name: 'ID', type: 'number', width: 60, icon: FileKey, isPrimary: true, isNullable: false, defaultValue: 'auto-inc' },
            { id: 'name', name: 'Name', type: 'text', width: 200, icon: Type, isPrimary: false, isNullable: false, defaultValue: '', flex: true },
            { id: 'email', name: 'Email', type: 'email', width: 250, icon: Mail, isPrimary: false, isNullable: true, defaultValue: 'null', flex: true },
            { id: 'role', name: 'Role', type: 'select', width: 140, icon: CheckCircle2, isPrimary: false, isNullable: false, defaultValue: 'Viewer' },
            { id: 'status', name: 'Status', type: 'status', width: 120, icon: CheckCircle2, isPrimary: false, isNullable: false, defaultValue: 'Active' },
            { id: 'created', name: 'Created At', type: 'date', width: 180, icon: Calendar, isPrimary: false, isNullable: false, defaultValue: 'now()' },
        ],
        records: [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', created: '2023-10-01' },
            { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'Editor', status: 'Active', created: '2023-10-02' },
            { id: 3, name: 'Alice Johnson', email: 'alice@test.co', role: 'Viewer', status: 'Inactive', created: '2023-10-05' },
            { id: 4, name: 'Robert Brown', email: 'bob@domain.net', role: 'Editor', status: 'Active', created: '2023-10-10' },
            { id: 5, name: 'Charlie Davis', email: 'charlie@demo.org', role: 'Viewer', status: 'Active', created: '2023-10-12' },
            { id: 6, name: 'Diana Evans', email: 'diana@corp.com', role: 'Admin', status: 'Inactive', created: '2023-10-15' },
        ]
    },
    'orders': {
        schema: [
            { id: 'id', name: 'Order ID', type: 'number', width: 80, icon: FileKey, isPrimary: true, isNullable: false, defaultValue: 'auto-inc' },
            { id: 'customer', name: 'Customer', type: 'text', width: 200, icon: Type, isPrimary: false, isNullable: false, defaultValue: '', flex: true },
            { id: 'amount', name: 'Amount', type: 'number', width: 120, icon: DollarSign, isPrimary: false, isNullable: false, defaultValue: '0.00' },
            { id: 'status', name: 'Status', type: 'status', width: 120, icon: CheckCircle2, isPrimary: false, isNullable: false, defaultValue: 'Pending' },
            { id: 'date', name: 'Order Date', type: 'date', width: 160, icon: Calendar, isPrimary: false, isNullable: false, defaultValue: 'now()' },
        ],
        records: [
            { id: 1001, customer: 'John Doe', amount: '$120.50', status: 'Completed', date: '2023-11-01' },
            { id: 1002, customer: 'Jane Smith', amount: '$85.00', status: 'Processing', date: '2023-11-02' },
            { id: 1003, customer: 'Alice Johnson', amount: '$240.00', status: 'Pending', date: '2023-11-03' },
            { id: 1004, customer: 'Robert Brown', amount: '$45.99', status: 'Completed', date: '2023-11-04' },
        ]
    },
    'products': {
        schema: [
            { id: 'id', name: 'SKU', type: 'number', width: 80, icon: FileKey, isPrimary: true, isNullable: false, defaultValue: 'auto-inc' },
            { id: 'name', name: 'Product Name', type: 'text', width: 250, icon: Package, isPrimary: false, isNullable: false, defaultValue: '', flex: true },
            { id: 'category', name: 'Category', type: 'select', width: 150, icon: CheckCircle2, isPrimary: false, isNullable: false, defaultValue: 'General' },
            { id: 'price', name: 'Price', type: 'number', width: 100, icon: DollarSign, isPrimary: false, isNullable: false, defaultValue: '0.00' },
            { id: 'stock', name: 'Stock', type: 'number', width: 100, icon: ShoppingCart, isPrimary: false, isNullable: false, defaultValue: '0' },
        ],
        records: [
            { id: 501, name: 'Wireless Mouse', category: 'Electronics', price: '$29.99', stock: 150 },
            { id: 502, name: 'Mechanical Keyboard', category: 'Electronics', price: '$89.99', stock: 45 },
            { id: 503, name: 'Desk Chair', category: 'Furniture', price: '$199.99', stock: 12 },
            { id: 504, name: 'Monitor 27"', category: 'Electronics', price: '$249.50', stock: 30 },
        ]
    },
    'inventory_logs': {
        schema: [
            { id: 'id', name: 'Log ID', type: 'number', width: 80, icon: FileKey, isPrimary: true, isNullable: false, defaultValue: 'auto-inc' },
            { id: 'product', name: 'Product SKU', type: 'text', width: 150, icon: Package, isPrimary: false, isNullable: false, defaultValue: '' },
            { id: 'change', name: 'Quantity Change', type: 'number', width: 150, icon: ArrowUpDown, isPrimary: false, isNullable: false, defaultValue: '0' },
            { id: 'reason', name: 'Reason', type: 'select', width: 150, icon: Type, isPrimary: false, isNullable: false, defaultValue: 'Restock', flex: true },
            { id: 'timestamp', name: 'Timestamp', type: 'date', width: 180, icon: Calendar, isPrimary: false, isNullable: false, defaultValue: 'now()' },
        ],
        records: [
            { id: 1, product: 'SKU-501', change: '+50', reason: 'Restock', timestamp: '2023-11-01 10:00 AM' },
            { id: 2, product: 'SKU-503', change: '-2', reason: 'Sale', timestamp: '2023-11-01 11:30 AM' },
            { id: 3, product: 'SKU-502', change: '-5', reason: 'Damage', timestamp: '2023-11-02 09:15 AM' },
        ]
    }
}

const DataPage: React.FC = () => {
  const { activeTableId } = useAppStore();
  const [viewMode, setViewMode] = useState<'MODEL' | 'DATA'>('DATA');
  
  // Use state to manage the data locally since MOCK_DB is just the initial state
  const [schema, setSchema] = useState<SchemaField[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    // Load data based on activeTableId
    const data = MOCK_DB[activeTableId] || MOCK_DB['users'];
    setSchema(data.schema);
    setRecords(data.records);
    // Reset view mode on table switch
    setViewMode('DATA');
  }, [activeTableId]);

  // --- Handlers for DataGrid Actions ---

  const handleSchemaChange = (rowId: string | number, colId: string, value: any) => {
      setSchema(prev => prev.map(field => 
          field.id === rowId ? { ...field, [colId]: value } : field
      ));
  };

  const handleSchemaAdd = () => {
      const newField: SchemaField = {
          id: `col_${Date.now()}`,
          name: 'New Column',
          type: 'text',
          defaultValue: '',
          isPrimary: false,
          isNullable: true,
          description: 'New field description',
          flex: true,
          icon: Type
      };
      setSchema([...schema, newField]);
  };

  const handleSchemaDelete = (ids: (string | number)[]) => {
      const idsToDelete = new Set(ids.map(String));
      setSchema(prev => prev.filter(col => !idsToDelete.has(String(col.id))));
  };

  const handleDataChange = (rowId: string | number, colId: string, value: any) => {
      setRecords(prev => prev.map(record => 
          record.id === rowId ? { ...record, [colId]: value } : record
      ));
  };

  const handleDataAdd = () => {
      const newId = Math.max(...records.map(r => r.id), 0) + 1;
      const newRecord: any = { id: newId };
      schema.forEach(field => {
          if (field.id !== 'id') {
              newRecord[field.id] = '';
          }
      });
      setRecords([...records, newRecord]);
  };

  const handleDataDelete = (ids: (string | number)[]) => {
      // Ensure we compare strings to avoid number vs string issues
      const idsToDelete = new Set(ids.map(String));
      setRecords(prev => prev.filter(rec => !idsToDelete.has(String(rec.id))));
  };

  // --- Column Definitions ---

  // 1. Model View Columns (Editing Schema)
  const modelColumns: ColumnDef<SchemaField>[] = [
      {
          id: 'name',
          header: 'Column Name',
          accessorKey: 'name',
          width: '25%',
          minWidth: 200,
          editable: true,
          renderCell: (row) => (
              <div className="flex items-center gap-2 font-medium text-foreground">
                  {row.icon && <row.icon size={14} className="text-muted-foreground" />}
                  {row.name}
                  {row.isPrimary && <FileKey size={12} className="text-yellow-500 ml-1" />}
              </div>
          )
      },
      {
          id: 'type',
          header: 'Data Type',
          accessorKey: 'type',
          width: '16%',
          minWidth: 150,
          editable: true,
          type: 'select',
          options: ['text', 'number', 'email', 'select', 'status', 'date', 'boolean'],
          renderCell: (row) => (
             <Badge variant="outline" className="font-normal text-[10px] text-muted-foreground bg-muted/40">
                 {row.type}
             </Badge>
          )
      },
      {
          id: 'defaultValue',
          header: 'Default Value',
          accessorKey: 'defaultValue',
          width: '16%',
          minWidth: 120,
          editable: true,
          renderCell: (row) => <span className="text-muted-foreground font-mono">{row.defaultValue}</span>
      },
      {
          id: 'isPrimary',
          header: <div className="text-center w-full">Primary</div>,
          accessorKey: 'isPrimary',
          width: 80,
          renderCell: (row) => (
              <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={row.isPrimary} 
                    onCheckedChange={(checked) => handleSchemaChange(row.id, 'isPrimary', !!checked)} 
                  />
              </div>
          )
      },
      {
          id: 'isNullable',
          header: <div className="text-center w-full">Nullable</div>,
          accessorKey: 'isNullable',
          width: 80,
          renderCell: (row) => (
              <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                  <Switch 
                    checked={row.isNullable} 
                    onCheckedChange={(checked) => handleSchemaChange(row.id, 'isNullable', checked)}
                  />
              </div>
          )
      },
      {
          id: 'description',
          header: 'Description',
          accessorKey: 'description',
          flex: true,
          editable: true,
          renderCell: (row) => <span className="text-muted-foreground italic">{row.description || (row.isPrimary ? 'Unique identifier' : 'No description')}</span>
      }
  ];

  // 2. Data View Columns (Generated from Schema)
  const dataColumns: ColumnDef<any>[] = schema.map(field => ({
      id: field.id,
      header: (
          <div className="flex items-center gap-2">
             {field.icon && <field.icon size={13} className="text-muted-foreground" />}
             {field.name}
          </div>
      ),
      accessorKey: field.id,
      width: field.flex ? undefined : field.width,
      flex: field.flex,
      minWidth: 100,
      editable: field.id !== 'id' && field.id !== 'created', // ID and Created read-only (generic rule assumption)
      renderCell: (row, value) => {
          if (field.type === 'status') {
               const variant = value === 'Active' || value === 'Completed' ? 'default' :
                               value === 'Inactive' || value === 'Damage' ? 'destructive' : 'secondary';
               // If it is secondary (gray), make sure text is readable in dark mode
               const className = variant === 'secondary' ? "text-foreground bg-muted" : "";
               return (
                   <Badge variant={variant} className={`text-[10px] h-5 px-1.5 font-normal ${className}`}>
                        {value}
                    </Badge>
               );
          }
          if (field.type === 'select' && field.id === 'role') {
              return (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal bg-muted/30 text-foreground">
                    {value}
                  </Badge>
              );
          }
          return <span className="truncate text-foreground">{value}</span>;
      }
  }));

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* View Mode Toggle / Header Extension */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20">
          <div className="flex bg-muted/50 p-1 rounded-md">
              <Button 
                variant={viewMode === 'MODEL' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('MODEL')}
                className="h-7 text-xs gap-2"
              >
                  <Database size={14} /> Model
              </Button>
              <Button 
                variant={viewMode === 'DATA' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('DATA')}
                className="h-7 text-xs gap-2"
              >
                  <TableIcon size={14} /> Data
              </Button>
          </div>
      </div>
    
      {viewMode === 'MODEL' ? (
          <DataGrid<SchemaField>
            title={`${activeTableId} (Model)`}
            columns={modelColumns}
            data={schema}
            onAdd={handleSchemaAdd}
            onEdit={handleSchemaChange}
            onDelete={handleSchemaDelete}
            keyField="id"
          />
      ) : (
          <DataGrid<any>
            title={`${activeTableId} (Data)`}
            columns={dataColumns}
            data={records}
            onAdd={handleDataAdd}
            onEdit={handleDataChange}
            onDelete={handleDataDelete}
            keyField="id"
          />
      )}
    </div>
  );
};

export default DataPage;