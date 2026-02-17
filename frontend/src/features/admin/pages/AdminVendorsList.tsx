import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { 
  ArrowLeft, 
  Search, 
  Store, 
  CheckCircle2, 
  XCircle,
  Eye,
  RefreshCw,
  Clock,
  UserCircle,
  ChevronDown,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Vendor {
  id: string;
  businessName: string;
  vendorCategory?: {
    id: string;
    name: string;
  };
  customCategoryName?: string;
  cityName?: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

interface PendingVendor {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface VendorsResponse {
  content: Vendor[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export default function AdminVendorsList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(100); // Fetch all for grouping
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [pendingOpen, setPendingOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendors();
    fetchPendingVendors();
  }, [page, searchQuery]);

  // Group vendors by category
  const groupedVendors = useMemo(() => {
    const groups: Record<string, Vendor[]> = {};
    vendors.forEach((vendor) => {
      const category = vendor.customCategoryName || vendor.vendorCategory?.name || 'Uncategorized';
      if (!groups[category]) groups[category] = [];
      groups[category].push(vendor);
    });
    // Sort categories alphabetically
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [vendors]);

  // Open all categories by default when vendors load
  useEffect(() => {
    if (groupedVendors.length > 0 && openCategories.size === 0) {
      setOpenCategories(new Set(groupedVendors.map(([cat]) => cat)));
    }
  }, [groupedVendors]);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const expandAll = () => setOpenCategories(new Set(groupedVendors.map(([cat]) => cat)));
  const collapseAll = () => setOpenCategories(new Set());

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      const url = `${API_BASE_URL}/admin/vendors?page=${page}&size=${size}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Unauthorized. Please login again.');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch vendors');
      }

      const data = await response.json();
      if (data.success) {
        const vendorsData: VendorsResponse = data.data;
        setVendors(vendorsData.content || []);
        setTotalPages(vendorsData.totalPages || 0);
        setTotalElements(vendorsData.totalElements || 0);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchVendors();
  };

  const fetchPendingVendors = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      const response = await fetch(`${API_BASE_URL}/admin/vendors/pending-onboarding`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setPendingVendors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && vendors.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">All Vendors</h1>
                <p className="text-sm text-muted-foreground">
                  {totalElements} onboarded · {groupedVendors.length} categories{pendingVendors.length > 0 ? ` · ${pendingVendors.length} pending` : ''}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => { fetchVendors(); fetchPendingVendors(); }} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search by business name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Expand/Collapse All */}
        {groupedVendors.length > 1 && (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={expandAll} className="text-xs">
              Expand All
            </Button>
            <span className="text-muted-foreground text-xs">|</span>
            <Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs">
              Collapse All
            </Button>
          </div>
        )}

        {/* Pending Onboarding */}
        {pendingVendors.length > 0 && (
          <Collapsible open={pendingOpen} onOpenChange={setPendingOpen}>
            <Card className="border-amber-200 bg-amber-50/30 overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-amber-50/60 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    {pendingOpen ? <ChevronDown className="h-4 w-4 text-amber-600" /> : <ChevronRight className="h-4 w-4 text-amber-600" />}
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-amber-800 text-sm">Pending Onboarding</span>
                    <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-100 text-xs ml-1">
                      {pendingVendors.length}
                    </Badge>
                  </div>
                  <span className="text-xs text-amber-600">Signed up but profile incomplete</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t border-amber-200 divide-y divide-amber-100">
                  {pendingVendors.map((pv) => (
                    <div key={pv.userId} className="flex items-center justify-between px-5 py-3 hover:bg-amber-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{pv.fullName || 'No name'}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {pv.phone && <span>{pv.phone}</span>}
                            {pv.email && <span>· {pv.email}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {pv.createdAt && (
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {format(new Date(pv.createdAt), 'MMM d, yyyy')}
                          </span>
                        )}
                        <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-xs">
                          Pending
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Category-grouped Vendors */}
        {vendors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No vendors found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {groupedVendors.map(([category, categoryVendors]) => {
              const isOpen = openCategories.has(category);
              return (
                <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
                  <Card className="overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          {isOpen ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          <FolderOpen className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm">{category}</span>
                          <Badge variant="secondary" className="text-xs">
                            {categoryVendors.length}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {categoryVendors.filter(v => v.isVerified).length > 0 && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              {categoryVendors.filter(v => v.isVerified).length} verified
                            </span>
                          )}
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t divide-y">
                        {categoryVendors.map((vendor) => (
                          <div key={vendor.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-medium text-sm truncate">{vendor.businessName}</span>
                                {vendor.isVerified && (
                                  <Badge variant="default" className="bg-green-500 text-xs px-1.5 py-0">
                                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                    Verified
                                  </Badge>
                                )}
                                {!vendor.isActive && (
                                  <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                    <XCircle className="h-2.5 w-2.5 mr-0.5" />
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                {vendor.cityName && <span>{vendor.cityName}</span>}
                                <span>{vendor.rating.toFixed(1)} ⭐ ({vendor.reviewCount})</span>
                                <span>{formatCurrency(vendor.startingPrice)}</span>
                                <span>{format(new Date(vendor.createdAt), 'MMM d, yyyy')}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/vendors/${vendor.id}`)}
                              className="ml-3 flex-shrink-0"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
