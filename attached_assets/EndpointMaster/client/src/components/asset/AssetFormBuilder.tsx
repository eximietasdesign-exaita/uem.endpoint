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
  Plus,
  Trash2,
  Edit,
  Save,
  Type,
  Hash,
  Calendar,
  List,
  ToggleLeft,
  DollarSign,
  Settings,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
  displayOrder: number;
  description?: string;
  placeholder?: string;
}

interface AssetFormBuilderProps {
  customFields: AssetField[];
}

export function AssetFormBuilder({ customFields }: AssetFormBuilderProps) {
  const [fields, setFields] = useState<AssetField[]>(customFields);
  const [selectedField, setSelectedField] = useState<AssetField | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Field form state
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<AssetField['type']>('text');
  const [fieldCategory, setFieldCategory] = useState<AssetField['category']>('basic');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldDescription, setFieldDescription] = useState('');
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldDefaultValue, setFieldDefaultValue] = useState('');
  const [fieldOptions, setFieldOptions] = useState<string[]>(['']);
  const [fieldValidation, setFieldValidation] = useState({
    min: '',
    max: '',
    pattern: ''
  });

  useEffect(() => {
    setFields(customFields);
  }, [customFields]);

  const fieldCategories = [
    { value: 'basic', label: 'Basic Information', icon: Type },
    { value: 'location', label: 'Location & Geography', icon: Hash },
    { value: 'business', label: 'Business Context', icon: Settings },
    { value: 'technical', label: 'Technical Details', icon: Settings },
    { value: 'financial', label: 'Financial Information', icon: DollarSign },
    { value: 'compliance', label: 'Compliance & Security', icon: Settings },
  ];

  const fieldTypes = [
    { value: 'text', label: 'Text', icon: Type, description: 'Single line text input' },
    { value: 'number', label: 'Number', icon: Hash, description: 'Numeric input with validation' },
    { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
    { value: 'select', label: 'Dropdown', icon: List, description: 'Single selection from options' },
    { value: 'multiselect', label: 'Multi-Select', icon: List, description: 'Multiple selections from options' },
    { value: 'boolean', label: 'Toggle', icon: ToggleLeft, description: 'True/false toggle' },
    { value: 'currency', label: 'Currency', icon: DollarSign, description: 'Monetary value input' },
  ];

  const handleCreateField = () => {
    setIsCreateMode(true);
    setSelectedField(null);
    resetFieldForm();
    setShowFieldDialog(true);
  };

  const handleEditField = (field: AssetField) => {
    setIsCreateMode(false);
    setSelectedField(field);
    setFieldName(field.name);
    setFieldType(field.type);
    setFieldCategory(field.category);
    setFieldRequired(field.required);
    setFieldDescription(field.description || '');
    setFieldPlaceholder(field.placeholder || '');
    setFieldDefaultValue(field.defaultValue || '');
    setFieldOptions(field.options || ['']);
    setFieldValidation({
      min: field.validation?.min?.toString() || '',
      max: field.validation?.max?.toString() || '',
      pattern: field.validation?.pattern || ''
    });
    setShowFieldDialog(true);
  };

  const resetFieldForm = () => {
    setFieldName('');
    setFieldType('text');
    setFieldCategory('basic');
    setFieldRequired(false);
    setFieldDescription('');
    setFieldPlaceholder('');
    setFieldDefaultValue('');
    setFieldOptions(['']);
    setFieldValidation({ min: '', max: '', pattern: '' });
  };

  const handleSaveField = () => {
    const newField: AssetField = {
      id: isCreateMode ? `custom_${Date.now()}` : selectedField!.id,
      name: fieldName,
      type: fieldType,
      category: fieldCategory,
      required: fieldRequired,
      description: fieldDescription,
      placeholder: fieldPlaceholder,
      defaultValue: fieldDefaultValue,
      options: (fieldType === 'select' || fieldType === 'multiselect') ? fieldOptions.filter(opt => opt.trim()) : undefined,
      validation: {
        min: fieldValidation.min ? parseInt(fieldValidation.min) : undefined,
        max: fieldValidation.max ? parseInt(fieldValidation.max) : undefined,
        pattern: fieldValidation.pattern || undefined,
      },
      displayOrder: isCreateMode ? fields.length : selectedField!.displayOrder,
    };

    if (isCreateMode) {
      setFields(prev => [...prev, newField]);
    } else {
      setFields(prev => prev.map(f => f.id === selectedField!.id ? newField : f));
    }

    setShowFieldDialog(false);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display order
    const updatedItems = items.map((item, index) => ({
      ...item,
      displayOrder: index
    }));

    setFields(updatedItems);
  };

  const addOption = () => {
    setFieldOptions(prev => [...prev, '']);
  };

  const updateOption = (index: number, value: string) => {
    setFieldOptions(prev => prev.map((opt, i) => i === index ? value : opt));
  };

  const removeOption = (index: number) => {
    setFieldOptions(prev => prev.filter((_, i) => i !== index));
  };

  const getFieldIcon = (type: string) => {
    const fieldType = fieldTypes.find(ft => ft.value === type);
    return fieldType?.icon || Type;
  };

  const renderFieldPreview = (field: AssetField) => {
    const commonProps = {
      id: field.id,
      placeholder: field.placeholder,
      required: field.required,
      className: "w-full"
    };

    switch (field.type) {
      case 'text':
        return <Input {...commonProps} defaultValue={field.defaultValue} />;
      case 'number':
        return <Input {...commonProps} type="number" defaultValue={field.defaultValue} />;
      case 'date':
        return <Input {...commonProps} type="date" defaultValue={field.defaultValue} />;
      case 'select':
        return (
          <Select defaultValue={field.defaultValue}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}_${index}`} />
                <Label htmlFor={`${field.id}_${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id={field.id} defaultChecked={field.defaultValue} />
            <Label htmlFor={field.id}>{field.name}</Label>
          </div>
        );
      case 'currency':
        return (
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input {...commonProps} type="number" className="pl-10" defaultValue={field.defaultValue} />
          </div>
        );
      default:
        return <Input {...commonProps} defaultValue={field.defaultValue} />;
    }
  };

  const fieldsByCategory = fields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, AssetField[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asset Form Builder</h2>
          <p className="text-gray-600">Design dynamic forms with custom fields for asset management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          <Button onClick={handleCreateField}>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Field
          </Button>
        </div>
      </div>

      {previewMode ? (
        /* Form Preview Mode */
        <Card>
          <CardHeader>
            <CardTitle>Asset Form Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {fieldCategories.map((category) => {
                const categoryFields = fieldsByCategory[category.value] || [];
                if (categoryFields.length === 0) return null;

                return (
                  <div key={category.value}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <category.icon className="h-5 w-5" />
                      <span>{category.label}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryFields
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id} className="flex items-center space-x-2">
                              <span>{field.name}</span>
                              {field.required && <span className="text-red-500">*</span>}
                            </Label>
                            {field.description && (
                              <p className="text-sm text-gray-500">{field.description}</p>
                            )}
                            {renderFieldPreview(field)}
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Field Management Mode */
        <div className="space-y-6">
          {/* Field Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {fieldCategories.map((category) => {
              const count = fieldsByCategory[category.value]?.length || 0;
              return (
                <Card key={category.value}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <category.icon className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs text-gray-500">{category.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Field List */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields ({fields.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {fields
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((field, index) => {
                          const FieldIcon = getFieldIcon(field.type);
                          return (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-4 border rounded-lg bg-white ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <FieldIcon className="h-5 w-5 text-gray-400" />
                                      <div>
                                        <h4 className="font-medium">{field.name}</h4>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <Badge variant="outline" className="text-xs">
                                            {fieldTypes.find(ft => ft.value === field.type)?.label}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs">
                                            {fieldCategories.find(fc => fc.value === field.category)?.label}
                                          </Badge>
                                          {field.required && (
                                            <Badge variant="destructive" className="text-xs">
                                              Required
                                            </Badge>
                                          )}
                                        </div>
                                        {field.description && (
                                          <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditField(field)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteField(field.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Field Designer Dialog */}
      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? 'Create Custom Field' : `Edit Field: ${selectedField?.name}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fieldName">Field Name *</Label>
                <Input
                  id="fieldName"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="Enter field name"
                />
              </div>
              <div>
                <Label htmlFor="fieldType">Field Type *</Label>
                <Select value={fieldType} onValueChange={(value: AssetField['type']) => setFieldType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <div>
                            <div>{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="fieldCategory">Category *</Label>
              <Select value={fieldCategory} onValueChange={(value: AssetField['category']) => setFieldCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        <category.icon className="h-4 w-4" />
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fieldDescription">Description</Label>
              <Textarea
                id="fieldDescription"
                value={fieldDescription}
                onChange={(e) => setFieldDescription(e.target.value)}
                placeholder="Describe this field's purpose"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fieldPlaceholder">Placeholder Text</Label>
                <Input
                  id="fieldPlaceholder"
                  value={fieldPlaceholder}
                  onChange={(e) => setFieldPlaceholder(e.target.value)}
                  placeholder="Enter placeholder text"
                />
              </div>
              <div>
                <Label htmlFor="fieldDefaultValue">Default Value</Label>
                <Input
                  id="fieldDefaultValue"
                  value={fieldDefaultValue}
                  onChange={(e) => setFieldDefaultValue(e.target.value)}
                  placeholder="Enter default value"
                />
              </div>
            </div>

            {/* Options for select/multiselect */}
            {(fieldType === 'select' || fieldType === 'multiselect') && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2 mt-2">
                  {fieldOptions.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        disabled={fieldOptions.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {/* Validation Rules */}
            {(fieldType === 'text' || fieldType === 'number') && (
              <div>
                <Label>Validation Rules</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <Label htmlFor="minValue" className="text-xs">Min Value/Length</Label>
                    <Input
                      id="minValue"
                      type="number"
                      value={fieldValidation.min}
                      onChange={(e) => setFieldValidation(prev => ({ ...prev, min: e.target.value }))}
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxValue" className="text-xs">Max Value/Length</Label>
                    <Input
                      id="maxValue"
                      type="number"
                      value={fieldValidation.max}
                      onChange={(e) => setFieldValidation(prev => ({ ...prev, max: e.target.value }))}
                      placeholder="Max"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pattern" className="text-xs">Regex Pattern</Label>
                    <Input
                      id="pattern"
                      value={fieldValidation.pattern}
                      onChange={(e) => setFieldValidation(prev => ({ ...prev, pattern: e.target.value }))}
                      placeholder="Regex"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="fieldRequired" 
                checked={fieldRequired} 
                onCheckedChange={(checked) => setFieldRequired(!!checked)} 
              />
              <Label htmlFor="fieldRequired">Required field</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFieldDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveField} disabled={!fieldName}>
              <Save className="h-4 w-4 mr-2" />
              {isCreateMode ? 'Create Field' : 'Update Field'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}