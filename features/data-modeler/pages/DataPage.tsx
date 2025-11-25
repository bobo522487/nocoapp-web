
import React, { useState, useEffect } from 'react';
import DataGrid from '../../../components/DataGrid';
import { ColumnDef } from '../../../components/DataTable';
import { useAppStore } from '../../../store/useAppStore';
import { SchemaField, DbTable } from '../../../types';
import { FileKey, Type, Mail, CheckCircle2, Calendar, DollarSign, Package, ShoppingCart, ArrowUpDown, Database, TableIcon, Plus, Hash, Braces, ToggleLeft } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Switch } from "../../../components/ui/switch";
import { Checkbox } from "../../../components/ui/checkbox";
import ForeignKeyDrawer, { ForeignKeyConfig } from '../components/ForeignKeyDrawer';

// --- Configuration ---
const TYPE_CONFIG: Record<string, { pk: boolean; fk: boolean; unique: boolean; notNull: boolean }> = {
    'serial':          { pk: true,  fk: false, unique: true,  notNull: true },
    'varchar':         { pk: true,  fk: true,  unique: true,  notNull: true },
    'int':             { pk: true,  fk: true,  unique: true,  notNull: true },
    'bigint':          { pk: true,  fk: true,  unique: true,  notNull: true },
    'float':           { pk: true,  fk: true,  unique: true,  notNull: true },
    'boolean':         { pk: false, fk: false, unique: false, notNull: true },
    'date with time':  { pk: false, fk: false, unique: false, notNull: true },
    'jsonb':           { pk: false, fk: false, unique: false, notNull: true },
};

const DATA_TYPES = Object.keys(TYPE_CONFIG);

// --- Mock Data Store ---
const MOCK_DB: Record<string, { schema: SchemaField[], records: any[] }> = {
    'users': {
        schema: [
            { id: 'id', name: 'ID', type: 'serial', width: 60, icon: FileKey, isPrimary: true, isUnique: true, isNullable: false, defaultValue: 'auto-inc' },
            { id: 'name', name: 'Name', type: 'varchar', width: 200, icon: Type, isPrimary: false, isUnique: false, isNullable: false, defaultValue: '', flex: true },
            { id: 'email', name: 'Email', type: 'varchar', width: 250, icon: Mail, isPrimary: false, isUnique: true, isNullable: true, defaultValue: 'null', flex: true },
            { id: 'role', name: 'Role', type: 'varchar', width: 140, icon: CheckCircle2, isPrimary: false, isUnique: false, isNullable: false, defaultValue: 'Viewer' },
            { id: 'status', name: 'Status', type: 'varchar', width: 120, icon: CheckCircle2, isPrimary: false, isUnique: false, isNullable: false, defaultValue: 'Active' },
            { id: 'created', name: 'Created At', type: 'date with time', width: 180, icon: Calendar, isPrimary: false, isUnique: false, isNullable: false, defaultValue: 'now()' },
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
            { id: 'id', name: 'Order ID', type: 'serial', width: 80, icon: FileKey, isPrimary: true, isUnique: true, isNullable: false, defaultValue: 'auto-inc' },
            { id: 'customer', name: 'Customer', type: 'varchar', width: 200, icon: Type, isPrimary: false, isUnique: false, isNullable: false, defaultValue: '', flex: true },
            { id: 'amount', name: 'Amount', type: 'float', width: 120, icon: DollarSign, isPrimary: false, isUnique: false, isNullable: false, defaultValue: '0.00' },
            { id: 'status', name: 'Status', type: 'varchar', width: 120, icon: CheckCircle2, isPrimary: false, isUnique: false, isNullable: false, defaultValue: 'Pending' },
            { id: 'date', name: 'Order Date', type: 'date with time', width: 160, icon: Calendar, isPrimary: false, isUnique: false, isNullable: false, defaultValue: 'now()' },
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
            { id: 'id', name: 'SKU', type: 'serial', width: 80, icon: FileKey, isPrimary: true, isUnique: true, isNullable: false, defaultValue: 'auto-inc' },
            { id: 'name', name: 'Product Name', type: 'varchar', width: 250, icon: Package, isPrimary: false, isUnique: true, isNullable: false, defaultValue: '', flex: true },
            { id: 'category', name: 'Category', type: 'varchar', width: 150, icon: CheckCircle2, isPrimary: false, isUnique: false, isNullable: false, defaultValue: 'General' },
            { id: 'price', name: 'Price', type: 'float', width: 100, icon: DollarSign, isPrimary: false, isUnique: false, isNullable: false, defaultValue: '0.00' },
            { id: 'stock', name: 'Stock', type: 'int', width: 100, icon: ShoppingCart, isPrimary: false, isUnique: false, isNullable: false, defaultValue: '0' },
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
            { id: 'id', name: 'Log ID', type: 'serial', width: 80, icon: FileKey, isPrimary: true, isUnique: true, isNullable: false, defaultValue: 'auto-inc' },
            { id: 'product', name: 'Product SKU', type: 'varchar', width: 150, icon: Package, isPrimary: false, isUnique: false, isNullable: false, defaultValue: '' },
            { id: 'change', name: 'Quantity Change', type: 'int', width: 150, icon: ArrowUpDown, isPrimary: false, isUnique: false, isNullable: false, defaultValue: '0' },
            { id: 'reason', name: 'Reason', type: 'varchar', width: 150, icon: Type, isPrimary: false, isUnique: false, isNullable: false, defaultValue: 'Restock', flex: true },
            { id: 'timestamp', name: 'Timestamp', type: 'date with time', width: 180, icon: Calendar, isPrimary: false, isUnique: false, isNullable: false, defaultValue: 'now()' },
        ],
        records: [
            { id: 1, product: 'SKU-501', change: '+50', reason: 'Restock', timestamp: '2023-11-01 10:00 AM' },
            { id: 2, product: 'SKU-503', change: '-2', reason: 'Sale', timestamp: '2023-11-01 11:30 AM' },
            { id: 3, product: 'SKU-502', change: '-5', reason: 'Damage', timestamp: '2023-11-02 09:15 AM' },
        ]
    }
}

