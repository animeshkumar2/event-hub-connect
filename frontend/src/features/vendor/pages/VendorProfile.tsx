import { useState, useEffect } from 'react';
import { VendorLayout } from '@/features/vendor/components/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  Camera, 
  Upload, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Mail,
  Globe,
  Instagram,
  Building,
  FileText,
  Shield,
  Save,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorProfile } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';

export default function VendorProfile() {
  const { data: profileData, loading, error, refetch } = useVendorProfile();
  
  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    bio: '',
    coverImage: '',
    portfolioImages: [] as string[],
    coverageRadius: 0,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profileData) {
      setFormData({
        businessName: profileData.businessName || '',
        bio: profileData.bio || '',
        coverImage: profileData.coverImage || '',
        portfolioImages: profileData.portfolioImages || [],
        coverageRadius: profileData.coverageRadius || 0,
      });
      setPortfolioImages(profileData.portfolioImages || []);
    }
  }, [profileData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await vendorApi.updateProfile({
        businessName: formData.businessName,
        bio: formData.bio,
        coverImage: formData.coverImage,
        portfolioImages: portfolioImages,
        coverageRadius: formData.coverageRadius,
      });

      if (response.success) {
        toast.success('Profile updated successfully!');
        refetch();
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (type: 'cover' | 'portfolio', url: string) => {
    if (type === 'cover') {
      setFormData({ ...formData, coverImage: url });
    } else {
      setPortfolioImages([...portfolioImages, url]);
    }
  };

  const handleRemovePortfolioImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </VendorLayout>
    );
  }

  if (error || !profileData) {
    return (
      <VendorLayout>
        <div className="p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <p className="text-destructive">Failed to load profile: {error}</p>
            </CardContent>
          </Card>
        </div>
      </VendorLayout>
    );
  }

  const coverImage = formData.coverImage || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200';
  const isVerified = profileData.isVerified || false;
  const categoryName = profileData.vendorCategory?.name || profileData.categoryName || 'Vendor';
  const cityName = profileData.cityName || '';

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Cover Image */}
        <div className="relative h-64 rounded-2xl overflow-hidden group shadow-elegant">
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
          <Button 
            size="sm"
            className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm hover:bg-background border border-border opacity-0 group-hover:opacity-100 transition-all shadow-sm"
            onClick={() => {
              const url = prompt('Enter image URL:');
              if (url) handleImageUpload('cover', url);
            }}
          >
            <Camera className="mr-2 h-4 w-4" /> Change Cover
          </Button>
        </div>

        {/* Profile Header */}
        <div className="flex items-start justify-between pt-6 pb-6 border-b border-border">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{formData.businessName || 'Your Business'}</h1>
              {isVerified && (
                <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-lg">{categoryName}</p>
            {cityName && (
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {cityName}
                </span>
              </div>
            )}
          </div>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="basic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Gallery
            </TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border shadow-card hover:shadow-elegant transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground">Business Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Business Name</Label>
                    <Input 
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="bg-background border-border text-foreground" 
                      placeholder="Enter business name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Category</Label>
                    <Input 
                      value={categoryName}
                      className="bg-muted/50 border-border text-foreground" 
                      disabled 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Bio</Label>
                    <Textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="bg-background border-border text-foreground min-h-[120px]"
                      placeholder="Tell customers about your business..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Coverage Radius (km)</Label>
                    <Input 
                      type="number"
                      value={formData.coverageRadius}
                      onChange={(e) => setFormData({ ...formData, coverageRadius: parseInt(e.target.value) || 0 })}
                      className="bg-background border-border text-foreground" 
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Cover Image URL</Label>
                    <Input 
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="bg-background border-border text-foreground" 
                      placeholder="https://..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-card hover:shadow-elegant transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground">Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> City
                    </Label>
                    <Input 
                      value={cityName}
                      className="bg-muted/50 border-border text-foreground" 
                      disabled 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gallery */}
          <TabsContent value="gallery" className="space-y-6">
            <Card className="border-border shadow-card hover:shadow-elegant transition-all">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold text-foreground">Portfolio Gallery</CardTitle>
                <Button 
                  className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all"
                  onClick={() => {
                    const url = prompt('Enter image URL:');
                    if (url) handleImageUpload('portfolio', url);
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Image
                </Button>
              </CardHeader>
              <CardContent>
                {portfolioImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {portfolioImages.map((image, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden group relative cursor-pointer border border-border hover:shadow-elegant transition-all">
                        <img 
                          src={image}
                          alt={`Portfolio ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRemovePortfolioImage(i)}
                          >
                            <X className="h-4 w-4 mr-2" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div 
                      className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                      onClick={() => {
                        const url = prompt('Enter image URL:');
                        if (url) handleImageUpload('portfolio', url);
                      }}
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground mt-2 font-medium">Add More</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No portfolio images yet</p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const url = prompt('Enter image URL:');
                        if (url) handleImageUpload('portfolio', url);
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" /> Add First Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </VendorLayout>
  );
}
