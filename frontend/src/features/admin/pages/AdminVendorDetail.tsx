import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { 
  ArrowLeft, CheckCircle2, XCircle, RefreshCw, Package, ShoppingCart, Star, DollarSign,
  Users, MapPin, Phone, Mail, Globe, Instagram, Calendar, Eye, Edit, ExternalLink,
  TrendingUp, Clock, AlertCircle, MoreVertical, Building2, Award, MessageSquare,
  FileText, Image as ImageIcon, ChevronRight, Sparkles, Shield, Activity, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/shared/components/ui/dropdown-menu';
import { Progress } from '@/shared/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';

interface VendorDetail {
  id: string;
  userId: string;
  businessName: string;
  categoryId: string;
  categoryName: string;
  customCategoryName?: string;
  cityId?: string;
  cityName?: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  coverImage?: string;
  profileImage?: string;
  portfolioImages?: string[];
  coverageRadius: number;
  serviceRadiusKm?: number;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  instagram?: string;
  website?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
  userFullName?: string;
  userPhone?: string;
  totalListings: number;
  activeListings: number;
  draftListings?: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalLeads: number;
  newLeads: number;
  totalReviews: number;
  totalRevenue: number;
  monthlyRevenue: number;
  listings: ListingSummary[];
  reviews: ReviewSummary[];
  leads: LeadSummary[];
  orders: OrderSummary[];
  faqs: FAQSummary[];
  pastEvents: PastEventSummary[];
  availabilitySlots: AvailabilitySummary[];
}

interface ListingSummary {
  id: string;
  name: string;
  type: string;
  price: number;
  isActive: boolean;
  isDraft?: boolean;
  createdAt: string;
  description?: string;
  images?: string[];
}

interface ReviewSummary {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
}

interface LeadSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  eventType?: string;
  createdAt: string;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customerName?: string;
}

interface FAQSummary {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
}

interface PastEventSummary {
  id: string;
  image: string;
  eventType?: string;
  eventDate?: string;
}

