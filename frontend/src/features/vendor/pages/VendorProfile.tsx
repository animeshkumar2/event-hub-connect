import { useState } from 'react';
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
  Save
} from 'lucide-react';
import { toast } from 'sonner';

export default function VendorProfile() {
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200');
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200');
  const [isVerified, setIsVerified] = useState(true);
  const [hasKYC, setHasKYC] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(false);

  const handleSave = () => {
    toast.success('Profile updated successfully!');
  };

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
          >
            <Camera className="mr-2 h-4 w-4" /> Change Cover
          </Button>
          
          {/* Profile Image */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl border-4 border-background shadow-elegant overflow-hidden">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <Button 
                size="icon" 
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all border-2 border-background"
              >
                <Camera className="h-4 w-4" />
              </Button>
              {isVerified && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-lg border-2 border-background">
                  <CheckCircle className="h-4 w-4 text-white fill-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex items-start justify-between pt-20 pb-6 border-b border-border">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">Royal Moments Photography</h1>
              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">Verified</Badge>
              {hasKYC && <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">KYC Complete</Badge>}
            </div>
            <p className="text-muted-foreground text-lg">Professional Wedding & Event Photographer</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Mumbai, Maharashtra
              </span>
              <span>•</span>
              <span>10+ years experience</span>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all"
          >
            <Save className="mr-2 h-4 w-4" /> Save Changes
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
            <TabsTrigger value="verification" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Verification
            </TabsTrigger>
            <TabsTrigger value="bank" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Bank & Tax
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
                    <Input defaultValue="Royal Moments Photography" className="bg-background border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Category</Label>
                    <Input defaultValue="Photographer" className="bg-muted/50 border-border text-foreground" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Bio</Label>
                    <Textarea 
                      defaultValue="Award-winning photographer with 10+ years of experience capturing beautiful moments. Specialized in weddings, pre-wedding shoots, and corporate events."
                      className="bg-background border-border text-foreground min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-card hover:shadow-elegant transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground">Contact & Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> Phone
                    </Label>
                    <Input defaultValue="+91 98765 43210" className="bg-background border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> Email
                    </Label>
                    <Input defaultValue="contact@royalmoments.com" className="bg-background border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Service Areas
                    </Label>
                    <Input defaultValue="Mumbai, Pune, Goa" className="bg-background border-border text-foreground" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" /> Website
                      </Label>
                      <Input defaultValue="royalmoments.com" className="bg-background border-border text-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-primary" /> Instagram
                      </Label>
                      <Input defaultValue="@royalmoments" className="bg-background border-border text-foreground" />
                    </div>
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
                <div className="flex gap-2">
                  <Button variant="outline" className="border-border hover:bg-muted">
                    <Instagram className="mr-2 h-4 w-4" /> Import from Instagram
                  </Button>
                  <Button className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow transition-all">
                    <Upload className="mr-2 h-4 w-4" /> Upload Images
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4,5,6,7,8].map((i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden group relative cursor-pointer border border-border hover:shadow-elegant transition-all">
                      <img 
                        src={`https://images.unsplash.com/photo-${1519741497674 + i * 1000}-ce899eb92f26?w=400`}
                        alt={`Portfolio ${i}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="destructive">Remove</Button>
                      </div>
                    </div>
                  ))}
                  <div className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2 font-medium">Add More</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification */}
          <TabsContent value="verification" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border shadow-card hover:shadow-elegant transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" /> Phone Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-foreground font-semibold">Phone Verified</p>
                        <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">Verified</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-card hover:shadow-elegant transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" /> KYC Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">PAN Card</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2 font-medium">Upload PAN Card</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">GST Certificate (Optional)</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2 font-medium">Upload GST Certificate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bank & Tax */}
          <TabsContent value="bank" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border shadow-card hover:shadow-elegant transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" /> Bank Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Account Holder Name</Label>
                    <Input placeholder="As per bank records" className="bg-background border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Account Number</Label>
                    <Input placeholder="Enter account number" className="bg-background border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">IFSC Code</Label>
                    <Input placeholder="e.g., HDFC0001234" className="bg-background border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Bank Name</Label>
                    <Input placeholder="Auto-filled from IFSC" className="bg-muted/50 border-border text-foreground" disabled />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-card hover:shadow-elegant transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Tax Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">PAN Number</Label>
                    <Input placeholder="ABCDE1234F" className="bg-background border-border text-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                    <div>
                      <p className="text-foreground font-semibold">Enable GST</p>
                      <p className="text-sm text-muted-foreground">Add GST to your invoices</p>
                    </div>
                    <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} />
                  </div>
                  {gstEnabled && (
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">GSTIN</Label>
                      <Input placeholder="22AAAAA0000A1Z5" className="bg-background border-border text-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </VendorLayout>
  );
}
