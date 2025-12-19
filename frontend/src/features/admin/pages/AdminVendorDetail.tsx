import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Store,
  Package,
  ShoppingCart,
  MessageSquare,
  Star,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Image as ImageIcon,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  portfolioImages?: string[];
  coverageRadius: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
  userFullName?: string;
  userPhone?: string;
  totalListings: number;
  activeListings: number;
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
  createdAt: string;
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

export default function AdminVendorDetail() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails();
    }
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
      const response = await fetch(`${API_BASE_URL}/admin/vendors/${vendorId}/details`, {
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
        throw new Error('Failed to fetch vendor details');
      }

      const data = await response.json();
      if (data.success) {
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Vendor verified successfully');
        fetchVendorDetails();
      } else {
        toast.error('Failed to verify vendor');
      }
    } catch (error) {
      console.error('Error verifying vendor:', error);
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: String(isActive) }),
      });

      if (response.ok) {
        toast.success(`Vendor ${isActive ? 'activated' : 'deactivated'} successfully`);
        fetchVendorDetails();
      } else {
        toast.error('Failed to update vendor status');
      }
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast.error('Failed to update vendor status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Vendor not found</p>
          <Button onClick={() => navigate('/admin/vendors')}>Back to Vendors</Button>
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/vendors')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vendors
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{vendor.businessName}</h1>
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
                <p className="text-sm text-muted-foreground">
                  {vendor.categoryName || vendor.customCategoryName} • {vendor.cityName || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!vendor.isVerified && (
                <Button onClick={handleVerify} variant="outline">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verify Vendor
                </Button>
              )}
              <Button
                onClick={() => handleStatusChange(!vendor.isActive)}
                variant={vendor.isActive ? "destructive" : "default"}
              >
                {vendor.isActive ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={fetchVendorDetails} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendor.totalListings}</div>
              <p className="text-xs text-muted-foreground">{vendor.activeListings} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendor.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {vendor.completedOrders} completed, {vendor.pendingOrders} pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(vendor.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(vendor.monthlyRevenue)} this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4" />
                Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendor.rating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">{vendor.totalReviews} reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings ({vendor.listings.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({vendor.reviews.length})</TabsTrigger>
            <TabsTrigger value="orders">Orders ({vendor.orders.length})</TabsTrigger>
            <TabsTrigger value="leads">Leads ({vendor.leads.length})</TabsTrigger>
            <TabsTrigger value="faqs">FAQs ({vendor.faqs.length})</TabsTrigger>
            <TabsTrigger value="events">Past Events ({vendor.pastEvents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Business Name</p>
                    <p className="text-base">{vendor.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-base">{vendor.categoryName || vendor.customCategoryName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City</p>
                    <p className="text-base">{vendor.cityName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Coverage Radius</p>
                    <p className="text-base">{vendor.coverageRadius} km</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Starting Price</p>
                    <p className="text-base">{formatCurrency(vendor.startingPrice)}</p>
                  </div>
                  {vendor.bio && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bio</p>
                      <p className="text-base">{vendor.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {vendor.userEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-base">{vendor.userEmail}</p>
                      </div>
                    </div>
                  )}
                  {vendor.userFullName && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                        <p className="text-base">{vendor.userFullName}</p>
                      </div>
                    </div>
                  )}
                  {vendor.userPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-base">{vendor.userPhone}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="text-base font-mono text-xs">{vendor.userId}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Images */}
            {vendor.portfolioImages && vendor.portfolioImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Portfolio Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vendor.portfolioImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Portfolio ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Leads</p>
                    <p className="text-2xl font-bold">{vendor.totalLeads}</p>
                    <p className="text-xs text-muted-foreground">{vendor.newLeads} new (30d)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                    <p className="text-2xl font-bold">{vendor.totalReviews}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm">{format(new Date(vendor.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{format(new Date(vendor.updatedAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {vendor.listings.length === 0 ? (
                  <p className="text-muted-foreground">No listings found</p>
                ) : (
                  <div className="space-y-2">
                    {vendor.listings.map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{listing.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {listing.type} • {formatCurrency(listing.price)} • {listing.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <Badge variant={listing.isActive ? "default" : "secondary"}>
                          {listing.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {vendor.reviews.length === 0 ? (
                  <p className="text-muted-foreground">No reviews found</p>
                ) : (
                  <div className="space-y-4">
                    {vendor.reviews.map((review) => (
                      <div key={review.id} className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.userName || 'Anonymous'}</span>
                            {review.isVerified && (
                              <Badge variant="default" className="bg-green-500 text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{review.rating}</span>
                          </div>
                        </div>
                        {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(review.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {vendor.orders.length === 0 ? (
                  <p className="text-muted-foreground">No orders found</p>
                ) : (
                  <div className="space-y-2">
                    {vendor.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(order.totalAmount)} • {format(new Date(order.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge>{order.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Leads</CardTitle>
              </CardHeader>
              <CardContent>
                {vendor.leads.length === 0 ? (
                  <p className="text-muted-foreground">No leads found</p>
                ) : (
                  <div className="space-y-2">
                    {vendor.leads.map((lead) => (
                      <div key={lead.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{lead.name}</p>
                          <Badge>{lead.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                        {lead.phone && <p className="text-sm text-muted-foreground">{lead.phone}</p>}
                        {lead.eventType && <p className="text-sm text-muted-foreground">Event: {lead.eventType}</p>}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faqs">
            <Card>
              <CardHeader>
                <CardTitle>FAQs</CardTitle>
              </CardHeader>
              <CardContent>
                {vendor.faqs.length === 0 ? (
                  <p className="text-muted-foreground">No FAQs found</p>
                ) : (
                  <div className="space-y-4">
                    {vendor.faqs.map((faq) => (
                      <div key={faq.id} className="border rounded-md p-4">
                        <p className="font-medium mb-2">{faq.question}</p>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Past Events</CardTitle>
              </CardHeader>
              <CardContent>
                {vendor.pastEvents.length === 0 ? (
                  <p className="text-muted-foreground">No past events found</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vendor.pastEvents.map((event) => (
                      <div key={event.id} className="border rounded-md overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.eventType || 'Past event'}
                          className="w-full h-32 object-cover"
                        />
                        {event.eventType && (
                          <div className="p-2">
                            <p className="text-sm font-medium">{event.eventType}</p>
                            {event.eventDate && (
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(event.eventDate), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}





