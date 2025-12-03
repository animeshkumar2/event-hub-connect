import { useState } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Zap,
  Upload,
  Instagram,
  ImagePlus,
  MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { categories, validateListingCategory, suggestCategoryForListing, eventTypes } from '@/shared/constants/mockData';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  billingType: string;
  image: string;
  instantBook: boolean;
  status: 'active' | 'draft' | 'paused';
  bookings: number;
  views: number;
}

export default function VendorListings() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Mock vendor category - in real app, get from auth context
  const vendorCategory = 'photographer'; // This would come from vendor profile/auth
  const vendorCategoryName = categories.find(c => c.id === vendorCategory)?.name || vendorCategory;
  
  // Form state
  const [listingTitle, setListingTitle] = useState('');
  const [listingDescription, setListingDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(vendorCategory);
  const [categoryWarning, setCategoryWarning] = useState<string | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);

  const listings: Listing[] = [
    {
      id: '1',
      title: 'Wedding Photography - Full Day',
      price: 45000,
      billingType: 'Fixed',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
      instantBook: true,
      status: 'active',
      bookings: 24,
      views: 342,
    },
    {
      id: '2',
      title: 'Pre-Wedding Shoot',
      price: 15000,
      billingType: 'Per Day',
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400',
      instantBook: false,
      status: 'active',
      bookings: 18,
      views: 256,
    },
    {
      id: '3',
      title: 'Corporate Event Photography',
      price: 25000,
      billingType: 'Per Day',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
      instantBook: true,
      status: 'active',
      bookings: 12,
      views: 189,
    },
    {
      id: '4',
      title: 'Birthday Party Coverage',
      price: 8000,
      billingType: 'Fixed',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400',
      instantBook: true,
      status: 'draft',
      bookings: 0,
      views: 0,
    },
  ];

  const handleClone = (listing: Listing) => {
    toast.success(`"${listing.title}" cloned successfully`);
  };

  const handleDelete = (listing: Listing) => {
    toast.error(`"${listing.title}" deleted`);
  };

  const handleToggleInstantBook = (listing: Listing) => {
    toast.success(`Instant book ${listing.instantBook ? 'disabled' : 'enabled'} for "${listing.title}"`);
  };

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Packages & Listings
            </h1>
            <p className="text-muted-foreground">{listings.length} listings • {listings.filter(l => l.status === 'active').length} active</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search listings..." className="pl-10 bg-background border-border text-foreground w-64" />
            </div>
            <Button 
              variant="outline" 
              className="border-border hover:bg-muted transition-all"
              onClick={() => setShowImportModal(true)}
            >
              <Instagram className="mr-2 h-4 w-4" /> Import
            </Button>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all">
                  <Plus className="mr-2 h-4 w-4" /> Add Listing
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create New Listing</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  {/* Vendor Category Info */}
                  <Alert className="bg-primary/10 border-primary/20">
                    <AlertDescription className="text-foreground">
                      <strong>Your Category:</strong> {vendorCategoryName} 📸
                      <br />
                      <span className="text-sm text-muted-foreground">
                        You can list items in your category ({vendorCategoryName}) or in the "Other" category for miscellaneous items.
                      </span>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label className="text-foreground">Listing Title</Label>
                    <Input 
                      placeholder="e.g., Professional Camera Rental" 
                      className="bg-background border-border text-foreground"
                      value={listingTitle}
                      onChange={(e) => {
                        setListingTitle(e.target.value);
                        // Auto-detect category suggestion
                        if (e.target.value && listingDescription) {
                          const suggestion = suggestCategoryForListing(e.target.value, listingDescription);
                          if (suggestion && suggestion !== vendorCategory && suggestion !== 'other') {
                            setSuggestedCategory(suggestion);
                            setCategoryWarning(`This item seems to belong to "${categories.find(c => c.id === suggestion)?.name || suggestion}" category. Consider listing it there instead.`);
                          } else {
                            setSuggestedCategory(null);
                            setCategoryWarning(null);
                          }
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Category</Label>
                    <Select 
                      value={selectedCategory} 
                      onValueChange={(value) => {
                        setSelectedCategory(value);
                        // Validate category
                        if (!validateListingCategory(vendorCategory, value)) {
                          const categoryName = categories.find(c => c.id === value)?.name || value;
                          setCategoryWarning(`You cannot list items in "${categoryName}" category. Please select "${vendorCategoryName}" or "Other".`);
                        } else {
                          setCategoryWarning(null);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={vendorCategory}>
                          {vendorCategoryName} (Your Category)
                        </SelectItem>
                        <SelectItem value="other">Other (Miscellaneous)</SelectItem>
                      </SelectContent>
                    </Select>
                    {categoryWarning && (
                      <Alert className="bg-yellow-500/10 border-yellow-500/20">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                          {categoryWarning}
                          {suggestedCategory && (
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  toast.info(`Please register as a ${categories.find(c => c.id === suggestedCategory)?.name || suggestedCategory} vendor to list this item.`);
                                }}
                              >
                                Learn More
                              </Button>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Event Types <span className="text-muted-foreground text-sm">(Select all applicable)</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2 p-3 border border-border rounded-lg bg-background">
                      {eventTypes.map((eventType) => (
                        <div key={eventType} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`event-${eventType}`}
                            checked={selectedEventTypes.includes(eventType)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEventTypes([...selectedEventTypes, eventType]);
                              } else {
                                setSelectedEventTypes(selectedEventTypes.filter(et => et !== eventType));
                              }
                            }}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <Label 
                            htmlFor={`event-${eventType}`}
                            className="text-sm font-normal text-foreground cursor-pointer"
                          >
                            {eventType}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedEventTypes.length === 0 && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        ⚠️ Please select at least one event type. This listing will only appear in selected event types.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Price (₹)</Label>
                      <Input type="number" placeholder="25000" className="bg-background border-border text-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Billing Type</Label>
                      <Select>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Price</SelectItem>
                          <SelectItem value="per-hour">Per Hour</SelectItem>
                          <SelectItem value="per-day">Per Day</SelectItem>
                          <SelectItem value="per-plate">Per Plate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Description</Label>
                    <Textarea 
                      placeholder="Describe your listing..."
                      className="bg-background border-border text-foreground min-h-[100px]"
                      value={listingDescription}
                      onChange={(e) => {
                        setListingDescription(e.target.value);
                        // Auto-detect category suggestion
                        if (listingTitle && e.target.value) {
                          const suggestion = suggestCategoryForListing(listingTitle, e.target.value);
                          if (suggestion && suggestion !== vendorCategory && suggestion !== 'other') {
                            setSuggestedCategory(suggestion);
                            setCategoryWarning(`This item seems to belong to "${categories.find(c => c.id === suggestion)?.name || suggestion}" category. Consider listing it there instead.`);
                          } else {
                            setSuggestedCategory(null);
                            setCategoryWarning(null);
                          }
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">What's Included</Label>
                    <Textarea 
                      placeholder="• Item 1&#10;• Item 2&#10;• Item 3"
                      className="bg-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Images</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-secondary transition-colors cursor-pointer hover-lift">
                      <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground mt-2">Click to upload or drag & drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-foreground">Add-ons (Optional)</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input placeholder="Add-on name" className="flex-1 bg-background border-border text-foreground" />
                        <Input placeholder="Price" className="w-32 bg-background border-border text-foreground" />
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                      <Plus className="mr-2 h-4 w-4" /> Add More
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div>
                      <p className="text-foreground font-medium">Enable Instant Book</p>
                      <p className="text-sm text-muted-foreground">Let customers book directly without approval</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 border-border hover:bg-muted" onClick={() => setShowCreateModal(false)}>
                      Save as Draft
                    </Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow" 
                      onClick={() => {
                        // Validate before publishing
                        if (!validateListingCategory(vendorCategory, selectedCategory)) {
                          toast.error('Invalid category selected. Please select your category or "Other".');
                          return;
                        }
                        if (!listingTitle.trim()) {
                          toast.error('Please enter a listing title.');
                          return;
                        }
                        if (selectedEventTypes.length === 0) {
                          toast.error('Please select at least one event type.');
                          return;
                        }
                        toast.success(`Listing published! Will appear in: ${selectedEventTypes.join(', ')}`);
                        setShowCreateModal(false);
                        // Reset form
                        setListingTitle('');
                        setListingDescription('');
                        setSelectedCategory(vendorCategory);
                        setCategoryWarning(null);
                        setSuggestedCategory(null);
                        setSelectedEventTypes([]);
                      }}
                    >
                      Publish Listing
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, index) => (
            <Card 
              key={listing.id} 
              className="border-border overflow-hidden group hover:shadow-elegant transition-all hover-lift"
            >
              <div className="relative aspect-video">
                <img 
                  src={listing.image} 
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={listing.status === 'active' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'}>
                    {listing.status}
                  </Badge>
                  {listing.instantBook && (
                    <Badge className="bg-secondary/20 text-secondary">
                      <Zap className="h-3 w-3 mr-1" /> Instant
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="bg-black/30 backdrop-blur-sm hover:bg-black/50">
                        <MoreVertical className="h-4 w-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-card border-border">
                      <DropdownMenuItem className="text-foreground hover:bg-muted">
                        <Eye className="mr-2 h-4 w-4" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-foreground hover:bg-muted">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClone(listing)} className="text-foreground hover:bg-muted">
                        <Copy className="mr-2 h-4 w-4" /> Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(listing)} className="text-red-600 dark:text-red-400 hover:bg-red-500/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge className="bg-background/90 text-foreground font-bold text-lg px-3 py-1 border border-border">
                    ₹{listing.price.toLocaleString()}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-foreground font-semibold text-lg">{listing.title}</h3>
                  <p className="text-muted-foreground text-sm">{listing.billingType}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    <span className="text-foreground font-medium">{listing.bookings}</span> bookings
                  </div>
                  <div className="text-muted-foreground">
                    <span className="text-foreground font-medium">{listing.views}</span> views
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Instant Book</span>
                    <Switch 
                      checked={listing.instantBook} 
                      onCheckedChange={() => handleToggleInstantBook(listing)}
                    />
                  </div>
                  <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary/80">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Card */}
          <Card 
            onClick={() => setShowCreateModal(true)}
            className="border-border border-dashed cursor-pointer hover:border-secondary transition-all hover-lift flex items-center justify-center min-h-[300px]"
          >
            <div className="text-center">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto transition-transform group-hover:scale-110" />
              <p className="text-muted-foreground mt-2 font-medium">Add New Listing</p>
            </div>
          </Card>
        </div>

        {/* Instagram Import Modal */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                <Instagram className="h-5 w-5" /> Import from Instagram
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-muted-foreground">Connect your Instagram to import portfolio images and create listings faster.</p>
              
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Instagram className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">@royalmoments</p>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all">
                  Connect Instagram
                </Button>
              </div>

              <div className="text-center py-8 border-t border-border">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground mt-2">Or upload images manually</p>
                <Button variant="outline" className="mt-4 border-border hover:bg-muted">
                  Upload Images
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </VendorLayout>
  );
}
