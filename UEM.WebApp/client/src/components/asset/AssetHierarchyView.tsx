import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2,
  MapPin,
  Briefcase,
  Users,
  ChevronDown,
  ChevronRight,
  Search,
  TreePine,
  Network,
  Layers
} from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  ipAddress: string;
  status: 'active' | 'inactive' | 'maintenance' | 'decommissioned';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  location?: string;
  businessUnit?: string;
  project?: string;
  reportingManager?: string;
  category?: string;
}

interface AssetHierarchyViewProps {
  assets: Asset[];
}

interface HierarchyNode {
  id: string;
  label: string;
  type: 'root' | 'location' | 'businessUnit' | 'project' | 'manager' | 'asset';
  assets: Asset[];
  children: HierarchyNode[];
  expanded: boolean;
  level: number;
}

export function AssetHierarchyView({ assets }: AssetHierarchyViewProps) {
  const [hierarchyType, setHierarchyType] = useState<'location' | 'business' | 'network'>('location');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const hierarchyOptions = [
    { value: 'location', label: 'Location Hierarchy', icon: MapPin },
    { value: 'business', label: 'Business Hierarchy', icon: Briefcase },
    { value: 'network', label: 'Network Hierarchy', icon: Network },
  ];

  const buildLocationHierarchy = (assets: Asset[]): HierarchyNode[] => {
    const locationGroups = assets.reduce((acc, asset) => {
      const location = asset.location || 'Unassigned';
      if (!acc[location]) {
        acc[location] = [];
      }
      acc[location].push(asset);
      return acc;
    }, {} as Record<string, Asset[]>);

    return Object.entries(locationGroups).map(([location, locationAssets]) => ({
      id: `location-${location}`,
      label: location,
      type: 'location' as const,
      assets: locationAssets,
      children: locationAssets.map(asset => ({
        id: `asset-${asset.id}`,
        label: asset.name,
        type: 'asset' as const,
        assets: [asset],
        children: [],
        expanded: false,
        level: 2,
      })),
      expanded: expandedNodes.has(`location-${location}`),
      level: 1,
    }));
  };

  const buildBusinessHierarchy = (assets: Asset[]): HierarchyNode[] => {
    const businessGroups = assets.reduce((acc, asset) => {
      const businessUnit = asset.businessUnit || 'Unassigned';
      const project = asset.project || 'No Project';
      const manager = asset.reportingManager || 'No Manager';
      
      if (!acc[businessUnit]) {
        acc[businessUnit] = {};
      }
      if (!acc[businessUnit][project]) {
        acc[businessUnit][project] = {};
      }
      if (!acc[businessUnit][project][manager]) {
        acc[businessUnit][project][manager] = [];
      }
      acc[businessUnit][project][manager].push(asset);
      return acc;
    }, {} as Record<string, Record<string, Record<string, Asset[]>>>);

    return Object.entries(businessGroups).map(([businessUnit, projects]) => ({
      id: `bu-${businessUnit}`,
      label: businessUnit,
      type: 'businessUnit' as const,
      assets: Object.values(projects).flatMap(p => Object.values(p).flat()),
      children: Object.entries(projects).map(([project, managers]) => ({
        id: `project-${businessUnit}-${project}`,
        label: project,
        type: 'project' as const,
        assets: Object.values(managers).flat(),
        children: Object.entries(managers).map(([manager, managerAssets]) => ({
          id: `manager-${businessUnit}-${project}-${manager}`,
          label: manager,
          type: 'manager' as const,
          assets: managerAssets,
          children: managerAssets.map(asset => ({
            id: `asset-${asset.id}`,
            label: asset.name,
            type: 'asset' as const,
            assets: [asset],
            children: [],
            expanded: false,
            level: 4,
          })),
          expanded: expandedNodes.has(`manager-${businessUnit}-${project}-${manager}`),
          level: 3,
        })),
        expanded: expandedNodes.has(`project-${businessUnit}-${project}`),
        level: 2,
      })),
      expanded: expandedNodes.has(`bu-${businessUnit}`),
      level: 1,
    }));
  };

  const buildNetworkHierarchy = (assets: Asset[]): HierarchyNode[] => {
    const networkGroups = assets.reduce((acc, asset) => {
      // Extract network segment from IP address (first 3 octets)
      const networkSegment = asset.ipAddress.split('.').slice(0, 3).join('.') + '.0/24';
      if (!acc[networkSegment]) {
        acc[networkSegment] = [];
      }
      acc[networkSegment].push(asset);
      return acc;
    }, {} as Record<string, Asset[]>);

    return Object.entries(networkGroups).map(([network, networkAssets]) => ({
      id: `network-${network}`,
      label: network,
      type: 'root' as const,
      assets: networkAssets,
      children: networkAssets.map(asset => ({
        id: `asset-${asset.id}`,
        label: `${asset.name} (${asset.ipAddress})`,
        type: 'asset' as const,
        assets: [asset],
        children: [],
        expanded: false,
        level: 2,
      })),
      expanded: expandedNodes.has(`network-${network}`),
      level: 1,
    }));
  };

  const hierarchy = useMemo(() => {
    const filteredAssets = assets.filter(asset => 
      !searchQuery || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.ipAddress.includes(searchQuery) ||
      asset.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.businessUnit?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (hierarchyType) {
      case 'location':
        return buildLocationHierarchy(filteredAssets);
      case 'business':
        return buildBusinessHierarchy(filteredAssets);
      case 'network':
        return buildNetworkHierarchy(filteredAssets);
      default:
        return [];
    }
  }, [assets, hierarchyType, searchQuery, expandedNodes]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allNodeIds = new Set<string>();
    const collectNodeIds = (nodes: HierarchyNode[]) => {
      nodes.forEach(node => {
        allNodeIds.add(node.id);
        collectNodeIds(node.children);
      });
    };
    collectNodeIds(hierarchy);
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'decommissioned': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'location': return MapPin;
      case 'businessUnit': return Building2;
      case 'project': return Briefcase;
      case 'manager': return Users;
      case 'asset': return TreePine;
      default: return Network;
    }
  };

  const renderNode = (node: HierarchyNode) => {
    const NodeIcon = getNodeIcon(node.type);
    const hasChildren = node.children.length > 0;
    const isExpanded = node.expanded;
    
    const paddingLeft = node.level * 20;

    return (
      <div key={node.id}>
        <div 
          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
          style={{ paddingLeft }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren && (
            <Button variant="ghost" size="sm" className="p-0 h-4 w-4">
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          <NodeIcon className="h-4 w-4 text-gray-500" />
          
          <span className="font-medium">{node.label}</span>
          
          {node.type !== 'asset' && (
            <Badge variant="outline" className="text-xs">
              {node.assets.length} asset{node.assets.length !== 1 ? 's' : ''}
            </Badge>
          )}
          
          {node.type === 'asset' && node.assets[0] && (
            <div className="flex items-center space-x-2 ml-auto">
              <Badge className={getStatusColor(node.assets[0].status)} >
                {node.assets[0].status}
              </Badge>
              <Badge className={getCriticalityColor(node.assets[0].criticality)}>
                {node.assets[0].criticality}
              </Badge>
              <span className="text-sm text-gray-500 font-mono">
                {node.assets[0].ipAddress}
              </span>
            </div>
          )}
        </div>
        
        {isExpanded && node.children.map(child => renderNode(child))}
      </div>
    );
  };

  const getHierarchyStats = () => {
    const stats = {
      totalNodes: 0,
      totalAssets: assets.length,
      activeAssets: assets.filter(a => a.status === 'active').length,
      criticalAssets: assets.filter(a => a.criticality === 'critical').length,
    };

    const countNodes = (nodes: HierarchyNode[]) => {
      nodes.forEach(node => {
        stats.totalNodes++;
        countNodes(node.children);
      });
    };
    countNodes(hierarchy);

    return stats;
  };

  const stats = getHierarchyStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asset Hierarchy View</h2>
          <p className="text-gray-600">Visualize assets in hierarchical organizational structure</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalNodes}</p>
                <p className="text-xs text-gray-500">Hierarchy Nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalAssets}</p>
                <p className="text-xs text-gray-500">Total Assets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TreePine className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeAssets}</p>
                <p className="text-xs text-gray-500">Active Assets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TreePine className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.criticalAssets}</p>
                <p className="text-xs text-gray-500">Critical Assets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assets, locations, or business units..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Select value={hierarchyType} onValueChange={(value: 'location' | 'business' | 'network') => setHierarchyType(value)}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hierarchyOptions.map((option) => (
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
          </div>
        </CardContent>
      </Card>

      {/* Hierarchy Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {(() => {
              const option = hierarchyOptions.find(opt => opt.value === hierarchyType);
              if (option?.icon) {
                const IconComponent = option.icon;
                return <IconComponent className="h-5 w-5" />;
              }
              return null;
            })()}
            <span>{hierarchyOptions.find(opt => opt.value === hierarchyType)?.label}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            {hierarchy.length > 0 ? (
              <div className="space-y-1">
                {hierarchy.map(node => renderNode(node))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TreePine className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No assets found matching the current filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}