interface AvailabilitySummary {
  id: string;
  date?: string;
  timeSlot: string;
  status: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'CONFIRMED': 'bg-blue-100 text-blue-800 border-blue-200',
    'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
    'CANCELLED': 'bg-red-100 text-red-800 border-red-200',
    'NEW': 'bg-purple-100 text-purple-800 border-purple-200',
    'CONTACTED': 'bg-blue-100 text-blue-800 border-blue-200',
    'CONVERTED': 'bg-green-100 text-green-800 border-green-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Stat Card Component
function StatCard({ icon: Icon, label, value, subValue, trend, color = 'primary' }: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  color?: 'primary' | 'green' | 'yellow' | 'red' | 'blue';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subValue && (
              <p className="text-xs text-muted-foreground">{subValue}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1">
            <TrendingUp className={`h-3 w-3 ${trend >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
            <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Listing Card Component
function ListingCard({ listing, onView, onEdit, onPreview, onAdminPage }: {
  listing: ListingSummary;
  onView: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onAdminPage?: () => void;
}) {
  // Determine the status to display - explicitly check for true
  const isDraft = listing.isDraft === true;
  
  const getStatusBadge = () => {
    if (isDraft) {
      return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Draft</Badge>;
    }
    if (listing.isActive) {
      return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
    }
    return <Badge className="bg-gray-400">Inactive</Badge>;
  };

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200 border-l-4",
      isDraft 
        ? "border-l-amber-500 bg-amber-50/30" 
        : listing.isActive 
          ? "border-l-green-500" 
          : "border-l-gray-400 bg-gray-50/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0 relative">
            {listing.images?.[0] ? (
              <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
            {isDraft && (
              <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-1 rounded">DRAFT</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-base truncate">{listing.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {listing.type === 'PACKAGE' ? 'Package' : 'Service'}
                  </Badge>
                  <span className="text-sm font-medium text-primary">{formatCurrency(listing.price)}</span>
                </div>
              </div>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {listing.description || 'No description available'}
            </p>
            <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="default" onClick={onEdit} className="h-7 text-xs bg-primary">
                <Edit className="h-3 w-3 mr-1" /> Full Edit
              </Button>
              <Button size="sm" variant="outline" onClick={onView} className="h-7 text-xs">
                <Eye className="h-3 w-3 mr-1" /> Customer View
              </Button>
              {onAdminPage && (
                <Button size="sm" variant="ghost" onClick={onAdminPage} className="h-7 text-xs">
                  <Settings className="h-3 w-3 mr-1" /> Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminVendorDetail() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<ListingSummary | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (vendorId) fetchVendorDetails(true); // Always refresh on initial load
  }, [vendorId]);

  const fetchVendorDetails = async (refresh: boolean = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      const response = await fetch(`${API_BASE_URL}/admin/vendors/${vendorId}/details?refresh=${refresh}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch vendor details');
      }

      const data = await response.json();
      if (data.success) {
        // Debug: Log the full response to see all values
        console.log('=== VENDOR DETAILS API RESPONSE ===');
        console.log('Full data:', JSON.stringify(data.data, null, 2));
        console.log('Statistics from API:');
        console.log('  - totalListings:', data.data.totalListings);
        console.log('  - activeListings:', data.data.activeListings);
        console.log('Listings array length:', data.data.listings?.length);
        console.log('Listings details:');
        data.data.listings?.forEach((l: any, i: number) => {
          console.log(`  [${i}] id=${l.id}, name="${l.name}", isActive=${l.isActive}, isDraft=${l.isDraft}`);
        });
        setVendor(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      toast.error('Failed to fetch vendor details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!vendor) return;
    try {
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      const response = await fetch(`${API_BASE_URL}/admin/vendors/${vendor.id}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast.success('Vendor verified successfully');
        fetchVendorDetails();
      } else {
        toast.error('Failed to verify vendor');
      }
    } catch (error) {
      toast.error('Failed to verify vendor');
    }
  };

  const handleStatusChange = async (isActive: boolean) => {
    if (!vendor) return;
    try {
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      const response = await fetch(`${API_BASE_URL}/admin/vendors/${vendor.id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: String(isActive) }),
      });

      if (response.ok) {
        toast.success(`Vendor ${isActive ? 'activated' : 'deactivated'} successfully`);
        fetchVendorDetails();
      } else {
        toast.error('Failed to update vendor status');
      }
    } catch (error) {
      toast.error('Failed to update vendor status');
    }
  };

  const openListingPreview = (listing: ListingSummary) => {
    setSelectedListing(listing);
    setPreviewOpen(true);
  };

  const openListingCustomerView = (listingId: string) => {
    window.open(`/listing/${listingId}`, '_blank');
  };

  const openListingEdit = (listingId: string) => {
    // Navigate to admin's full edit page
    navigate(`/admin/listings/${listingId}/full-edit`);
  };

  const openAdminListingPage = (listingId: string) => {
    // Navigate to admin listing page for status controls
    navigate(`/admin/listings/${listingId}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
            <RefreshCw className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Vendor Not Found</h2>
            <p className="text-muted-foreground">The vendor you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/admin/vendors')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Vendors
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionRate = vendor.totalOrders > 0 
    ? Math.round((vendor.completedOrders / vendor.totalOrders) * 100) 
    : 0;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Hero Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-purple-500/20 relative overflow-hidden">
            {vendor.coverImage && (
              <img src={vendor.coverImage} alt="Cover" className="w-full h-full object-cover opacity-50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>

          {/* Header Content */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-20">
              <div className="bg-card rounded-2xl shadow-xl border p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                      <AvatarImage src={vendor.profileImage || vendor.coverImage} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {vendor.businessName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold">{vendor.businessName}</h1>
                        {vendor.isVerified && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge className="bg-green-500 hover:bg-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>This vendor is verified</TooltipContent>
                          </Tooltip>
                        )}
                        <Badge variant={vendor.isActive ? "default" : "destructive"}>
                          {vendor.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {vendor.categoryName || vendor.customCategoryName}
                        </span>
                        {vendor.cityName && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {vendor.cityName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({vendor.reviewCount} reviews)</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-sm">Starting at <span className="font-semibold text-primary">{formatCurrency(vendor.startingPrice)}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:ml-auto flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/vendors')}>
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    {!vendor.isVerified && (
                      <Button onClick={handleVerify} size="sm" className="bg-green-500 hover:bg-green-600">
                        <Shield className="h-4 w-4 mr-2" /> Verify Vendor
                      </Button>
                    )}
                    <Button
                      onClick={() => handleStatusChange(!vendor.isActive)}
                      variant={vendor.isActive ? "destructive" : "default"}
                      size="sm"
                    >
                      {vendor.isActive ? (
                        <><XCircle className="h-4 w-4 mr-2" /> Deactivate</>
                      ) : (
                        <><CheckCircle2 className="h-4 w-4 mr-2" /> Activate</>
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => fetchVendorDetails(true)}>
                          <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/vendor/${vendor.id}`, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" /> View Public Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <AlertCircle className="h-4 w-4 mr-2" /> Report Issue
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Contact Info Bar */}
                <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 text-sm">
                  {vendor.phone && (
                    <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-4 w-4" /> {vendor.phone}
                    </a>
                  )}
                  {vendor.email && (
                    <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="h-4 w-4" /> {vendor.email}
                    </a>
                  )}
                  {vendor.instagram && (
                    <a href={`https://instagram.com/${vendor.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-pink-500 transition-colors">
                      <Instagram className="h-4 w-4" /> @{vendor.instagram}
                    </a>
                  )}
                  {vendor.website && (
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <Globe className="h-4 w-4" /> Website
                    </a>
                  )}
                  {vendor.locationName && (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" /> {vendor.locationName}
                      {vendor.serviceRadiusKm && <span className="text-xs">({vendor.serviceRadiusKm}km radius)</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-8">
            <StatCard icon={Package} label="Listings" value={vendor.totalListings} subValue={`${vendor.activeListings} active`} color="blue" />
            <StatCard icon={ShoppingCart} label="Orders" value={vendor.totalOrders} subValue={`${vendor.completedOrders} completed`} color="green" />
            <StatCard icon={DollarSign} label="Revenue" value={formatCurrency(vendor.totalRevenue)} subValue={`${formatCurrency(vendor.monthlyRevenue)} this month`} color="primary" />
            <StatCard icon={Users} label="Leads" value={vendor.totalLeads} subValue={`${vendor.newLeads} new (30d)`} color="yellow" />
            <StatCard icon={Star} label="Rating" value={vendor.rating.toFixed(1)} subValue={`${vendor.totalReviews} reviews`} color="primary" />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background">Overview</TabsTrigger>
              <TabsTrigger value="listings" className="data-[state=active]:bg-background">
                Listings <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">{vendor.listings.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-background">
                Orders <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">{vendor.orders.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-background">
                Reviews <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">{vendor.reviews.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="leads" className="data-[state=active]:bg-background">
                Leads <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">{vendor.leads.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="faqs" className="data-[state=active]:bg-background">FAQs</TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:bg-background">Gallery</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Business Info */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" /> Business Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {vendor.bio && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">About</p>
                        <p className="text-sm leading-relaxed">{vendor.bio}</p>
                      </div>
                    )}
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                        <p className="font-medium">{vendor.categoryName || vendor.customCategoryName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p className="font-medium">{vendor.locationName || vendor.cityName || 'Not specified'}</p>
                        {vendor.locationLat && vendor.locationLng && (
                          <p className="text-xs text-muted-foreground">
                            ({Number(vendor.locationLat).toFixed(4)}, {Number(vendor.locationLng).toFixed(4)})
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Service Radius</p>
                        <p className="font-medium">{vendor.serviceRadiusKm || vendor.coverageRadius || 25} km</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Starting Price</p>
                        <p className="font-medium text-primary">{formatCurrency(vendor.startingPrice)}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Member Since</p>
                        <p className="font-medium">{format(new Date(vendor.createdAt), 'MMMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Updated</p>
                        <p className="font-medium">{formatDistanceToNow(new Date(vendor.updatedAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" /> Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Order Completion</span>
                        <span className="font-medium">{completionRate}%</span>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Response Rate</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Excellent</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                        <span className="text-sm font-medium">~2 hours</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Profile Completeness</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" /> Account Owner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{vendor.userFullName?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{vendor.userFullName || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{vendor.userEmail}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">User ID</p>
                      <p className="font-mono text-xs">{vendor.userId.substring(0, 8)}...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Listings Tab */}
            <TabsContent value="listings" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">All Listings</h3>
                  <p className="text-sm text-muted-foreground">
                    {vendor.activeListings} active, {vendor.draftListings ?? vendor.listings.filter(l => l.isDraft === true).length} drafts out of {vendor.totalListings} total
                  </p>
                </div>
              </div>
              {vendor.listings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No listings found for this vendor</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {vendor.listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onView={() => openListingCustomerView(listing.id)}
                      onEdit={() => openListingEdit(listing.id)}
                      onPreview={() => openListingPreview(listing)}
                      onAdminPage={() => openAdminListingPage(listing.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {vendor.orders.length === 0 ? (
                    <div className="py-8 text-center">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vendor.orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <ShoppingCart className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                {order.customerName && ` • ${order.customerName}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Customer Reviews</CardTitle>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-bold">{vendor.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({vendor.totalReviews} reviews)</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {vendor.reviews.length === 0 ? (
                    <div className="py-8 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">No reviews yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vendor.reviews.map((review) => (
                        <div key={review.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{review.userName?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{review.userName || 'Anonymous'}</span>
                                  {review.isVerified && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Verified</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{format(new Date(review.createdAt), 'MMM d, yyyy')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                          {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leads Tab */}
            <TabsContent value="leads" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  {vendor.leads.length === 0 ? (
                    <div className="py-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">No leads yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vendor.leads.map((lead) => (
                        <div key={lead.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{lead.name}</p>
                              <p className="text-sm text-muted-foreground">{lead.email}</p>
                              {lead.phone && <p className="text-sm text-muted-foreground">{lead.phone}</p>}
                              {lead.eventType && (
                                <Badge variant="outline" className="mt-2 text-xs">{lead.eventType}</Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                              <p className="text-xs text-muted-foreground mt-2">{format(new Date(lead.createdAt), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQs Tab */}
            <TabsContent value="faqs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  {vendor.faqs.length === 0 ? (
                    <div className="py-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">No FAQs added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vendor.faqs.map((faq, index) => (
                        <div key={faq.id} className="p-4 border rounded-lg">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium mb-2">{faq.question}</p>
                              <p className="text-sm text-muted-foreground">{faq.answer}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Portfolio Images */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" /> Portfolio Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vendor.portfolioImages && vendor.portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {vendor.portfolioImages.map((img, idx) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                            <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">No portfolio images</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Past Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" /> Past Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vendor.pastEvents.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {vendor.pastEvents.map((event) => (
                          <div key={event.id} className="rounded-lg overflow-hidden border">
                            <div className="aspect-video bg-muted">
                              <img src={event.image} alt={event.eventType || 'Past event'} className="w-full h-full object-cover" />
                            </div>
                            {event.eventType && (
                              <div className="p-2">
                                <p className="text-sm font-medium truncate">{event.eventType}</p>
                                {event.eventDate && (
                                  <p className="text-xs text-muted-foreground">{format(new Date(event.eventDate), 'MMM yyyy')}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">No past events</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Listing Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" /> Listing Preview
              </DialogTitle>
            </DialogHeader>
            {selectedListing && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 pr-4">
                  {/* Listing Image */}
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    {selectedListing.images?.[0] ? (
                      <img src={selectedListing.images[0]} alt={selectedListing.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Listing Details */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{selectedListing.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{selectedListing.type === 'PACKAGE' ? 'Package' : 'Service'}</Badge>
                          <Badge className={selectedListing.isActive ? 'bg-green-500' : 'bg-gray-400'}>
                            {selectedListing.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{formatCurrency(selectedListing.price)}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{selectedListing.description || 'No description available'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                      <p className="text-sm">{format(new Date(selectedListing.createdAt), 'MMMM d, yyyy')}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button className="flex-1" onClick={() => { setPreviewOpen(false); openListingCustomerView(selectedListing.id); }}>
                      <ExternalLink className="h-4 w-4 mr-2" /> View as Customer
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => { setPreviewOpen(false); openListingEdit(selectedListing.id); }}>
                      <Edit className="h-4 w-4 mr-2" /> Edit Listing
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
