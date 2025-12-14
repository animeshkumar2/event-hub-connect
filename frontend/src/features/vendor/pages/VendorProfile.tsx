import { useState, useEffect, useRef } from 'react';
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
  X,
  ImagePlus
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorProfile } from '@/shared/hooks/useApi';
import { vendorApi } from '@/shared/services/api';

// Allowed image types (no videos)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const COMPRESSION_QUALITY = 0.7; // 70% quality for compression

// Compress image if too large
const compressImage = (file: File, maxSize: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Calculate new dimensions (max 1920px on longest side)
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with compression
        const dataUrl = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export default function VendorProfile() {
  const { data: profileData, loading, error, refetch } = useVendorProfile();
  
  // File input refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    bio: '',
    coverImage: '',
    portfolioImages: [] as string[],
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profileData) {
      setFormData({
        businessName: profileData.businessName || '',
        bio: profileData.bio || '',
        coverImage: profileData.coverImage || '',
        portfolioImages: profileData.portfolioImages || [],
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

  // Handle file selection and convert to base64/data URL
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'portfolio') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type (images only, no videos)
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Only images are allowed (JPG, PNG, WebP, GIF). Videos are not permitted.');
      return;
    }

    if (type === 'cover') {
      setIsUploadingCover(true);
    } else {
      setIsUploadingPortfolio(true);
    }

    try {
      let dataUrl: string;
      
      // Compress if file is too large
      if (file.size > MAX_FILE_SIZE) {
        toast.info('Image is large, compressing...');
        dataUrl = await compressImage(file, MAX_FILE_SIZE);
        toast.success('Image compressed successfully!');
      } else {
        // Read as-is
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      if (type === 'cover') {
        setFormData({ ...formData, coverImage: dataUrl });
        toast.success('Cover image updated! Click Save to apply changes.');
      } else {
        setPortfolioImages([...portfolioImages, dataUrl]);
        toast.success('Image added to portfolio! Click Save to apply changes.');
      }
    } catch (error) {
      toast.error('Failed to process image');
    } finally {
      if (type === 'cover') {
        setIsUploadingCover(false);
      } else {
        setIsUploadingPortfolio(false);
      }
      // Reset file input
      e.target.value = '';
    }
  };

  // Handle multiple file selection for portfolio
  const handleMultipleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPortfolio(true);
    const newImages: string[] = [];
    let errorCount = 0;
    let compressedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type (skip videos and non-images)
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        errorCount++;
        continue;
      }

      try {
        let dataUrl: string;
        
        // Compress if file is too large
        if (file.size > MAX_FILE_SIZE) {
          dataUrl = await compressImage(file, MAX_FILE_SIZE);
          compressedCount++;
        } else {
          dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }
        newImages.push(dataUrl);
      } catch {
        errorCount++;
      }
    }

    if (newImages.length > 0) {
      setPortfolioImages([...portfolioImages, ...newImages]);
      let message = `${newImages.length} image(s) added!`;
      if (compressedCount > 0) {
        message += ` (${compressedCount} compressed)`;
      }
      message += ' Click Save to apply changes.';
      toast.success(message);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} file(s) skipped (only images allowed, no videos)`);
    }

    setIsUploadingPortfolio(false);
    e.target.value = '';
  };

  const handleRemovePortfolioImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
    toast.success('Image removed. Click Save to apply changes.');
  };

  const handleRemoveCoverImage = () => {
    setFormData({ ...formData, coverImage: '' });
    toast.success('Cover image removed. Click Save to apply changes.');
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

  const isVerified = profileData.isVerified || false;
  // Show custom category name if category is "Other"
  const categoryName = profileData.customCategoryName || profileData.vendorCategory?.name || profileData.categoryName || 'Vendor';
  const cityName = profileData.cityName || '';

  return (
    <VendorLayout>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={coverInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => handleFileSelect(e, 'cover')}
      />
      <input
        type="file"
        ref={portfolioInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={(e) => handleMultipleFileSelect(e)}
      />

      <div className="p-6 space-y-6">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-elegant bg-muted">
          {formData.coverImage ? (
            <>
              <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <ImagePlus className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No cover image</p>
            </div>
          )}
          
          {/* Always visible buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            {formData.coverImage && (
              <Button 
                size="sm"
                variant="destructive"
                className="h-8 px-3 text-xs"
                onClick={handleRemoveCoverImage}
              >
                <X className="h-3 w-3 mr-1" /> Remove
              </Button>
            )}
            <Button 
              size="sm"
              className="h-8 px-3 text-xs bg-white/90 hover:bg-white text-gray-900 border shadow-sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
            >
              {isUploadingCover ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Camera className="h-3 w-3 mr-1" />
              )}
              {formData.coverImage ? 'Change' : 'Add Cover'}
            </Button>
          </div>
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
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground">Portfolio Gallery</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Upload images only (JPG, PNG, WebP, GIF). Max 5MB each.</p>
                </div>
                <Button 
                  className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all"
                  onClick={() => portfolioInputRef.current?.click()}
                  disabled={isUploadingPortfolio}
                >
                  {isUploadingPortfolio ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="mr-2 h-4 w-4" />
                  )}
                  Add Image
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
                            <X className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div 
                      className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                      onClick={() => portfolioInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground mt-2 font-medium">Add More</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                    <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No portfolio images yet</p>
                    <p className="text-xs text-muted-foreground mb-4">Add images to showcase your work to customers</p>
                    <Button 
                      onClick={() => portfolioInputRef.current?.click()}
                      disabled={isUploadingPortfolio}
                    >
                      {isUploadingPortfolio ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="mr-2 h-4 w-4" />
                      )}
                      Add First Image
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
