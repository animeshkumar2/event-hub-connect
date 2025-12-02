import { useState } from 'react';
import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        <div className="relative h-64 rounded-2xl overflow-hidden group">
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-vendor-dark via-transparent to-transparent" />
          <Button 
            size="sm"
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="mr-2 h-4 w-4" /> Change Cover
          </Button>
          
          {/* Profile Image */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-32 h-32 rounded-2xl border-4 border-vendor-dark object-cover"
              />
              <Button 
                size="icon" 
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-vendor-gold text-vendor-dark"
              >
                <Camera className="h-4 w-4" />
              </Button>
              {isVerified && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex items-start justify-between pt-12">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-white">Royal Moments Photography</h1>
              <Badge className="bg-green-500/20 text-green-400">Verified</Badge>
              {hasKYC && <Badge className="bg-blue-500/20 text-blue-400">KYC Complete</Badge>}
            </div>
            <p className="text-white/60 mt-1">Professional Wedding & Event Photographer</p>
          </div>
          <Button onClick={handleSave} className="bg-vendor-gold text-vendor-dark hover:bg-vendor-gold/90">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="basic" className="data-[state=active]:bg-vendor-gold data-[state=active]:text-vendor-dark">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-vendor-gold data-[state=active]:text-vendor-dark">
              Gallery
            </TabsTrigger>
            <TabsTrigger value="verification" className="data-[state=active]:bg-vendor-gold data-[state=active]:text-vendor-dark">
              Verification
            </TabsTrigger>
            <TabsTrigger value="bank" className="data-[state=active]:bg-vendor-gold data-[state=active]:text-vendor-dark">
              Bank & Tax
            </TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Business Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Business Name</Label>
                    <Input defaultValue="Royal Moments Photography" className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Category</Label>
                    <Input defaultValue="Photographer" className="bg-white/5 border-white/10 text-white" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Bio</Label>
                    <Textarea 
                      defaultValue="Award-winning photographer with 10+ years of experience capturing beautiful moments. Specialized in weddings, pre-wedding shoots, and corporate events."
                      className="bg-white/5 border-white/10 text-white min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Contact & Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Phone
                    </Label>
                    <Input defaultValue="+91 98765 43210" className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </Label>
                    <Input defaultValue="contact@royalmoments.com" className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Service Areas
                    </Label>
                    <Input defaultValue="Mumbai, Pune, Goa" className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Website
                      </Label>
                      <Input defaultValue="royalmoments.com" className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Instagram className="h-4 w-4" /> Instagram
                      </Label>
                      <Input defaultValue="@royalmoments" className="bg-white/5 border-white/10 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gallery */}
          <TabsContent value="gallery" className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Portfolio Gallery</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Instagram className="mr-2 h-4 w-4" /> Import from Instagram
                  </Button>
                  <Button className="bg-vendor-gold text-vendor-dark">
                    <Upload className="mr-2 h-4 w-4" /> Upload Images
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4,5,6,7,8].map((i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden group relative cursor-pointer">
                      <img 
                        src={`https://images.unsplash.com/photo-${1519741497674 + i * 1000}-ce899eb92f26?w=400`}
                        alt={`Portfolio ${i}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="destructive">Remove</Button>
                      </div>
                    </div>
                  ))}
                  <div className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-vendor-gold/50 transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-white/40 mx-auto" />
                      <p className="text-sm text-white/40 mt-2">Add More</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification */}
          <TabsContent value="verification" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Phone className="h-5 w-5" /> Phone Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Phone Verified</p>
                        <p className="text-sm text-white/60">+91 98765 43210</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">Verified</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5" /> KYC Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">PAN Card</Label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-vendor-gold/50 transition-colors cursor-pointer">
                      <Upload className="h-6 w-6 text-white/40 mx-auto" />
                      <p className="text-sm text-white/40 mt-2">Upload PAN Card</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">GST Certificate (Optional)</Label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-vendor-gold/50 transition-colors cursor-pointer">
                      <Upload className="h-6 w-6 text-white/40 mx-auto" />
                      <p className="text-sm text-white/40 mt-2">Upload GST Certificate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bank & Tax */}
          <TabsContent value="bank" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building className="h-5 w-5" /> Bank Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Account Holder Name</Label>
                    <Input placeholder="As per bank records" className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Account Number</Label>
                    <Input placeholder="Enter account number" className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">IFSC Code</Label>
                    <Input placeholder="e.g., HDFC0001234" className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Bank Name</Label>
                    <Input placeholder="Auto-filled from IFSC" className="bg-white/5 border-white/10 text-white" disabled />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Tax Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">PAN Number</Label>
                    <Input placeholder="ABCDE1234F" className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div>
                      <p className="text-white font-medium">Enable GST</p>
                      <p className="text-sm text-white/60">Add GST to your invoices</p>
                    </div>
                    <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} />
                  </div>
                  {gstEnabled && (
                    <div className="space-y-2">
                      <Label className="text-white">GSTIN</Label>
                      <Input placeholder="22AAAAA0000A1Z5" className="bg-white/5 border-white/10 text-white" />
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
