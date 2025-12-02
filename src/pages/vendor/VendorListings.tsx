import { useState } from 'react';
import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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
            <h1 className="font-display text-2xl font-bold text-white">Packages & Listings</h1>
            <p className="text-white/60">{listings.length} listings • {listings.filter(l => l.status === 'active').length} active</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input placeholder="Search listings..." className="pl-10 bg-white/5 border-white/10 text-white w-64" />
            </div>
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => setShowImportModal(true)}
            >
              <Instagram className="mr-2 h-4 w-4" /> Import
            </Button>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="bg-vendor-gold text-vendor-dark">
                  <Plus className="mr-2 h-4 w-4" /> Add Listing
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-vendor-dark border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Listing</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-white">Listing Title</Label>
                    <Input placeholder="e.g., Wedding Photography - Full Day" className="bg-white/5 border-white/10 text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Price (₹)</Label>
                      <Input type="number" placeholder="25000" className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Billing Type</Label>
                      <Select>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
                    <Label className="text-white">Description</Label>
                    <Textarea 
                      placeholder="Describe your package..."
                      className="bg-white/5 border-white/10 text-white min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">What's Included</Label>
                    <Textarea 
                      placeholder="• Item 1&#10;• Item 2&#10;• Item 3"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Images</Label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-vendor-gold/50 transition-colors cursor-pointer">
                      <ImagePlus className="h-8 w-8 text-white/40 mx-auto" />
                      <p className="text-white/60 mt-2">Click to upload or drag & drop</p>
                      <p className="text-xs text-white/40">PNG, JPG up to 10MB each</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-white">Add-ons (Optional)</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input placeholder="Add-on name" className="flex-1 bg-white/5 border-white/10 text-white" />
                        <Input placeholder="Price" className="w-32 bg-white/5 border-white/10 text-white" />
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/20 text-white">
                      <Plus className="mr-2 h-4 w-4" /> Add More
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="text-white font-medium">Enable Instant Book</p>
                      <p className="text-sm text-white/60">Let customers book directly without approval</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 border-white/20 text-white" onClick={() => setShowCreateModal(false)}>
                      Save as Draft
                    </Button>
                    <Button className="flex-1 bg-vendor-gold text-vendor-dark" onClick={() => {
                      toast.success('Listing published!');
                      setShowCreateModal(false);
                    }}>
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
          {listings.map((listing) => (
            <Card key={listing.id} className="glass-card border-white/10 overflow-hidden group">
              <div className="relative aspect-video">
                <img 
                  src={listing.image} 
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={listing.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                    {listing.status}
                  </Badge>
                  {listing.instantBook && (
                    <Badge className="bg-vendor-gold/20 text-vendor-gold">
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
                    <DropdownMenuContent className="bg-vendor-dark border-white/10">
                      <DropdownMenuItem className="text-white hover:bg-white/10">
                        <Eye className="mr-2 h-4 w-4" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-white/10">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClone(listing)} className="text-white hover:bg-white/10">
                        <Copy className="mr-2 h-4 w-4" /> Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(listing)} className="text-red-400 hover:bg-red-500/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge className="bg-white/90 text-vendor-dark font-bold text-lg px-3 py-1">
                    ₹{listing.price.toLocaleString()}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{listing.title}</h3>
                  <p className="text-white/60 text-sm">{listing.billingType}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-white/60">
                    <span className="text-white font-medium">{listing.bookings}</span> bookings
                  </div>
                  <div className="text-white/60">
                    <span className="text-white font-medium">{listing.views}</span> views
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">Instant Book</span>
                    <Switch 
                      checked={listing.instantBook} 
                      onCheckedChange={() => handleToggleInstantBook(listing)}
                    />
                  </div>
                  <Button variant="ghost" size="sm" className="text-vendor-gold hover:text-vendor-gold/80">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Card */}
          <Card 
            onClick={() => setShowCreateModal(true)}
            className="glass-card border-white/10 border-dashed cursor-pointer hover:border-vendor-gold/50 transition-colors flex items-center justify-center min-h-[300px]"
          >
            <div className="text-center">
              <Plus className="h-12 w-12 text-white/30 mx-auto" />
              <p className="text-white/40 mt-2">Add New Listing</p>
            </div>
          </Card>
        </div>

        {/* Instagram Import Modal */}
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="bg-vendor-dark border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Instagram className="h-5 w-5" /> Import from Instagram
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-white/60">Connect your Instagram to import portfolio images and create listings faster.</p>
              
              <div className="p-4 rounded-xl bg-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Instagram className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">@royalmoments</p>
                    <p className="text-sm text-white/60">Not connected</p>
                  </div>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Connect Instagram
                </Button>
              </div>

              <div className="text-center py-8 border-t border-white/10">
                <Upload className="h-8 w-8 text-white/30 mx-auto" />
                <p className="text-white/40 mt-2">Or upload images manually</p>
                <Button variant="outline" className="mt-4 border-white/20 text-white">
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
