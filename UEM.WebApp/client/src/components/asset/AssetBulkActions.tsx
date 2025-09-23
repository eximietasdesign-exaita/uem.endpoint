import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  CheckSquare,
  X,
  Edit,
  Trash2,
  MapPin,
  Building2,
  AlertTriangle,
  Tag,
  Download,
  Upload,
  Users
} from 'lucide-react';

interface AssetBulkActionsProps {
  selectedAssets: number[];
  onClearSelection: () => void;
}

export function AssetBulkActions({ selectedAssets, onClearSelection }: AssetBulkActionsProps) {
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateField, setBulkUpdateField] = useState('');
  const [bulkUpdateValue, setBulkUpdateValue] = useState('');

  const bulkUpdateOptions = [
    { value: 'status', label: 'Status', icon: CheckSquare },
    { value: 'criticality', label: 'Criticality', icon: AlertTriangle },
    { value: 'location', label: 'Location', icon: MapPin },
    { value: 'businessUnit', label: 'Business Unit', icon: Building2 },
    { value: 'category', label: 'Category', icon: Tag },
    { value: 'reportingManager', label: 'Reporting Manager', icon: Users },
  ];

  const statusOptions = ['active', 'inactive', 'maintenance', 'decommissioned'];
  const criticalityOptions = ['critical', 'high', 'medium', 'low'];
  const categoryOptions = ['server', 'workstation', 'network', 'mobile', 'iot'];

  const getValueOptions = () => {
    switch (bulkUpdateField) {
      case 'status':
        return statusOptions;
      case 'criticality':
        return criticalityOptions;
      case 'category':
        return categoryOptions;
      default:
        return [];
    }
  };

  const handleBulkUpdate = () => {
    // Here you would implement the bulk update logic
    console.log('Bulk updating', selectedAssets.length, 'assets:', {
      field: bulkUpdateField,
      value: bulkUpdateValue
    });
    setShowBulkUpdateDialog(false);
    onClearSelection();
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedAssets.length} selected assets?`)) {
      // Here you would implement the bulk delete logic
      console.log('Bulk deleting assets:', selectedAssets);
      onClearSelection();
    }
  };

  const handleExportSelected = () => {
    // Here you would implement the export logic
    console.log('Exporting selected assets:', selectedAssets);
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">
                {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-blue-700">
                Choose an action to apply to all selected assets
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Bulk Update */}
            <Dialog open={showBulkUpdateDialog} onOpenChange={setShowBulkUpdateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Update Assets</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Update {selectedAssets.length} selected assets
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Field to Update</label>
                        <Select value={bulkUpdateField} onValueChange={setBulkUpdateField}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select field to update" />
                          </SelectTrigger>
                          <SelectContent>
                            {bulkUpdateOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center space-x-2">
                                  <option.icon className="h-4 w-4" />
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {bulkUpdateField && (
                        <div>
                          <label className="text-sm font-medium">New Value</label>
                          {getValueOptions().length > 0 ? (
                            <Select value={bulkUpdateValue} onValueChange={setBulkUpdateValue}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select new value" />
                              </SelectTrigger>
                              <SelectContent>
                                {getValueOptions().map((option) => (
                                  <SelectItem key={option} value={option}>
                                    <Badge className="capitalize">{option}</Badge>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <input
                              type="text"
                              value={bulkUpdateValue}
                              onChange={(e) => setBulkUpdateValue(e.target.value)}
                              placeholder="Enter new value"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowBulkUpdateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBulkUpdate} 
                    disabled={!bulkUpdateField || !bulkUpdateValue}
                  >
                    Update {selectedAssets.length} Assets
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Export Selected */}
            <Button variant="outline" size="sm" onClick={handleExportSelected}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>

            {/* Add Tags */}
            <Button variant="outline" size="sm">
              <Tag className="h-4 w-4 mr-2" />
              Add Tags
            </Button>

            {/* Assign Location */}
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Assign Location
            </Button>

            {/* Bulk Delete */}
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>

            {/* Clear Selection */}
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}