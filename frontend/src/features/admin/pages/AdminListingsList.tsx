import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { 
  ArrowLeft, 
  Search, 
  Package, 
  CheckCircle2, 
  XCircle,
  Eye,
  RefreshCw,
  Filter,
  Trash2,
  Star,
  TrendingUp,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

interface Listing {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: 'PACKAGE' | 'ITEM';
  isActive: boolean;
  isPopular: boolean;
  isTrending: boolean;
  listingCategory?: {
    id: string;
    name: string;
  };
  vendor?: {
    id: string;
    businessName: string;
  };
  images?: string[];
  createdAt: string;
}

interface ListingsResponse {
  content: Listing[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export default function AdminListingsList() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, [page, searchQuery, categoryFilter, typeFilter, statusFilter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter.toUpperCase());
      }
      if (statusFilter !== 'all') {
        params.append('isActive', statusFilter === 'active' ? 'true' : 'false');
      }
      
      const url = `${API_BASE_URL}/admin/listings?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Unauthorized. Please login again.');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      if (data.success) {
        const listingsData: ListingsResponse = data.data;
        setListings(listingsData.content || []);
        setTotalPages(listingsData.totalPages || 0);
        setTotalElements(listingsData.totalElements || 0);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchListings();
  };

  const handleToggleStatus = async (listingId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      
      const response = await fetch(`${API_BASE_URL}/admin/listings/${listingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: (!currentStatus).toString() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update listing status');
      }

      toast.success(`Listing ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchListings();
    } catch (error) {
      console.error('Error updating listing status:', error);
      toast.error('Failed to update listing status');
    }
  };

  const handleTogglePopular = async (listingId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      
      const response = await fetch(`${API_BASE_URL}/admin/listings/${listingId}/popular`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: (!currentStatus).toString() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update listing popularity');
      }

      toast.success(`Listing ${!currentStatus ? 'marked as popular' : 'removed from popular'}`);
      fetchListings();
    } catch (error) {
      console.error('Error updating listing popularity:', error);
      toast.error('Failed to update listing popularity');
    }
  };

  const handleToggleTrending = async (listingId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      
      const response = await fetch(`${API_BASE_URL}/admin/listings/${listingId}/trending`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: (!currentStatus).toString() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update listing trending status');
      }

      toast.success(`Listing ${!currentStatus ? 'marked as trending' : 'removed from trending'}`);
      fetchListings();
    } catch (error) {
      console.error('Error updating listing trending status:', error);
      toast.error('Failed to update listing trending status');
    }
  };

  const handleDeleteClick = (listingId: string) => {
    setListingToDelete(listingId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      
      const response = await fetch(`${API_BASE_URL}/admin/listings/${listingToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }

      toast.success('Listing deleted successfully');
      setDeleteDialogOpen(false);
      setListingToDelete(null);
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading listings...</p>
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
                <h1 className="text-2xl font-bold">All Listings</h1>
                <p className="text-sm text-muted-foreground">
                  {totalElements} total listings
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={fetchListings} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="package">Packages</SelectItem>
                      <SelectItem value="item">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Input
                    placeholder="Category ID (optional)"
                    value={categoryFilter === 'all' ? '' : categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value || 'all')}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Listings List */}
        {listings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No listings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold">{listing.name}</h3>
                        <Badge variant={listing.type === 'PACKAGE' ? 'default' : 'secondary'}>
                          {listing.type === 'PACKAGE' ? 'Package' : 'Service'}
                        </Badge>
                        {listing.isActive ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        {listing.isPopular && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {listing.isTrending && (
                          <Badge variant="outline" className="border-blue-500 text-blue-600">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span>
                          Price: {formatCurrency(listing.price)}
                        </span>
                        {listing.listingCategory && (
                          <span>
                            Category: {listing.listingCategory.name}
                          </span>
                        )}
                        {listing.vendor && (
                          <span>
                            Vendor: {listing.vendor.businessName}
                          </span>
                        )}
                        {listing.images && listing.images.length > 0 && (
                          <span>
                            Images: {listing.images.length}
                          </span>
                        )}
                      </div>
                      
                      {listing.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {listing.description}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Created: {format(new Date(listing.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(listing.id, listing.isActive)}
                      >
                        {listing.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePopular(listing.id, listing.isPopular)}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        {listing.isPopular ? 'Unmark Popular' : 'Mark Popular'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleTrending(listing.id, listing.isTrending)}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {listing.isTrending ? 'Unmark Trending' : 'Mark Trending'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(listing.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setListingToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}




