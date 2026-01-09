import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function VendorTerms() {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-2">CART EVENT — VENDOR TERMS & CONDITIONS</h1>
        <p className="text-muted-foreground mb-8">Last Updated: 13-12-2025</p>

        <div className="prose prose-sm max-w-none space-y-8">
          <p>
            These Vendor Terms & Conditions ("Terms") govern your use of the Cartevent platform ("Cartevent", "we", "us", "our"). 
            By registering as a vendor, creating a listing, or using Cartevent in any way, you agree to be bound by these Terms.
            <br /><br />
            <strong>If you do not agree, you must not use or access the platform.</strong>
          </p>

          <section>
            <h2 className="text-xl font-bold mb-4">1. PLATFORM ROLE & LIABILITY SHIELD</h2>
            
            <h3 className="font-semibold mt-4 mb-2">1.1 Neutral Marketplace</h3>
            <p className="text-muted-foreground">
              Cartevent is an online platform that enables customers to discover and connect with independent third-party vendors. 
              We are not a service provider, agent, representative, broker, guarantor, or verifier of any vendor.
            </p>

            <h3 className="font-semibold mt-4 mb-2">1.2 Vendor Responsibility</h3>
            <p className="text-muted-foreground">
              Vendors listed on Cartevent operate independently. Vendors are solely responsible for their:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Performance and service delivery</li>
              <li>Pricing, communication, and timelines</li>
              <li>Licenses, certifications, and legal compliance (GST, FSSAI, municipal rules, etc.)</li>
              <li>Authenticity of photos, reviews, and portfolio content</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">1.3 No Liability</h3>
            <p className="text-muted-foreground">Cartevent is not responsible for:</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Delays, no-shows, cancellations</li>
              <li>Misrepresentation, inaccurate listings, or fake portfolios</li>
              <li>Quality of service, hygiene, safety, food poisoning, or event failures</li>
              <li>Damages, injury, illness, loss, theft, breakages</li>
              <li>Customer behaviour or disputes</li>
              <li>Any losses or consequences under any circumstances</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">1.4 Intermediary Protection</h3>
            <p className="text-muted-foreground">
              Under Indian law, Cartevent acts only as an intermediary facilitating discovery and communication.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Vendor = fully responsible for service</li>
              <li>Customer = responsible for making informed choices</li>
              <li>Cartevent = not a party to transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">2. VENDOR VERIFICATION & APPROVAL POLICY</h2>
            
            <h3 className="font-semibold mt-4 mb-2">2.1 No Verification Guarantee</h3>
            <p className="text-muted-foreground">
              Cartevent does not claim to verify vendor authenticity, legality, identity, or backgrounds.
            </p>

            <h3 className="font-semibold mt-4 mb-2">2.2 Internal Criteria</h3>
            <p className="text-muted-foreground">
              Vendor approval is based on internal criteria, which may change at any time. 
              We are not obligated to share these criteria with vendors or customers.
            </p>

            <h3 className="font-semibold mt-4 mb-2">2.3 Right to Review & Reject</h3>
            <p className="text-muted-foreground">
              Cartevent may approve, reject, suspend, or remove any vendor or listing at its sole discretion.
            </p>

            <h3 className="font-semibold mt-4 mb-2">2.4 Blacklisting</h3>
            <p className="text-muted-foreground">
              We may blacklist or permanently ban vendors showing red flags, suspicious activity, 
              misleading information, or non-compliance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">3. CONTENT, DATA & IP RIGHTS</h2>
            
            <h3 className="font-semibold mt-4 mb-2">3.1 Vendor Ownership</h3>
            <p className="text-muted-foreground">
              Vendors retain copyright for all content they upload.
            </p>

            <h3 className="font-semibold mt-4 mb-2">3.2 License to Cartevent</h3>
            <p className="text-muted-foreground">
              By uploading any content (photos, text, pricing, videos, portfolio, branding), 
              the vendor grants Cartevent a non-exclusive, royalty-free, worldwide, transferable license to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Display it on the platform/app</li>
              <li>Use it for social media, ads, emailers, promotional campaigns</li>
              <li>Use it in print materials</li>
              <li>Edit, crop, watermark, resize, or optimise it</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">3.3 Marketing Usage</h3>
            <p className="text-muted-foreground">
              Vendors may request removal of marketing material, and Cartevent may comply at its discretion.
            </p>

            <h3 className="font-semibold mt-4 mb-2">3.4 Content Legality</h3>
            <p className="text-muted-foreground">
              Vendors are solely responsible for ensuring that uploaded content:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Is accurate</li>
              <li>Is owned by them</li>
              <li>Does not infringe copyright or violate IP laws</li>
            </ul>
            <p className="text-muted-foreground">Cartevent is not liable for content uploaded by vendors.</p>

            <h3 className="font-semibold mt-4 mb-2">3.5 Data Retention</h3>
            <p className="text-muted-foreground">
              Cartevent may store vendor data even after deletion or termination for security, audit, anti-fraud, and legal reasons.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">4. VENDOR RESPONSIBILITIES</h2>
            <p className="text-muted-foreground mb-4">Vendors agree to:</p>

            <h3 className="font-semibold mt-4 mb-2">4.1 Accuracy</h3>
            <p className="text-muted-foreground">
              Provide truthful, accurate, complete listing information, including pricing, availability, and portfolio.
            </p>

            <h3 className="font-semibold mt-4 mb-2">4.2 Legal Compliance</h3>
            <p className="text-muted-foreground">
              Ensure compliance with all applicable laws, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>GST registration (if applicable)</li>
              <li>FSSAI license (for food vendors)</li>
              <li>Local permissions, safety norms, and municipal regulations</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">4.3 Communication</h3>
            <p className="text-muted-foreground">
              Respond to customer leads within 3–4 working days.
              3 delays = vendor is flagged and may be audited or removed.
            </p>

            <h3 className="font-semibold mt-4 mb-2">4.4 Authenticity</h3>
            <p className="text-muted-foreground">
              Not upload fake, plagiarized, AI-generated, misleading, or stolen images/content.
            </p>

            <h3 className="font-semibold mt-4 mb-2">4.5 Pricing Ethics</h3>
            <p className="text-muted-foreground">
              Not list false or bait-and-switch pricing.
            </p>

            <h3 className="font-semibold mt-4 mb-2">4.6 Professional Conduct</h3>
            <p className="text-muted-foreground">
              Maintain respectful communication with customers and Cartevent staff.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">5. ANTI-POACHING & CUSTOMER DATA USE</h2>
            
            <h3 className="font-semibold mt-4 mb-2">5.1 Customer Contact Restrictions</h3>
            <p className="text-muted-foreground">Vendors must not:</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Contact Cartevent customers outside the platform to bypass the system</li>
              <li>Directly poach or divert business away from Cartevent</li>
              <li>Ask customers to transact privately or share alternate phone numbers</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">5.2 Data Misuse Prohibited</h3>
            <p className="text-muted-foreground">
              Vendors may not store, resell, harvest, or misuse customer data or phone numbers.
            </p>

            <h3 className="font-semibold mt-4 mb-2">5.3 Consequences</h3>
            <p className="text-muted-foreground">
              Violation may result in immediate suspension, penalties, or permanent termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">6. REVIEWS, RATINGS & FEEDBACK MANAGEMENT</h2>
            
            <h3 className="font-semibold mt-4 mb-2">6.1 Cartevent's Rights</h3>
            <p className="text-muted-foreground">Cartevent may:</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Publish reviews without vendor approval</li>
              <li>Remove reviews deemed fake, abusive, or fraudulent</li>
              <li>Edit review visibility based on policy compliance</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">6.2 Dispute Process</h3>
            <p className="text-muted-foreground">
              Vendors may request review disputes via ticket system, but Cartevent's decision is final.
            </p>

            <h3 className="font-semibold mt-4 mb-2">6.3 No Liability for Reviews</h3>
            <p className="text-muted-foreground">Cartevent is not liable for:</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Reputational harm</li>
              <li>Rating fluctuations</li>
              <li>Defamatory remarks by customers</li>
              <li>Consequences of negative or misleading reviews</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">7. DISPUTES & LEGAL CLAIMS</h2>
            
            <h3 className="font-semibold mt-4 mb-2">7.1 Customer-Vendor Disputes Only</h3>
            <p className="text-muted-foreground">
              All issues, complaints, disputes, refunds, disagreements, and legal claims are strictly between:
              <br />
              <strong>Vendor ↔ Customer</strong>
              <br />
              Cartevent is not a party to any dispute.
            </p>

            <h3 className="font-semibold mt-4 mb-2">7.2 No Mediation Obligation</h3>
            <p className="text-muted-foreground">
              Cartevent may choose to help but is not obligated to intervene.
            </p>

            <h3 className="font-semibold mt-4 mb-2">7.3 Complete Legal Immunity</h3>
            <p className="text-muted-foreground">
              Cartevent bears no liability for any financial, personal, service-related, or incidental damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">8. PAYMENTS & FEES (FUTURE-PROOFED)</h2>
            
            <h3 className="font-semibold mt-4 mb-2">8.1 Current MVP Model</h3>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Vendors pay no fees currently.</li>
              <li>Cartevent does not handle payments; vendors receive payments directly from customers.</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">8.2 Future Monetisation</h3>
            <p className="text-muted-foreground">
              Cartevent reserves the right to introduce—at any future time—any or all of the following:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Commission on bookings</li>
              <li>Subscription plans</li>
              <li>Paid listings</li>
              <li>Boosted visibility slots</li>
              <li>Lead purchase packages</li>
              <li>Convenience fees</li>
            </ul>
            <p className="text-muted-foreground">No timelines will be provided for these changes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">9. CART EVENT RIGHTS (PLATFORM CONTROL)</h2>
            <p className="text-muted-foreground mb-4">Cartevent may, at any time and without notice:</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Modify listing text, formatting, or visibility</li>
              <li>Change ranking algorithms</li>
              <li>Restrict or alter reach and visibility</li>
              <li>Request verification documents</li>
              <li>Suspend, limit, or terminate vendor access</li>
              <li>Update policies and platform rules</li>
              <li>Refuse service to any vendor</li>
            </ul>
            <p className="text-muted-foreground">
              Cartevent is not obligated to justify or explain these decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">10. TERMINATION & SUSPENSION</h2>
            <p className="text-muted-foreground mb-4">Cartevent may:</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Suspend vendors without reason</li>
              <li>Remove listings without notice</li>
              <li>Permanently ban vendors</li>
              <li>Terminate access after investigation</li>
              <li>Immediately remove vendors engaging in fraud, illegal activity, fake content, or policy violations</li>
            </ul>
            <p className="text-muted-foreground">
              Vendors cannot demand reinstatement or compensation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">11. GOVERNING LAW & JURISDICTION</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of India.
              Any disputes, if they arise, shall fall under the exclusive jurisdiction of the courts of Bangalore, Karnataka.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">12. LIMITATION OF LIABILITY & INDEMNIFICATION</h2>
            
            <h3 className="font-semibold mt-4 mb-2">12.1 Limitation of Liability</h3>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, Cartevent is not liable for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Loss of business, revenue, goodwill, or profits</li>
              <li>Service failures, delays, or breakdowns</li>
              <li>Downtime, technical issues, or API failures</li>
              <li>Failed notifications or message delivery</li>
              <li>Customer conduct</li>
              <li>Vendor conduct</li>
              <li>Indirect, incidental, punitive, or consequential damages</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">12.2 Indemnification</h3>
            <p className="text-muted-foreground">
              Vendors agree to indemnify and hold Cartevent harmless from any claims, damages, losses, 
              liabilities, legal expenses, or disputes arising from:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Vendor services</li>
              <li>Content uploaded by vendor</li>
              <li>Vendor interactions with customers</li>
              <li>Legal non-compliance</li>
              <li>Misuse of customer data</li>
              <li>Copyright/IP violations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">13. ACCEPTANCE</h2>
            <p className="text-muted-foreground">
              By registering, listing, or using Cartevent as a vendor, you acknowledge that you have:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Read these Terms</li>
              <li>Understood them</li>
              <li>Agreed to be bound by them</li>
            </ul>
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










