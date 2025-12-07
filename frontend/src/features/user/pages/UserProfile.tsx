import { useState } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Navbar } from '@/features/home/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { 
  User, 
  ShoppingBag, 
  CreditCard, 
  Star, 
  Settings, 
  MapPin, 
  Edit2,
  Check,
  X,
  Calendar,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Phone,
  UserCircle,
  LogOut,
  Trash2,
  Shield,
  HelpCircle,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/hooks/use-toast';
import { customerApi } from '@/shared/services/api';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';

// Helper functions for status badges
const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
    'pending': { label: 'Pending', variant: 'outline', icon: Clock },
    'confirmed': { label: 'Confirmed', variant: 'default', icon: CheckCircle2 },
    'in-progress': { label: 'In Progress', variant: 'secondary', icon: Truck },
    'completed': { label: 'Completed', variant: 'default', icon: CheckCircle2 },
    'cancelled': { label: 'Cancelled', variant: 'destructive', icon: XCircle },
  };
  const statusInfo = statusMap[status.toLowerCase()] || { label: status, variant: 'outline', icon: Clock };
  const Icon = statusInfo.icon;
  return (
    <Badge variant={statusInfo.variant} className="gap-1.5">
      <Icon className="h-3 w-3" />
      {statusInfo.label}
    </Badge>
  );
};

const getPaymentStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'pending': { label: 'Pending', variant: 'outline' },
    'partial': { label: 'Partial', variant: 'secondary' },
    'paid': { label: 'Paid', variant: 'default' },
    'refunded': { label: 'Refunded', variant: 'destructive' },
  };
  const statusInfo = statusMap[status.toLowerCase()] || { label: status, variant: 'outline' };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
};

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['customerOrders'],
    queryFn: async () => {
      const response = await customerApi.getOrders();
      return response.success ? response.data : [];
    },
    enabled: activeTab === 'orders',
  });

  const orders = ordersData || [];

  // Get user initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'reviews', label: 'My Reviews', icon: Star },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto shadow-md">
            <CardContent className="p-8 text-center">
              <UserCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h2 className="text-xl font-bold mb-1.5">Welcome Back!</h2>
              <p className="text-sm text-muted-foreground mb-4">Please log in to view your profile.</p>
              <Button onClick={() => navigate('/login')} size="sm" className="w-full">
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-14 w-14 border-2 border-background shadow-md">
              <AvatarFallback className="text-base font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{user.fullName || 'User'}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <Card className="sticky top-20 shadow-md border">
              <CardContent className="p-3">
                <nav className="space-y-0.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200 group text-sm',
                          activeTab === item.id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-muted'
                        )}
                      >
                        <Icon className={cn(
                          'h-4 w-4 transition-transform group-hover:scale-105',
                          activeTab === item.id ? 'text-primary-foreground' : 'text-muted-foreground'
                        )} />
                        <span className="font-medium">{item.label}</span>
                        {activeTab === item.id && (
                          <ChevronRight className="h-3 w-3 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && <ProfileInformation user={user} />}
            {activeTab === 'orders' && <MyOrders orders={orders} loading={ordersLoading} />}
            {activeTab === 'payments' && <PaymentMethods />}
            {activeTab === 'reviews' && <MyReviews />}
            {activeTab === 'settings' && <AccountSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Information Component
const ProfileInformation = ({ user }: { user: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    gender: user.gender || '',
  });
  const { toast } = useToast();

  const handleSave = () => {
    // TODO: Implement profile update API call
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been updated successfully.',
    });
    setIsEditing(false);
  };

  return (
    <Card className="shadow-md border">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your personal details and preferences</p>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1.5 h-8">
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="gap-1.5 h-8">
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-1.5 h-8">
                <Check className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Full Name
            </Label>
            {isEditing ? (
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1.5 h-9 text-sm"
              />
            ) : (
              <p className="mt-1.5 text-sm font-medium">{formData.fullName || 'Not set'}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email Address
            </Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1.5 h-9 text-sm"
              />
            ) : (
              <p className="mt-1.5 text-sm font-medium">{formData.email || 'Not set'}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Mobile Number
            </Label>
            {isEditing ? (
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1.5 h-9 text-sm"
              />
            ) : (
              <p className="mt-1.5 text-sm font-medium">{formData.phone || 'Not set'}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gender" className="text-sm font-medium flex items-center gap-1.5">
              <UserCircle className="h-3.5 w-3.5" />
              Gender
            </Label>
            {isEditing ? (
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="mt-1.5 text-sm font-medium capitalize">{formData.gender || 'Not set'}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// My Orders Component
const MyOrders = ({ orders, loading }: { orders: any[]; loading: boolean }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="shadow-md border">
        <CardContent className="p-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading your orders...</p>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="shadow-md border">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-4">
          <CardTitle className="text-lg">My Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-10 text-center">
          <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">No orders yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Start exploring vendors and book your first event!</p>
          <Button onClick={() => navigate('/search')} size="sm" className="gap-1.5">
            <ShoppingBag className="h-4 w-4" />
            Browse Vendors
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-4">
        <CardTitle className="text-lg">My Orders</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">View and track all your orders</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="border hover:shadow-md transition-all duration-200 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-base font-bold">Order #{order.orderNumber}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Status:</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Payment:</span>
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                      {order.eventDate && (
                        <>
                          <span>•</span>
                          <span>Event: {format(new Date(order.eventDate), 'MMM dd, yyyy')}</span>
                          {order.eventTime && <span>at {order.eventTime}</span>}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary mb-1.5">₹{order.totalAmount?.toLocaleString()}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="gap-1.5 h-8"
                    >
                      View Details
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                    <div className="bg-primary/10 p-1.5 rounded-lg">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Service</p>
                      <p className="text-sm font-semibold">{order.listing?.name}</p>
                      <p className="text-xs text-muted-foreground">{order.vendor?.businessName}</p>
                    </div>
                  </div>
                  {order.eventDate && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                      <div className="bg-primary/10 p-1.5 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">Event Date & Time</p>
                        <p className="text-sm font-semibold">
                          {format(new Date(order.eventDate), 'MMM dd, yyyy')}
                        </p>
                        {order.eventTime ? (
                          <p className="text-xs text-muted-foreground">{order.eventTime}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Time TBD</p>
                        )}
                      </div>
                    </div>
                  )}
                  {order.venueAddress && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                      <div className="bg-primary/10 p-1.5 rounded-lg">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">Venue</p>
                        <p className="text-sm font-semibold line-clamp-2">
                          {order.venueAddress}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Payment Methods Component
const PaymentMethods = () => {
  return (
    <Card className="shadow-md border">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-4">
        <CardTitle className="text-lg">Payment Methods</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your saved payment methods</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Card className="border hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Saved Cards</p>
                    <p className="text-xs text-muted-foreground">No saved cards yet</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 h-8">
                  <CreditCard className="h-3.5 w-3.5" />
                  Add Card
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Saved UPI</p>
                    <p className="text-xs text-muted-foreground">No saved UPI IDs yet</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 h-8">
                  <CreditCard className="h-3.5 w-3.5" />
                  Add UPI
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

// My Reviews Component
const MyReviews = () => {
  return (
    <Card className="shadow-md border">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-4">
        <CardTitle className="text-lg">My Reviews & Ratings</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">Reviews you've written for vendors</p>
      </CardHeader>
      <CardContent className="p-10 text-center">
        <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Star className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1.5">No reviews yet</h3>
        <p className="text-sm text-muted-foreground">Reviews you write will appear here.</p>
      </CardContent>
    </Card>
  );
};

// Account Settings Component
const AccountSettings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  return (
    <Card className="shadow-md border">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-4">
        <CardTitle className="text-lg">Account Settings</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your account preferences and security</p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            Account Actions
          </h3>
          <div className="space-y-1.5">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-9 text-sm" 
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm text-destructive hover:text-destructive">
              <Shield className="h-3.5 w-3.5" />
              Deactivate Account
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm text-destructive hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
              Delete Account
            </Button>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-semibold text-sm mb-1.5">What happens when I update my email address?</p>
              <p className="text-xs text-muted-foreground">
                Your login email will change. You'll receive all account-related communication on your updated email address.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-semibold text-sm mb-1.5">When will my account be updated?</p>
              <p className="text-xs text-muted-foreground">
                It happens as soon as you confirm the verification code sent to your email and save the changes.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-semibold text-sm mb-1.5">What happens to my existing account when I update my email?</p>
              <p className="text-xs text-muted-foreground">
                Updating your email doesn't invalidate your account. Your account remains fully functional. You'll continue seeing your order history and saved information.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
