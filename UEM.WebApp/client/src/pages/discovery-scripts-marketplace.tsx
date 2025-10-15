import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useTenantData, useTenantContext } from "@/hooks/useTenantData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Download,
  Star,
  Eye,
  Code,
  Calendar,
  User,
  Filter,
  MoreVertical,
  ShoppingCart,
  CheckCircle,
  ExternalLink,
  Tag,
  Zap,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";

interface MarketplaceScript {
  id: number;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  author: string;
  rating: number;
  downloads: number;
  lastUpdated: string;
  version: string;
  language: string;
  size: string;
  tags: string[];
  price: string;
  verified: boolean;
  featured: boolean;
  compatibility: string[];
  documentation: string;
  supportLevel: string;
  previewCode: string;
}

const marketplaceScripts: MarketplaceScript[] = [
  {
    id: 1,
    name: "Windows Domain Discovery",
    description: "Comprehensive Active Directory domain discovery script with user enumeration, group policies, and security assessment capabilities.",
    category: "Operating System",
    subcategory: "Windows",
    author: "Microsoft Solutions Team",
    rating: 4.8,
    downloads: 15420,
    lastUpdated: "2025-01-15",
    version: "3.2.1",
    language: "PowerShell",
    size: "2.4 MB",
    tags: ["Active Directory", "Domain", "Security", "Enterprise"],
    price: "Free",
    verified: true,
    featured: true,
    compatibility: ["Windows Server 2016+", "Windows 10+", "PowerShell 5.1+"],
    documentation: "Complete documentation with examples",
    supportLevel: "Enterprise",
    previewCode: `# Windows Domain Discovery Script
Get-ADDomain | Select-Object Name, DomainMode, PDCEmulator
Get-ADUser -Filter * -Properties LastLogonDate | Select-Object Name, Enabled, LastLogonDate`
  },
  {
    id: 2,
    name: "Linux System Inventory",
    description: "Advanced Linux system discovery script for hardware inventory, service enumeration, and security compliance checking.",
    category: "Operating System",
    subcategory: "Linux",
    author: "Open Source Collective",
    rating: 4.6,
    downloads: 12850,
    lastUpdated: "2025-01-10",
    version: "2.8.4",
    language: "Bash",
    size: "1.8 MB",
    tags: ["Linux", "Inventory", "Compliance", "Security"],
    price: "Free",
    verified: true,
    featured: false,
    compatibility: ["RHEL 7+", "Ubuntu 18.04+", "CentOS 7+"],
    documentation: "Wiki with installation guides",
    supportLevel: "Community",
    previewCode: `#!/bin/bash
# Linux System Inventory
uname -a
lscpu | grep "Model name"
df -h | grep -v tmpfs`
  },
  {
    id: 3,
    name: "Network Port Scanner Pro",
    description: "Enterprise-grade network port scanning script with service detection, vulnerability assessment, and compliance reporting.",
    category: "Network & Connectivity",
    subcategory: "Port Scanning",
    author: "NetworkSec Pro",
    rating: 4.9,
    downloads: 8920,
    lastUpdated: "2025-01-12",
    version: "4.1.0",
    language: "Python",
    size: "3.2 MB",
    tags: ["Network", "Security", "Scanning", "Vulnerability"],
    price: "$49.99",
    verified: true,
    featured: true,
    compatibility: ["Python 3.8+", "Cross-platform"],
    documentation: "Professional documentation with API reference",
    supportLevel: "Professional",
    previewCode: `import socket
import threading

def scan_port(host, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False`
  },
  {
    id: 4,
    name: "Database Discovery Suite",
    description: "Multi-database discovery script supporting MySQL, PostgreSQL, SQL Server, and Oracle with schema analysis and security auditing.",
    category: "Applications",
    subcategory: "Database",
    author: "DataBase Systems Inc",
    rating: 4.7,
    downloads: 6540,
    lastUpdated: "2025-01-08",
    version: "1.9.2",
    language: "PowerShell",
    size: "4.1 MB",
    tags: ["Database", "SQL", "Security", "Audit"],
    price: "$79.99",
    verified: true,
    featured: false,
    compatibility: ["Windows", "PowerShell 7.0+"],
    documentation: "Enterprise documentation with examples",
    supportLevel: "Enterprise",
    previewCode: `# Database Discovery Suite
$connectionString = "Server=$server;Database=$database;Trusted_Connection=true;"
$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$connection.Open()`
  },
  {
    id: 5,
    name: "Cloud Asset Discovery",
    description: "Multi-cloud asset discovery script for AWS, Azure, and GCP with cost analysis, security posture assessment, and compliance reporting.",
    category: "Cloud Services",
    subcategory: "Multi-Cloud",
    author: "CloudOps Masters",
    rating: 4.5,
    downloads: 4320,
    lastUpdated: "2025-01-14",
    version: "2.3.1",
    language: "Python",
    size: "5.7 MB",
    tags: ["Cloud", "AWS", "Azure", "GCP", "Cost"],
    price: "$129.99",
    verified: true,
    featured: true,
    compatibility: ["Python 3.9+", "AWS CLI", "Azure CLI", "gcloud"],
    documentation: "Cloud-native documentation with deployment guides",
    supportLevel: "Enterprise",
    previewCode: `import boto3
import azure.identity
from google.cloud import compute_v1

# Multi-cloud discovery
aws_client = boto3.client('ec2')
azure_credential = azure.identity.DefaultAzureCredential()
gcp_client = compute_v1.InstancesClient()`
  },
  {
    id: 6,
    name: "Web Application Scanner",
    description: "Advanced web application discovery and vulnerability scanning script with OWASP Top 10 compliance and automated reporting.",
    category: "Applications",
    subcategory: "Web Services",
    author: "WebSec Solutions",
    rating: 4.4,
    downloads: 7680,
    lastUpdated: "2025-01-06",
    version: "3.0.5",
    language: "Python",
    size: "6.2 MB",
    tags: ["Web", "Security", "OWASP", "Vulnerability"],
    price: "$89.99",
    verified: true,
    featured: false,
    compatibility: ["Python 3.8+", "Cross-platform"],
    documentation: "Security-focused documentation",
    supportLevel: "Professional",
    previewCode: `import requests
import ssl
from urllib.parse import urljoin

def scan_web_app(base_url):
    session = requests.Session()
    response = session.get(base_url)
    return response.status_code, response.headers`
  }
];