const DataPage: React.FC = () => {
  const { activeTableId, tables } = useAppStore();
  const [viewMode, setViewMode] = useState<'MODEL' | 'DATA'>('MODEL');
  
  // Use state to manage the data locally since MOCK_DB is just the initial state
  const [schema, setSchema] = useState<SchemaField[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  // Foreign Key Drawer State
  const [isForeignKeyDrawerOpen, setIsForeignKeyDrawerOpen] = useState(false);
  const [currentForeignKeyField, setCurrentForeignKeyField] = useState<SchemaField | null>(null);

  useEffect(() => {
    // Load data based on activeTableId
    const data = MOCK_DB[activeTableId] || MOCK_DB['users'];
    
    // Fallback if table ID doesn't match mock keys (e.g. new table)
    if (!data) {
        setSchema([]);
        setRecords([]);
    } else {
        setSchema(data.schema);
        setRecords(data.records);
    }
    
    // Reset view mode on table switch
    setViewMode('MODEL');
    setIsForeignKeyDrawerOpen(false);
  }, [activeTableId]);

  // --- Handlers for DataGrid Actions ---

  const handleSchemaChange = (rowId: string | number, colId: string, value: any) => {
      setSchema(prev => prev.map(field => {
          if (field.id === rowId) {
              const updated = { ...field, [colId]: value };
              
              // If type changed, validate constraints
              if (colId === 'type') {
                  const config = TYPE_CONFIG[value as string];
                  if (!config.pk && updated.isPrimary) updated.isPrimary = false;
                  if (!config.unique && updated.isUnique) updated.isUnique = false;
                  if (!config.fk && updated.isForeignKey) updated.isForeignKey = false;
                  
                  // Update icon based on type
                  switch(value) {
                    case 'serial': updated.icon = FileKey; break;
                    case 'varchar': updated.icon = Type; break;
                    case 'int': updated.icon = Hash; break;
                    case 'bigint': updated.icon = Hash; break;
                    case 'float': updated.icon = DollarSign; break;
                    case 'boolean': updated.icon = ToggleLeft; break;
                    case 'date with time': updated.icon = Calendar; break;
                    case 'jsonb': updated.icon = Braces; break;
                    default: updated.icon = Type;
                  }
              }

              // Trigger Drawer if Foreign Key is enabled
              if (colId === 'isForeignKey' && value === true) {
                  setCurrentForeignKeyField(updated);
                  setIsForeignKeyDrawerOpen(true);
              }

              return updated;
          }
          return field;
      }));
  };

  const handleOpenRelationDrawer = (field: SchemaField) => {
      setCurrentForeignKeyField(field);
      setIsForeignKeyDrawerOpen(true);
  };

  const handleFKDrawerSave = (config: ForeignKeyConfig) => {
      // Update the schema to reflect the FK setting
      // In a real app, we would store the targetTableId etc.
      if (currentForeignKeyField) {
          setSchema(prev => prev.map(f => f.id === currentForeignKeyField.id ? { ...f, isForeignKey: true } : f));
      }
      setIsForeignKeyDrawerOpen(false);
      setCurrentForeignKeyField(null);
  };

  const handleFKDrawerDelete = () => {
      if (currentForeignKeyField) {
          setSchema(prev => prev.map(f => f.id === currentForeignKeyField.id ? { ...f, isForeignKey: false } : f));
      }
      setIsForeignKeyDrawerOpen(false);
      setCurrentForeignKeyField(null);
  };

  const getTargetColumns = (tableId: string) => {
      // Since MOCK_DB is local here but we need it for dropdowns, we access it directly
      const tableData = MOCK_DB[tableId];
      if (!tableData) return [];
      return tableData.schema.map(f => ({ id: f.id, name: f.name }));
  };

  const handleSchemaAdd = () => {
      const newField: SchemaField = {
          id: `col_${Date.now()}`,
          name: 'New Column',
          type: 'varchar',
          defaultValue: '',
          isPrimary: false,
          isForeignKey: false,
          isUnique: false,
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
          width: '20%',
          minWidth: 180,
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
          width: '12%',
          minWidth: 120,
          editable: true,
          type: 'select',
          options: DATA_TYPES,
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
          width: '12%',
          minWidth: 100,
          editable: true,
          renderCell: (row) => <span className="text-muted-foreground font-mono">{row.defaultValue}</span>
      },
      {
          id: 'isForeignKey',
          header: <div className="text-center w-full text-[10px] font-semibold text-muted-foreground uppercase">Foreign Key</div>,
          accessorKey: 'isForeignKey',
          width: 120,
          renderCell: (row) => (
              <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                  <Switch 
                    checked={!!row.isForeignKey} 
                    onCheckedChange={(checked) => handleSchemaChange(row.id, 'isForeignKey', checked)}
                    className="scale-75"
                    disabled={!TYPE_CONFIG[row.type].fk}
                  />
              </div>
          )
      },
      {
          id: 'isPrimary',
          header: <div className="text-center w-full text-[10px] font-semibold text-muted-foreground uppercase">Primary</div>,
          accessorKey: 'isPrimary',
          width: 70,
          renderCell: (row) => (
              <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={row.isPrimary} 
                    onCheckedChange={(checked) => handleSchemaChange(row.id, 'isPrimary', !!checked)}
                    disabled={!TYPE_CONFIG[row.type].pk}
                  />
              </div>
          )
      },
      {
          id: 'isUnique',
          header: <div className="text-center w-full text-[10px] font-semibold text-muted-foreground uppercase">Unique</div>,
          accessorKey: 'isUnique',
          width: 70,
          renderCell: (row) => (
              <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                  <Switch 
                    checked={row.isUnique} 
                    onCheckedChange={(checked) => handleSchemaChange(row.id, 'isUnique', checked)} 
                    className="scale-75"
                    disabled={!TYPE_CONFIG[row.type].unique}
                  />
              </div>
          )
      },
      {
          id: 'isNullable',
          header: <div className="text-center w-full text-[10px] font-semibold text-muted-foreground uppercase">Nullable</div>,
          accessorKey: 'isNullable',
          width: 70,
          renderCell: (row) => (
              <div className="flex justify-center w-full" onClick={(e) => e.stopPropagation()}>
                  <Switch 
                    checked={row.isNullable} 
                    onCheckedChange={(checked) => handleSchemaChange(row.id, 'isNullable', checked)}
                    className="scale-75"
                    disabled={!TYPE_CONFIG[row.type].notNull}
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
          renderCell: (row) => <span className="text-muted-foreground italic truncate">{row.description || (row.isPrimary ? 'Unique identifier' : 'No description')}</span>
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
      type: (field.type === 'int' || field.type === 'float' || field.type === 'bigint' || field.type === 'serial') ? 'number' : 'text',
      editable: field.id !== 'id' && field.id !== 'created', // ID and Created read-only (generic rule assumption)
      renderCell: (row, value) => {
          if (field.id === 'status') {
               const variant = value === 'Active' || value === 'Completed' ? 'default' :
                               value === 'Inactive' || value === 'Damage' ? 'destructive' : 'secondary';
               const className = variant === 'secondary' ? "text-foreground bg-muted" : "";
               return (
                   <Badge variant={variant} className={`text-[10px] h-5 px-1.5 font-normal ${className}`}>
                        {value}
                    </Badge>
               );
          }
          if (field.id === 'role') {
              return (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal bg-muted/30 text-foreground">
                    {value}
                  </Badge>
              );
          }
          return <span className="truncate text-foreground">{value}</span>;
      }
  }));

  const currentTable = tables.find(t => t.id === activeTableId);
  const title = currentTable ? currentTable.name : activeTableId;

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background relative min-w-0">
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
            title={`${title} (Model)`}
            columns={modelColumns}
            data={schema}
            onAdd={handleSchemaAdd}
            onEdit={handleSchemaChange}
            onDelete={handleSchemaDelete}
            keyField="id"
          />
      ) : (
          <DataGrid<any>
            title={`${title} (Data)`}
            columns={dataColumns}
            data={records}
            onAdd={handleDataAdd}
            onEdit={handleDataChange}
            onDelete={handleDataDelete}
            keyField="id"
          />
      )}

      {currentForeignKeyField && (
        <ForeignKeyDrawer
            isOpen={isForeignKeyDrawerOpen}
            onClose={() => setIsForeignKeyDrawerOpen(false)}
            sourceTableName={activeTableId}
            sourceColumnName={currentForeignKeyField.name}
            tables={tables} // Pass tables from store
            getTargetColumns={getTargetColumns} // Function to resolve columns for selected table
            onSave={handleFKDrawerSave}
            onDelete={handleFKDrawerDelete}
        />
      )}
    </div>
  );
};

export default DataPage;
