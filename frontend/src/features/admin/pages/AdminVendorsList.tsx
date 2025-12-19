import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { 
  ArrowLeft, 
  Search, 
  Store, 
  CheckCircle2, 
  XCircle,
  Eye,
  RefreshCw,
  Filter
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

interface VendorsResponse {
  content: Vendor[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export default function AdminVendorsList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendors();
  }, [page, searchQuery]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      const url = `${API_BASE_URL}/admin/vendors?page=${page}&size=${size}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
      
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
                  {totalElements} total vendors
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={fetchVendors} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
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

        {/* Vendors List */}
        {vendors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No vendors found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{vendor.businessName}</h3>
                        {vendor.isVerified && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {!vendor.isActive && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span>
                          Category: {vendor.customCategoryName || vendor.vendorCategory?.name || 'N/A'}
                        </span>
                        {vendor.cityName && (
                          <span>City: {vendor.cityName}</span>
                        )}
                        <span>
                          Rating: {vendor.rating.toFixed(1)} ⭐ ({vendor.reviewCount} reviews)
                        </span>
                        <span>
                          Starting Price: {formatCurrency(vendor.startingPrice)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Created: {format(new Date(vendor.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => navigate(`/admin/vendors/${vendor.id}`)}
                      className="ml-4"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
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
    </div>
  );
}