export default function DiscoveryScriptsMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedScript, setSelectedScript] = useState<MarketplaceScript | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const filteredScripts = marketplaceScripts.filter((script) => {
    const matchesSearch = script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         script.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         script.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || script.category === categoryFilter;
    const matchesLanguage = languageFilter === "all" || script.language === languageFilter;
    const matchesPrice = priceFilter === "all" || 
                        (priceFilter === "free" && script.price === "Free") ||
                        (priceFilter === "paid" && script.price !== "Free");
    const matchesRating = ratingFilter === "all" || 
                         (ratingFilter === "4+" && script.rating >= 4) ||
                         (ratingFilter === "4.5+" && script.rating >= 4.5);

    return matchesSearch && matchesCategory && matchesLanguage && matchesPrice && matchesRating;
  }).sort((a, b) => {
    switch (sortBy) {
      case "featured":
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating;
      case "rating":
        return b.rating - a.rating;
      case "downloads":
        return b.downloads - a.downloads;
      case "newest":
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case "alphabetical":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleViewDetails = (script: MarketplaceScript) => {
    setSelectedScript(script);
    setShowDetailsDialog(true);
  };

  const handleDownload = (script: MarketplaceScript) => {
    toast({
      title: "Download Initiated",
      description: `Downloading ${script.name} v${script.version}...`,
    });
  };

  const handleInstall = (script: MarketplaceScript) => {
    toast({
      title: "Installation Started",
      description: `Installing ${script.name} to your script library...`,
    });
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
            ? "fill-yellow-200 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getPriceColor = (price: string) => {
    return price === "Free" ? "text-green-600" : "text-blue-600";
  };

  return (
    <div className="space-y-6">
      
      {/* Filter and Search Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            <CardTitle>Discovery Scripts Marketplace</CardTitle>
          </div>
          <CardDescription>
            Browse and download enterprise-grade discovery scripts from our comprehensive library
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Primary Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search scripts, descriptions, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Operating System">Operating System</SelectItem>
                  <SelectItem value="Network & Connectivity">Network & Connectivity</SelectItem>
                  <SelectItem value="Applications">Applications</SelectItem>
                  <SelectItem value="Cloud Services">Cloud Services</SelectItem>
                </SelectContent>
              </Select>

              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="PowerShell">PowerShell</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Bash">Bash</SelectItem>
                  <SelectItem value="JavaScript">JavaScript</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4+">4+ Stars</SelectItem>
                  <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredScripts.length} of {marketplaceScripts.length} scripts
            </div>
            <div className="flex items-center space-x-2">
              {(searchQuery || categoryFilter !== "all" || languageFilter !== "all" || priceFilter !== "all" || ratingFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setLanguageFilter("all");
                    setPriceFilter("all");
                    setRatingFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scripts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredScripts.map((script) => (
          <Card key={script.id} className="hover:shadow-lg transition-shadow relative">
            {script.featured && (
              <div className="absolute top-3 right-3 z-10">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  <Zap className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1 mr-4">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{script.name}</CardTitle>
                    {script.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {script.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-800">
                      {script.language}
                    </Badge>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleViewDetails(script)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(script)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleInstall(script)}>
                      <Code className="w-4 h-4 mr-2" />
                      Install to Library
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <CardDescription className="text-sm leading-relaxed">
                {script.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Rating and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {getRatingStars(script.rating)}
                  <span className="text-sm font-medium ml-1">{script.rating}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{script.downloads.toLocaleString()} downloads</span>
                  <span className={getPriceColor(script.price)}>{script.price}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {script.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {script.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{script.tags.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {script.author}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  v{script.version}
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {script.lastUpdated}
                </div>
                <div className="flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  {script.supportLevel}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewDetails(script)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDownload(script)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredScripts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No scripts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              Try adjusting your search terms or filters to find the discovery scripts you're looking for.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Script Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <span>{selectedScript?.name}</span>
              {selectedScript?.verified && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedScript?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedScript && (
            <div className="space-y-6 py-4">
              {/* Overview */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Script Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span>{selectedScript.category} / {selectedScript.subcategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Language:</span>
                      <span>{selectedScript.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Version:</span>
                      <span>{selectedScript.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Size:</span>
                      <span>{selectedScript.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Price:</span>
                      <span className={getPriceColor(selectedScript.price)}>{selectedScript.price}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                      <div className="flex items-center space-x-1">
                        {getRatingStars(selectedScript.rating)}
                        <span className="ml-1">{selectedScript.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Downloads:</span>
                      <span>{selectedScript.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Author:</span>
                      <span>{selectedScript.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                      <span>{selectedScript.lastUpdated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Support Level:</span>
                      <span>{selectedScript.supportLevel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedScript.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Compatibility */}
              <div>
                <h3 className="font-semibold mb-3">Compatibility</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedScript.compatibility.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Preview */}
              <div>
                <h3 className="font-semibold mb-3">Code Preview</h3>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm font-mono">
                    <code>{selectedScript.previewCode}</code>
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button onClick={() => handleDownload(selectedScript)} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Script
                </Button>
                <Button variant="outline" onClick={() => handleInstall(selectedScript)} className="flex-1">
                  <Code className="w-4 h-4 mr-2" />
                  Install to Library
                </Button>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}