import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, ArrowUpDown, Table as TableIcon, Database, CheckCircle2, Calendar, Type, Mail, FileKey, Trash2, CheckSquare, ChevronLeft, ChevronRight, Columns, EyeOff, ArrowUpAZ, ArrowDownAZ, ListFilter, X, ChevronDown, DollarSign, Package, ShoppingCart } from 'lucide-react';
import DataTable, { ColumnDef } from '../components/DataTable';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";

// Types for our Data Grid
interface SchemaField {
    id: string;
    name: string;
    type: 'text' | 'number' | 'email' | 'select' | 'status' | 'date' | 'boolean';
    defaultValue: string;
    isPrimary: boolean;
    isNullable: boolean;
    description?: string;
    flex?: boolean;
    width?: number;
    icon?: any;
}

interface FilterRule {
  id: string;
  fieldId: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith';
  value: string;
}

interface SortRule {
  fieldId: string;
  direction: 'asc' | 'desc';
}

interface DataPageProps {
  tableName?: string;
}

// --- Internal Portal Component for Dropdowns ---
interface ToolbarPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  width?: number;
  className?: string;
  placement?: 'bottom-start' | 'top-start';
}

const ToolbarPopover: React.FC<ToolbarPopoverProps> = ({ isOpen, onClose, triggerRef, children, width = 240, className = "", placement = 'bottom-start' }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      
      if (placement === 'top-start') {
          setStyle({
              bottom: window.innerHeight - rect.top + 4,
              left: rect.left,
              width: width,
              maxHeight: '400px'
          });
      } else {
          setStyle({
              top: rect.bottom + 4,
              left: rect.left,
              width: width,
              maxHeight: '400px'
          });
      }
    }
  }, [isOpen, triggerRef, placement, width]);

  useEffect(() => {
    const handleScroll = () => { if (isOpen) onClose(); };
    const handleResize = () => { if (isOpen) onClose(); };
    
    if (isOpen) {
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
    }
    return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[40]" onClick={onClose} />
      <div 
        className={`fixed z-[50] bg-popover text-popover-foreground border border-border rounded-lg shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-100 ${className}`}
        style={style}
      >
        {children}
      </div>
    </>,
    document.body
  );
};

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

