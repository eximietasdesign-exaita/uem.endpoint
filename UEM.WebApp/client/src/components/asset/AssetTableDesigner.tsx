import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Table,
  Columns,
  Plus,
  Trash2,
  Edit,
  Save,
  Eye,
  ArrowUp,
  ArrowDown,
  Settings
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface TableView {
  id: string;
  name: string;
  description: string;
  columns: string[];
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isDefault: boolean;
  permissions: string[];
}

interface AssetField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'currency';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  category: 'basic' | 'location' | 'business' | 'technical' | 'financial' | 'compliance';
}

interface AssetTableDesignerProps {
  tableViews: TableView[];
  customFields: AssetField[];
}

export function AssetTableDesigner({ tableViews, customFields }: AssetTableDesignerProps) {
  const [selectedView, setSelectedView] = useState<TableView | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewName, setViewName] = useState('');
  const [viewDescription, setViewDescription] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isDefault, setIsDefault] = useState(false);
  const [permissions, setPermissions] = useState<string[]>(['read']);

  // Available columns combining standard fields and custom fields
  const availableColumns = [
    // Standard Asset Fields
    { id: 'name', label: 'Asset Name', category: 'basic' },
    { id: 'ipAddress', label: 'IP Address', category: 'basic' },
    { id: 'macAddress', label: 'MAC Address', category: 'basic' },
    { id: 'osType', label: 'OS Type', category: 'technical' },
    { id: 'osVersion', label: 'OS Version', category: 'technical' },
    { id: 'status', label: 'Status', category: 'basic' },
    { id: 'criticality', label: 'Criticality', category: 'business' },
    { id: 'location', label: 'Location', category: 'location' },
    { id: 'businessUnit', label: 'Business Unit', category: 'business' },
    { id: 'project', label: 'Project', category: 'business' },
    { id: 'reportingManager', label: 'Reporting Manager', category: 'business' },
    { id: 'category', label: 'Category', category: 'basic' },
    { id: 'discoveryMethod', label: 'Discovery Method', category: 'technical' },
    { id: 'lastSeen', label: 'Last Seen', category: 'technical' },
    { id: 'vulnerabilities', label: 'Vulnerabilities', category: 'compliance' },
    { id: 'complianceScore', label: 'Compliance Score', category: 'compliance' },
    { id: 'assetValue', label: 'Asset Value', category: 'financial' },
    { id: 'purchaseDate', label: 'Purchase Date', category: 'financial' },
    { id: 'warrantyExpiry', label: 'Warranty Expiry', category: 'financial' },
    { id: 'vendor', label: 'Vendor', category: 'financial' },
    { id: 'model', label: 'Model', category: 'technical' },
    { id: 'serialNumber', label: 'Serial Number', category: 'technical' },
    ...customFields.map(field => ({
      id: `custom_${field.id}`,
      label: field.name,
      category: field.category
    }))
  ];

  const columnsByCategory = availableColumns.reduce((acc, column) => {
    if (!acc[column.category]) {
      acc[column.category] = [];
    }
    acc[column.category].push(column);
    return acc;
  }, {} as Record<string, typeof availableColumns>);

  const handleCreateView = () => {
    setIsCreateMode(true);
    setSelectedView(null);
    setViewName('');
    setViewDescription('');
    setSelectedColumns(['name', 'ipAddress', 'status', 'criticality']);
    setSortColumn('name');
    setSortOrder('asc');
    setIsDefault(false);
    setPermissions(['read']);
    setShowViewDialog(true);
  };

  const handleEditView = (view: TableView) => {
    setIsCreateMode(false);
    setSelectedView(view);
    setViewName(view.name);
    setViewDescription(view.description);
    setSelectedColumns(view.columns);
    setSortColumn(view.sortBy);
    setSortOrder(view.sortOrder);
    setIsDefault(view.isDefault);
    setPermissions(view.permissions);
    setShowViewDialog(true);
  };

  const handleSaveView = () => {
    const viewData = {
      id: isCreateMode ? Date.now().toString() : selectedView?.id,
      name: viewName,
      description: viewDescription,
      columns: selectedColumns,
      filters: {},
      sortBy: sortColumn,
      sortOrder,
      isDefault,
      permissions,
    };

    // Here you would typically save to the backend
    console.log('Saving view:', viewData);
    setShowViewDialog(false);
  };

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedColumns(items);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Table View Designer</h2>
          <p className="text-gray-600">Create and manage custom table views for asset inventory</p>
        </div>
        <Button onClick={handleCreateView}>
          <Plus className="h-4 w-4 mr-2" />
          Create New View
        </Button>
      </div>

      {/* Existing Views */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tableViews.map((view) => (
          <Card key={view.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{view.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {view.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditView(view)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{view.description}</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Columns className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{view.columns.length} columns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Sort by {view.sortBy} ({view.sortOrder})</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {view.columns.slice(0, 4).map((column) => (
                    <Badge key={column} variant="outline" className="text-xs">
                      {availableColumns.find(c => c.id === column)?.label || column}
                    </Badge>
                  ))}
                  {view.columns.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{view.columns.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Table className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Designer Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? 'Create New Table View' : `Edit Table View: ${selectedView?.name}`}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - View Configuration */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="viewName">View Name</Label>
                <Input
                  id="viewName"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  placeholder="Enter view name"
                />
              </div>

              <div>
                <Label htmlFor="viewDescription">Description</Label>
                <Textarea
                  id="viewDescription"
                  value={viewDescription}
                  onChange={(e) => setViewDescription(e.target.value)}
                  placeholder="Describe this view's purpose"
                  rows={3}
                />
              </div>

              <div>
                <Label>Sort Configuration</Label>
                <div className="flex space-x-2 mt-2">
                  <Select value={sortColumn} onValueChange={setSortColumn}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sort by column" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isDefault" 
                  checked={isDefault} 
                  onCheckedChange={(checked) => setIsDefault(!!checked)} 
                />
                <Label htmlFor="isDefault">Set as default view</Label>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['read', 'write', 'delete', 'admin'].map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={permissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPermissions(prev => [...prev, permission]);
                          } else {
                            setPermissions(prev => prev.filter(p => p !== permission));
                          }
                        }}
                      />
                      <Label htmlFor={permission} className="capitalize">{permission}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Column Selection */}
            <div className="space-y-4">
              <div>
                <Label>Available Columns</Label>
                <div className="mt-2 space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(columnsByCategory).map(([category, columns]) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm capitalize mb-2 text-gray-700">
                        {category.replace('_', ' ')} Fields
                      </h4>
                      <div className="grid grid-cols-1 gap-1">
                        {columns.map((column) => (
                          <div key={column.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={column.id}
                              checked={selectedColumns.includes(column.id)}
                              onCheckedChange={() => handleColumnToggle(column.id)}
                            />
                            <Label htmlFor={column.id} className="text-sm">{column.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Selected Columns ({selectedColumns.length})</Label>
                <div className="mt-2 p-3 border rounded-md bg-gray-50 max-h-48 overflow-y-auto">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="selectedColumns">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {selectedColumns.map((columnId, index) => {
                            const column = availableColumns.find(c => c.id === columnId);
                            return (
                              <Draggable key={columnId} draggableId={columnId} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`flex items-center justify-between p-2 mb-1 bg-white rounded border ${
                                      snapshot.isDragging ? 'shadow-lg' : ''
                                    }`}
                                  >
                                    <span className="text-sm">{column?.label || columnId}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleColumnToggle(columnId)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveView} disabled={!viewName || selectedColumns.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              {isCreateMode ? 'Create View' : 'Update View'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}