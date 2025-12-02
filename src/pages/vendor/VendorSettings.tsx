import { useState } from 'react';
import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bell, 
  Shield, 
  FileText, 
  CreditCard,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

export default function VendorSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const cancellationPolicies = [
    { id: 'flexible', name: 'Flexible', description: 'Full refund up to 7 days before event' },
    { id: 'moderate', name: 'Moderate', description: 'Full refund up to 14 days, 50% refund up to 7 days' },
    { id: 'strict', name: 'Strict', description: 'Full refund up to 30 days, 50% refund up to 14 days' },
    { id: 'custom', name: 'Custom', description: 'Define your own cancellation terms' },
  ];

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <VendorLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-foreground/60">Manage your account preferences</p>
          </div>
          <Button onClick={handleSave} className="bg-secondary text-secondary-foreground">
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <FileText className="mr-2 h-4 w-4" /> Policies
            </TabsTrigger>
            <TabsTrigger value="legal" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Shield className="mr-2 h-4 w-4" /> Legal
            </TabsTrigger>
          </TabsList>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/20">
                      <Mail className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Email Notifications</p>
                      <p className="text-sm text-foreground/60">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                {/* SMS */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-500/20">
                      <Smartphone className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">SMS Notifications</p>
                      <p className="text-sm text-foreground/60">Get text message alerts</p>
                    </div>
                  </div>
                  <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                </div>

                {/* WhatsApp */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-secondary/20">
                      <MessageSquare className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">WhatsApp Notifications</p>
                      <p className="text-sm text-foreground/60">Instant updates on WhatsApp</p>
                    </div>
                  </div>
                  <Switch checked={whatsappNotifications} onCheckedChange={setWhatsappNotifications} />
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-foreground font-semibold mb-4">Notify me about:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'New lead inquiries',
                      'Booking confirmations',
                      'Payment received',
                      'New reviews',
                      'Chat messages',
                      'Payout updates',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <Switch defaultChecked />
                        <span className="text-foreground/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies */}
          <TabsContent value="policies" className="space-y-6">
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/60">Select a cancellation policy template that will be included in your contracts.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cancellationPolicies.map((policy) => (
                    <div 
                      key={policy.id}
                      className="p-4 rounded-xl bg-muted/50 border border-border hover:border-vendor-gold/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-foreground font-medium">{policy.name}</p>
                        <input type="radio" name="cancellation" className="accent-vendor-gold" />
                      </div>
                      <p className="text-sm text-foreground/60">{policy.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <Label className="text-foreground">Custom Terms (Optional)</Label>
                  <Textarea 
                    placeholder="Add any additional terms or conditions..."
                    className="bg-muted/50 border-border text-foreground min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Service Level Agreement (SLA)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Response Time Commitment</Label>
                    <Select defaultValue="2h">
                      <SelectTrigger className="bg-muted/50 border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Within 1 hour</SelectItem>
                        <SelectItem value="2h">Within 2 hours</SelectItem>
                        <SelectItem value="4h">Within 4 hours</SelectItem>
                        <SelectItem value="24h">Within 24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Delivery Timeline</Label>
                    <Select defaultValue="7d">
                      <SelectTrigger className="bg-muted/50 border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3d">3 days after event</SelectItem>
                        <SelectItem value="7d">7 days after event</SelectItem>
                        <SelectItem value="14d">14 days after event</SelectItem>
                        <SelectItem value="30d">30 days after event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal */}
          <TabsContent value="legal" className="space-y-6">
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">KYC Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-foreground font-medium">PAN Card</p>
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="text-sm text-foreground/60">ABCDE1234F</p>
                    <Button variant="outline" size="sm" className="border-white/20 text-foreground">
                      Update
                    </Button>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-foreground font-medium">GST Certificate</p>
                      <Upload className="h-5 w-5 text-foreground/40" />
                    </div>
                    <p className="text-sm text-foreground/60">Not uploaded</p>
                    <Button variant="outline" size="sm" className="border-white/20 text-foreground">
                      Upload
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Terms & Agreements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-foreground font-medium">Vendor Terms Accepted</p>
                      <p className="text-sm text-foreground/60">Accepted on Nov 15, 2024</p>
                    </div>
                  </div>
                </div>

                <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-white/20 text-foreground hover:bg-white/10">
                      <FileText className="mr-2 h-4 w-4" /> View Terms & Conditions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Vendor Terms & Conditions</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4 text-foreground/80 text-sm">
                      <h3 className="text-foreground font-semibold">1. Platform Usage</h3>
                      <p>By using Eventory as a vendor, you agree to provide accurate information about your services, maintain professional conduct with customers, and fulfill bookings as agreed.</p>
                      
                      <h3 className="text-foreground font-semibold">2. Commission & Fees</h3>
                      <p>Eventory charges a 5% platform fee on all bookings. GST (18%) is applicable on the platform fee. Payouts are processed within 2-3 business days.</p>
                      
                      <h3 className="text-foreground font-semibold">3. Quality Standards</h3>
                      <p>Vendors must maintain a minimum rating of 3.5 stars. Consistent negative reviews may result in account suspension.</p>
                      
                      <h3 className="text-foreground font-semibold">4. Dispute Resolution</h3>
                      <p>In case of disputes, both parties agree to cooperate with Eventory's resolution process. Final decisions are at Eventory's discretion.</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </VendorLayout>
  );
}
