import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { 
  Copy, 
  Check, 
  Link2, 
  Building2,
  Phone,
  Mail,
  Send,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function GenerateClaimLink() {
  const [businessName, setBusinessName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generateUrl = () => {
    if (!businessName || !mobile) {
      toast.error('Please fill Business Name and Mobile');
      return;
    }

    if (mobile.length !== 10) {
      toast.error('Mobile number must be 10 digits');
      return;
    }

    // Create data object (minimal - just what's needed for account creation)
    const data = {
      b: businessName,      // business name (maps to fullName)
      m: mobile,            // mobile
      e: email || '',       // email (optional - vendor can enter if missing)
    };

    // Encode to base64 (URL safe)
    const encoded = btoa(JSON.stringify(data))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const baseUrl = window.location.origin;
    const url = `${baseUrl}/claim/${encoded}`;
    
    setGeneratedUrl(url);
    toast.success('Claim link generated!');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const copyWhatsAppMessage = async () => {
    const message = `Hi ${businessName}! 👋

We've created a FREE listing for your business on CartEvent - India's event vendor marketplace.

🎉 Claim your account now:
${generatedUrl}

Just click the link and press "Claim My Account" - takes 10 seconds!

Benefits:
✅ Get direct bookings from customers
✅ Verified business badge
✅ 100% FREE to start

Questions? Reply to this message.

- CartEvent Team`;

    try {
      await navigator.clipboard.writeText(message);
      toast.success('WhatsApp message copied!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const resetForm = () => {
    setBusinessName('');
    setMobile('');
    setEmail('');
    setGeneratedUrl('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Generate Vendor Claim Link</h1>
          <p className="text-gray-600 mt-1">Enter vendor details from CSV/Google Maps to create a claim URL</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendor Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Business Name */}
            <div>
              <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
              <Input
                id="businessName"
                placeholder="e.g., Studio X Photography"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Mobile */}
            <div>
              <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
              <div className="flex gap-2 mt-1">
                <div className="flex items-center px-3 bg-gray-100 border rounded-md text-gray-600">
                  <Phone className="h-4 w-4 mr-1" />
                  +91
                </div>
                <Input
                  id="mobile"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1"
                />
              </div>
              {mobile && mobile.length !== 10 && (
                <p className="text-xs text-red-500 mt-1">Enter 10 digit mobile number</p>
              )}
            </div>

            {/* Email (Optional) */}
            <div>
              <Label htmlFor="email">Email <span className="text-gray-400">(optional - vendor can enter later)</span></Label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vendor@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={generateUrl}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={!businessName || !mobile || mobile.length !== 10}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Generate Claim Link
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated URL */}
        {generatedUrl && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Claim Link Ready!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* URL Display */}
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-gray-500 mb-1">Claim URL:</p>
                <p className="text-sm text-gray-800 break-all font-mono">{generatedUrl}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={copyToClipboard}
                  variant={copied ? "default" : "outline"}
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button 
                  onClick={copyWhatsAppMessage}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Copy WhatsApp Message
                </Button>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-lg p-4 border">
                <p className="text-xs text-gray-500 mb-2">Preview (what vendor will see):</p>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                  <div className="font-semibold text-gray-900">{businessName}</div>
                  <div className="text-sm text-gray-600 mt-1">📱 +91 {mobile}</div>
                  {email && <div className="text-sm text-gray-600">✉️ {email}</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Copy vendor details from your CSV/Google Maps</li>
              <li>Fill Business Name and Mobile (Email optional)</li>
              <li>Click "Generate Claim Link"</li>
              <li>Click "Copy WhatsApp Message" to get ready-to-send message</li>
              <li>Send to vendor via WhatsApp/SMS</li>
              <li>Vendor clicks link → Clicks "Claim Account" → Done!</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
