import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { 
  ArrowLeft, RefreshCw, Eye, ExternalLink, AlertCircle, Sparkles, TrendingUp,
  Edit, Building2, Clock, Package
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Listing {
  id: string;
  name: string;
  description?: string;
  type: string;
  price: number;
  isActive: boolean;
  isDraft?: boolean;
  isPopular?: boolean;
  isTrending?: boolean;
  images?: string[];
  vendor?: { id: string; businessName: string };
  listingCategory?: { id: string; name: string; displayName?: string };
  createdAt: string;
  updatedAt: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export default function AdminListingEdit() {
  const { listingId } = useParams<{ listingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check if we should redirect to vendor edit page
  const editMode = searchParams.get('mode') === 'full';

  useEffect(() => {
    if (listingId) fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      const response = await fetch(`${API_BASE_URL}/admin/listings/${listingId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch listing');
      }

      const data = await response.json();
      if (data.success) {
        setListing(data.data);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast.error('Failed to fetch listing');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (field: string, value: boolean) => {
    if (!listing) return;
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      
      let endpoint = '';
      let body: any = {};
      
      if (field === 'isActive') {
        endpoint = `${API_BASE_URL}/admin/listings/${listing.id}/status`;
        body = { status: String(value) };
      } else if (field === 'isPopular') {
        endpoint = `${API_BASE_URL}/admin/listings/${listing.id}/popular`;
        body = { value: String(value) };
      } else if (field === 'isTrending') {
        endpoint = `${API_BASE_URL}/admin/listings/${listing.id}/trending`;
        body = { value: String(value) };
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success('Updated successfully');
        setListing(prev => prev ? { ...prev, [field]: value } : null);
      } else {
        toast.error('Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  // Open admin's full listing edit page
  const openFullEditPage = () => {
    if (listing) {
      navigate(`/admin/listings/${listing.id}/full-edit`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Listing Not Found</h2>
            <Button onClick={() => navigate('/admin/listings')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{listing.name}</h1>
                  <Badge variant="outline">{listing.type === 'PACKAGE' ? 'Package' : 'Service'}</Badge>
                </div>
                {listing.vendor && (
                  <p className="text-sm text-muted-foreground">by {listing.vendor.businessName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(`/listing/${listing.id}`, '_blank')}>
                <Eye className="h-4 w-4 mr-2" /> Customer View
              </Button>
              <Button onClick={openFullEditPage} className="bg-primary">
                <Edit className="h-4 w-4 mr-2" /> Full Edit Mode
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Listing Preview Card */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{listing.name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{listing.type === 'PACKAGE' ? 'Package' : 'Service'}</Badge>
                        {listing.listingCategory && (
                          <Badge variant="secondary">{listing.listingCategory.displayName || listing.listingCategory.name}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">{formatCurrency(listing.price)}</p>
                    </div>
                  </div>
                  {listing.description && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <Label className="text-muted-foreground">Description</Label>
                        <p className="mt-1">{listing.description}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Full Edit Button */}
            <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
              <CardContent className="py-8 text-center">
                <Edit className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Need to edit listing content?</h3>
                <p className="text-muted-foreground mb-4">
                  Use the full edit mode to modify all listing details including images, highlights, inclusions, and category-specific fields.
                </p>
                <Button onClick={openFullEditPage} size="lg">
                  <Edit className="h-4 w-4 mr-2" /> Open Full Edit Mode
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Admin Controls */}
          <div className="space-y-6">
            {/* Status Controls */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold">Admin Controls</h3>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>Active Status</Label>
                    <p className="text-sm text-muted-foreground">Visible to customers</p>
                  </div>
                  <Switch
                    checked={listing.isActive}
                    onCheckedChange={(checked) => updateStatus('isActive', checked)}
                    disabled={saving}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <div>
                      <Label>Popular</Label>
                      <p className="text-sm text-muted-foreground">Show in popular section</p>
                    </div>
                  </div>
                  <Switch
                    checked={listing.isPopular || false}
                    onCheckedChange={(checked) => updateStatus('isPopular', checked)}
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <div>
                      <Label>Trending</Label>
                      <p className="text-sm text-muted-foreground">Show in trending section</p>
                    </div>
                  </div>
                  <Switch
                    checked={listing.isTrending || false}
                    onCheckedChange={(checked) => updateStatus('isTrending', checked)}
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vendor Info */}
            {listing.vendor && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4" />
                    <h3 className="font-semibold">Vendor</h3>
                  </div>
                  <p className="font-medium">{listing.vendor.businessName}</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm"
                    onClick={() => navigate(`/admin/vendors/${listing.vendor?.id}`)}
                  >
                    View Vendor Profile →
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" />
                  <h3 className="font-semibold">Metadata</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{format(new Date(listing.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span>{format(new Date(listing.updatedAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID</span>
                    <span className="font-mono text-xs">{listing.id.substring(0, 8)}...</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="pt-6 space-y-2">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`/listing/${listing.id}`, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" /> View as Customer
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={fetchListing}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
