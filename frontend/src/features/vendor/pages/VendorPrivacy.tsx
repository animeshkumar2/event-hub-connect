import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function VendorPrivacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">
            cart<span className="text-primary">event.</span>
          </a>
          <Button variant="ghost" onClick={() => navigate('/for-vendors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendor Page
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">CartEvent Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">For Vendors</p>

        <div className="prose prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Information We Collect</h2>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Vendor profile details</li>
              <li>Listings, images, pricing</li>
              <li>Communication logs</li>
              <li>Usage and analytics data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">How We Use Data</h2>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Platform operations</li>
              <li>Vendor discovery and matching</li>
              <li>Analytics and improvement</li>
              <li>Marketing (vendor content only)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Data Sharing</h2>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Customer contact details are shared only for booking communication.</li>
              <li>Cartevent does not sell personal data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Vendor Responsibility</h2>
            <p className="text-muted-foreground">
              Vendors must not misuse, store, or resell customer data. Any violation may result in termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Data Retention</h2>
            <p className="text-muted-foreground">
              Cartevent may retain vendor data even after deletion for audit, security, fraud prevention, and legal compliance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Data Removal Requests</h2>
            <p className="text-muted-foreground">
              Vendors may request deletion of marketing assets or profile data through official channels.
            </p>
          </section>

          <section className="border-t pt-8">
            <h2 className="text-xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              For any privacy-related concerns, please contact us at{' '}
              <a href="mailto:support@cartevent.com" className="text-primary hover:underline">
                support@cartevent.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Button onClick={() => navigate('/for-vendors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendor Page
          </Button>
        </div>
      </div>
    </div>
  );
}