const DataPage: React.FC<DataPageProps> = ({ tableName = 'users' }) => {
  const [viewMode, setViewMode] = useState<'MODEL' | 'DATA'>('DATA');
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  
  // Menu States
  const [showFieldsMenu, setShowFieldsMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showPageSizeMenu, setShowPageSizeMenu] = useState(false);

  const [hiddenFields, setHiddenFields] = useState<string[]>([]);
  
  // Filter & Sort State
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [sort, setSort] = useState<SortRule | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Refs
  const fieldsBtnRef = useRef<HTMLButtonElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const pageSizeBtnRef = useRef<HTMLDivElement>(null);

  // Initialize with users data first, then effect will update
  const [schema, setSchema] = useState<SchemaField[]>(MOCK_DB['users'].schema);
  const [records, setRecords] = useState<any[]>(MOCK_DB['users'].records);

  // --- Effect: Load Data on Table Change ---
  useEffect(() => {
      const data = MOCK_DB[tableName] || MOCK_DB['users'];
      setSchema(data.schema);
      setRecords(data.records);
      setSelectedIds([]);
      setFilters([]);
      setSort(null);
      setCurrentPage(1);
  }, [tableName]);

  useEffect(() => {
    // Clear selection when view changes
    setSelectedIds([]);
  }, [viewMode]);

  // --- Processing Data (Filter & Sort) ---
  const processedRecords = useMemo(() => {
    let result = [...records];

    // 1. Filter
    if (filters.length > 0) {
        result = result.filter(record => {
            return filters.every(filter => {
                const val = String(record[filter.fieldId] || '').toLowerCase();
                const filterVal = filter.value.toLowerCase();
                
                switch (filter.operator) {
                    case 'contains': return val.includes(filterVal);
                    case 'equals': return val === filterVal;
                    case 'startsWith': return val.startsWith(filterVal);
                    case 'endsWith': return val.endsWith(filterVal);
                    default: return true;
                }
            });
        });
    }

    // 2. Sort
    if (sort) {
        result.sort((a, b) => {
            const valA = a[sort.fieldId];
            const valB = b[sort.fieldId];
            
            if (valA === valB) return 0;
            
            const comparison = valA > valB ? 1 : -1;
            return sort.direction === 'asc' ? comparison : -comparison;
        });
    }

    return result;
  }, [records, filters, sort]);

  // Reset pagination when filters/view change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, viewMode, sort]);

  // --- Pagination Logic ---
  const totalRecords = viewMode === 'MODEL' ? schema.length : processedRecords.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const displayedData = useMemo(() => {
      const dataToSlice = viewMode === 'MODEL' ? schema : processedRecords;
      return dataToSlice.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [viewMode, schema, processedRecords, currentPage, pageSize]);


  // --- Handlers ---
  const handleSchemaEdit = (rowId: string | number, colId: string, value: any) => {
      setSchema(prev => prev.map(field => 
          field.id === rowId ? { ...field, [colId]: value } : field
      ));
  };

  const handleAddColumn = () => {
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

  const handleRecordEdit = (rowId: string | number, colId: string, value: any) => {
      setRecords(prev => prev.map(record => 
          record.id === rowId ? { ...record, [colId]: value } : record
      ));
  };

  const handleAddRecord = () => {
      const newId = Math.max(...records.map(r => r.id), 0) + 1;
      const newRecord: any = { id: newId };
      schema.forEach(field => {
          if (field.id !== 'id') {
              newRecord[field.id] = '';
          }
      });
      setRecords([...records, newRecord]);
  };
  
  const handleBulkDelete = () => {
      const count = selectedIds.length;
      if (count === 0) return;

      const itemType = viewMode === 'MODEL' ? (count > 1 ? 'Columns' : 'Column') : (count > 1 ? 'Rows' : 'Row');
      
      if (window.confirm(`Are you sure you want to delete ${count} ${itemType}?`)) {
          if (viewMode === 'MODEL') {
              setSchema(prev => prev.filter(col => !selectedIds.includes(col.id)));
          } else {
              setRecords(prev => prev.filter(rec => !selectedIds.includes(rec.id)));
          }
          setSelectedIds([]);
      }
  };

  const toggleFieldVisibility = (fieldId: string) => {
    setHiddenFields(prev => 
        prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId) 
        : [...prev, fieldId]
    );
  };

  // Filter Actions
  const addFilter = () => {
      const firstField = schema[0]?.id || 'id';
      setFilters([...filters, { id: `f_${Date.now()}`, fieldId: firstField, operator: 'contains', value: '' }]);
  };

  const updateFilter = (id: string, updates: Partial<FilterRule>) => {
      setFilters(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFilter = (id: string) => {
      setFilters(prev => prev.filter(f => f.id !== id));
  };

  // --- Column Definitions for DataTable ---

  // 1. Model Definition Columns (Metaschema)
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
              <div className="flex justify-center w-full cursor-pointer" onClick={() => handleSchemaEdit(row.id, 'isPrimary', !row.isPrimary)}>
                  {row.isPrimary ? <CheckCircle2 size={16} className="text-blue-500" /> : <div className="w-4 h-4 rounded-full border border-input"></div>}
              </div>
          )
      },
      {
          id: 'isNullable',
          header: <div className="text-center w-full">Nullable</div>,
          accessorKey: 'isNullable',
          width: 80,
          renderCell: (row) => (
              <div className="flex justify-center w-full">
                  <div 
                    className={`w-8 h-4 rounded-full p-0.5 flex items-center cursor-pointer transition-colors ${row.isNullable ? 'bg-primary' : 'bg-muted'}`}
                    onClick={() => handleSchemaEdit(row.id, 'isNullable', !row.isNullable)}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${row.isNullable ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
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

  // 2. Data View Columns (Based on Schema)
  const dataColumns: ColumnDef<any>[] = schema
    .filter(field => !hiddenFields.includes(field.id))
    .map(field => ({
      id: field.id,
      header: (
          <div className="flex items-center gap-2">
             {field.icon && <field.icon size={13} className="text-muted-foreground" />}
             {field.name}
             {sort?.fieldId === field.id && (
                 <span className="text-primary">
                     {sort.direction === 'asc' ? <ArrowUpAZ size={12}/> : <ArrowDownAZ size={12}/>}
                 </span>
             )}
          </div>
      ),
      accessorKey: field.id,
      width: field.flex ? undefined : field.width,
      flex: field.flex,
      minWidth: 100,
      editable: field.id !== 'id' && field.id !== 'created', // ID and Created read-only
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
    <div className="flex-1 flex flex-col bg-background h-full min-w-0 overflow-hidden font-sans text-sm transition-colors">
      {/* Top Toolbar */}
      <div className="relative h-12 border-b border-border flex items-center px-4 bg-background shrink-0 z-10 transition-colors">
        
        {/* Absolute Center - View Mode Toggle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
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

        {/* Right Side - Search */}
        {viewMode === 'DATA' && (
            <div className="ml-auto relative group hidden lg:block z-20">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input type="text" placeholder="Search records..." className="pl-8 h-8 w-48 text-xs bg-muted/20" />
            </div>
        )}
      </div>

      {/* Secondary Toolbar - Contextual */}
      {selectedIds.length > 0 ? (
           <div className="h-10 border-b border-border bg-red-50 dark:bg-red-900/20 flex items-center px-4 justify-between shrink-0 transition-colors animate-in slide-in-from-top-2 duration-200">
               <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 font-medium">
                   <div className="w-5 h-5 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center text-xs font-bold">
                       {selectedIds.length}
                   </div>
                   <span>Selected</span>
               </div>
               
               <Button 
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="h-7 gap-1.5 text-xs"
               >
                   <Trash2 size={14} />
                   Delete {selectedIds.length > 1 ? (viewMode === 'MODEL' ? 'Columns' : 'Rows') : (viewMode === 'MODEL' ? 'Column' : 'Row')}
               </Button>
           </div>
      ) : (
          <div className="h-10 border-b border-border bg-muted/20 flex items-center px-4 gap-2 shrink-0 overflow-visible transition-colors z-0">
            {/* Table Name Indicator */}
            <div className="flex items-center gap-2 mr-4 text-xs font-semibold text-foreground bg-muted px-2 py-1 rounded">
                <TableIcon size={12} />
                <span className="capitalize">{tableName}</span>
            </div>

            <Button 
                size="sm"
                onClick={viewMode === 'MODEL' ? handleAddColumn : handleAddRecord}
                className="h-7 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700"
            >
                <Plus size={14} strokeWidth={2.5} /> {viewMode === 'MODEL' ? 'Add Column' : 'Add Row'}
            </Button>

            <div className="w-px h-4 bg-border mx-1"></div>

            {viewMode === 'DATA' && (
            <>
                {/* Filter Button */}
                <Button 
                    ref={filterBtnRef}
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    variant={showFilterMenu || filters.length > 0 ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                >
                    <ListFilter size={14} /> 
                    Filter 
                    {filters.length > 0 && <span className="bg-primary text-primary-foreground text-[9px] px-1 rounded-full">{filters.length}</span>}
                </Button>
                
                <ToolbarPopover 
                    isOpen={showFilterMenu} 
                    onClose={() => setShowFilterMenu(false)} 
                    triggerRef={filterBtnRef} 
                    width={320}
                >
                    <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Filters</span>
                            {filters.length > 0 && (
                                <button onClick={() => setFilters([])} className="text-[10px] text-primary hover:underline">Clear all</button>
                            )}
                        </div>
                        
                        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                            {filters.length === 0 ? (
                                <div className="text-xs text-muted-foreground italic py-2 text-center">No active filters</div>
                            ) : (
                                filters.map((filter) => (
                                    <div key={filter.id} className="flex items-center gap-2 text-xs">
                                        <select 
                                            value={filter.fieldId}
                                            onChange={(e) => updateFilter(filter.id, { fieldId: e.target.value })}
                                            className="bg-muted border border-border rounded px-2 py-1 outline-none w-24 text-foreground"
                                        >
                                            {schema.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                        <select 
                                            value={filter.operator}
                                            onChange={(e) => updateFilter(filter.id, { operator: e.target.value as any })}
                                            className="bg-muted border border-border rounded px-2 py-1 outline-none w-24 text-foreground"
                                        >
                                            <option value="contains">contains</option>
                                            <option value="equals">equals</option>
                                            <option value="startsWith">starts with</option>
                                            <option value="endsWith">ends with</option>
                                        </select>
                                        <Input 
                                            type="text" 
                                            value={filter.value}
                                            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                                            className="flex-1 h-7 min-w-0"
                                            placeholder="Value"
                                        />
                                        <button onClick={() => removeFilter(filter.id)} className="text-muted-foreground hover:text-destructive">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <Button 
                            variant="ghost"
                            size="sm"
                            onClick={addFilter}
                            className="h-7 gap-1 text-xs text-primary hover:text-primary"
                        >
                            <Plus size={12} /> Add filter
                        </Button>
                    </div>
                </ToolbarPopover>

                {/* Sort Button */}
                <Button 
                    ref={sortBtnRef}
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    variant={showSortMenu || sort ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                >
                    <ArrowUpDown size={14} /> 
                    Sort
                    {sort && <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>}
                </Button>

                <ToolbarPopover 
                    isOpen={showSortMenu} 
                    onClose={() => setShowSortMenu(false)} 
                    triggerRef={sortBtnRef} 
                    width={200}
                >
                    <div className="p-1 flex flex-col">
                        <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase">Sort by</div>
                        {schema.map(field => (
                            <div 
                                key={field.id}
                                onClick={() => {
                                    if (sort?.fieldId === field.id) {
                                        setSort(sort.direction === 'asc' ? { ...sort, direction: 'desc' } : null);
                                    } else {
                                        setSort({ fieldId: field.id, direction: 'asc' });
                                    }
                                }}
                                className={`flex items-center justify-between px-2 py-1.5 hover:bg-muted rounded cursor-pointer text-xs transition-colors ${sort?.fieldId === field.id ? 'text-primary font-medium' : 'text-foreground'}`}
                            >
                                <div className="flex items-center gap-2">
                                    {field.icon && <field.icon size={13} className={sort?.fieldId === field.id ? "text-primary" : "text-muted-foreground"} />}
                                    <span>{field.name}</span>
                                </div>
                                {sort?.fieldId === field.id && (
                                    sort.direction === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />
                                )}
                            </div>
                        ))}
                        {sort && (
                            <div className="border-t border-border mt-1 pt-1">
                                <div 
                                    onClick={() => setSort(null)}
                                    className="px-2 py-1.5 hover:bg-muted rounded cursor-pointer text-xs text-muted-foreground text-center"
                                >
                                    Clear Sort
                                </div>
                            </div>
                        )}
                    </div>
                </ToolbarPopover>
                
                {/* Fields Button */}
                <div className="relative">
                <Button 
                    ref={fieldsBtnRef}
                    onClick={() => setShowFieldsMenu(!showFieldsMenu)}
                    variant={showFieldsMenu ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                >
                    <Columns size={14} /> 
                    Fields
                </Button>
                <ToolbarPopover isOpen={showFieldsMenu} onClose={() => setShowFieldsMenu(false)} triggerRef={fieldsBtnRef} width={200}>
                    <div className="p-1 flex flex-col">
                        <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase">Visible Fields</div>
                        {schema.map(field => (
                            <div 
                                key={field.id}
                                onClick={() => toggleFieldVisibility(field.id)}
                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded cursor-pointer text-xs transition-colors"
                            >
                                {hiddenFields.includes(field.id) ? (
                                    <div className="w-4 h-4 border border-input rounded flex items-center justify-center"></div>
                                ) : (
                                    <div className="w-4 h-4 bg-primary rounded flex items-center justify-center text-primary-foreground">
                                        <CheckSquare size={10} />
                                    </div>
                                )}
                                <span className={hiddenFields.includes(field.id) ? 'text-muted-foreground line-through' : 'text-foreground'}>{field.name}</span>
                                {hiddenFields.includes(field.id) && <EyeOff size={12} className="ml-auto text-muted-foreground" />}
                            </div>
                        ))}
                    </div>
                </ToolbarPopover>
                </div>
            </>
            )}
          </div>
      )}

      <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#333] scrollbar-track-transparent">
        <DataTable
            data={displayedData}
            columns={viewMode === 'MODEL' ? modelColumns : dataColumns}
            onCellEdit={viewMode === 'MODEL' ? handleSchemaEdit : handleRecordEdit}
            keyField="id"
            rowClassName="h-10"
            enableSelection={true}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
        />
      </div>

      {/* Footer / Pagination */}
      <div className="h-10 border-t border-border bg-muted/20 flex items-center justify-between px-4 shrink-0 transition-colors text-xs text-muted-foreground">
        
        {/* Left: Keyboard Hints (Visual only) */}
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                 <div className="flex gap-1">
                     <div className="w-5 h-5 bg-background border border-border rounded flex items-center justify-center shadow-sm">
                        <ChevronLeft size={10} />
                     </div>
                     <div className="w-5 h-5 bg-background border border-border rounded flex items-center justify-center shadow-sm">
                        <ChevronRight size={10} />
                     </div>
                 </div>
                 <span>Navigate</span>
             </div>
        </div>

        {/* Center: Pagination Controls */}
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
             <Button 
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
             >
                 <ChevronLeft size={14} />
             </Button>
             
             <div className="flex items-center gap-1 font-medium text-foreground">
                 <Input 
                    type="text" 
                    value={currentPage}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= totalPages) setCurrentPage(val);
                    }}
                    className="h-6 w-8 text-center px-0 text-xs"
                 />
                 <span className="text-muted-foreground">/ {totalPages}</span>
             </div>

             <Button 
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
             >
                 <ChevronRight size={14} />
             </Button>
        </div>

        {/* Right: Record Count & Page Size */}
        <div className="flex items-center gap-4">
            <span>{startRecord} - {endRecord} of {totalRecords} Records</span>
            
            <div className="relative">
                <div 
                    ref={pageSizeBtnRef}
                    onClick={() => setShowPageSizeMenu(!showPageSizeMenu)}
                    className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
                >
                    <span>{pageSize} records</span>
                    <ChevronDown size={12} />
                </div>
                
                <ToolbarPopover
                    isOpen={showPageSizeMenu}
                    onClose={() => setShowPageSizeMenu(false)}
                    triggerRef={pageSizeBtnRef}
                    width={120}
                    placement="top-start"
                >
                    <div className="p-1">
                        {[10, 25, 50, 100].map(size => (
                            <div 
                                key={size}
                                onClick={() => {
                                    setPageSize(size);
                                    setCurrentPage(1);
                                    setShowPageSizeMenu(false);
                                }}
                                className={`px-2 py-1.5 rounded cursor-pointer text-xs hover:bg-muted flex justify-between items-center ${pageSize === size ? 'text-primary font-medium' : 'text-foreground'}`}
                            >
                                <span>{size} records</span>
                                {pageSize === size && <CheckSquare size={10} />}
                            </div>
                        ))}
                    </div>
                </ToolbarPopover>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DataPage;