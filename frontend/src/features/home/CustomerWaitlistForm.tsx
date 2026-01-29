import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Loader2, Sparkles, CheckCircle2, Mail, User, Phone, PartyPopper, Bell, Check } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { apiClient } from '@/shared/services/api';

interface CustomerWaitlistFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerWaitlistForm = ({ open, onOpenChange }: CustomerWaitlistFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState({ name: '', email: '', phone: '' });
  const { toast } = useToast();

  const isValidPhone = (phone: string) => {
    return validatePhone(phone).isValid;
  };

  // Phone number validation for Indian mobile numbers
  const validatePhone = (phoneNumber: string): { isValid: boolean; error?: string; normalized?: string } => {
    if (!phoneNumber) return { isValid: false, error: "Phone number is required" };
    
    // Normalize: remove spaces, dashes, parentheses, dots
    let normalized = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
    
    // Remove +91 or 91 prefix if present
    if (normalized.startsWith('+91')) {
      normalized = normalized.substring(3);
    } else if (normalized.startsWith('91') && normalized.length === 12) {
      normalized = normalized.substring(2);
    }
    
    // Must be exactly 10 digits
    if (normalized.length !== 10) {
      return { isValid: false, error: "Phone number must be 10 digits" };
    }
    
    // Must start with 6, 7, 8, or 9 (Indian mobile)
    if (!/^[6-9]\d{9}$/.test(normalized)) {
      return { isValid: false, error: "Please enter a valid Indian mobile number" };
    }
    
    // Check for obvious fake patterns
    const fakeError = checkForFakeNumber(normalized);
    if (fakeError) {
      return { isValid: false, error: fakeError };
    }
    
    return { isValid: true, normalized };
  };
  
  // Check for obvious fake/test number patterns
  const checkForFakeNumber = (phone: string): string | null => {
    // All same digit
    if (new Set(phone).size === 1) {
      return "Please enter a valid phone number";
    }
    
    // Fully sequential (ascending or descending)
    const isSequential = (str: string, ascending: boolean): boolean => {
      for (let i = 1; i < str.length; i++) {
        const diff = str.charCodeAt(i) - str.charCodeAt(i - 1);
        if (ascending ? diff !== 1 : diff !== -1) return false;
      }
      return true;
    };
    
    if (isSequential(phone, true) || isSequential(phone, false)) {
      return "Please enter a valid phone number";
    }
    
    // Common test patterns
    const obviousFakes = [
      '1234567890', '0123456789', '9876543210',
      '1234567891', '1234567892', '1234567893', '1234567894',
      '1234567895', '1234567896', '1234567897', '1234567898', '1234567899',
      '9999999999', '8888888888', '7777777777', '6666666666',
    ];
    
    if (obviousFakes.includes(phone)) {
      return "Please enter a valid phone number";
    }
    
    // Repeating pairs (1212121212, 9898989898)
    const pair = phone.substring(0, 2);
    if (pair[0] !== pair[1] && phone === pair.repeat(5)) {
      return "Please enter a valid phone number";
    }
    
    // Too many repeated digits (7+ same digit)
    const digitCounts: Record<string, number> = {};
    for (const digit of phone) {
      digitCounts[digit] = (digitCounts[digit] || 0) + 1;
    }
    if (Object.values(digitCounts).some(count => count >= 7)) {
      return "Please enter a valid phone number";
    }
    
    return null;
  };

  // Get phone validation error message
  const getPhoneError = (phoneNumber: string): string | undefined => {
    if (!phoneNumber) return undefined;
    const result = validatePhone(phoneNumber);
    return result.isValid ? undefined : result.error;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if form is valid
  const isFormValid = 
    formData.name.trim().length >= 2 &&
    isValidEmail(formData.email) &&
    isValidPhone(formData.phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!isValidPhone(formData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number (at least 10 digits)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the backend API to store waitlist data
      await apiClient.post('/customer-waitlist', formData);
      
      // Store submitted data for success screen
      setSubmittedData({ name: formData.name, email: formData.email, phone: formData.phone });
      setShowSuccess(true);
      
      // Reset form
      setFormData({ name: '', email: '', phone: '' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to join waitlist. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    onOpenChange(false);
    // Reset form after dialog closes
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '' });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 shadow-2xl">
        {!showSuccess ? (
          <div className="relative">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10 px-6 pt-8 pb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-primary/10 mb-4">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground">Get Early Access</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2 text-sm">
                Be the first to book amazing vendors when we launch!
              </DialogDescription>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Your Name
                </Label>
                <Input
                  id="name"
                  placeholder="What should we call you?"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                  className="h-11 rounded-xl border-border/60 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                  className={`h-11 rounded-xl border-border/60 focus:border-primary ${formData.email && !isValidEmail(formData.email) ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {formData.email && !isValidEmail(formData.email) && (
                  <p className="text-xs text-red-500">Please enter a valid email address</p>
                )}
                {formData.email && isValidEmail(formData.email) && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <Check className="h-3 w-3" />
                    <span>Looks good!</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isSubmitting}
                  className={`h-11 rounded-xl border-border/60 focus:border-primary ${formData.phone && !isValidPhone(formData.phone) ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {formData.phone && !isValidPhone(formData.phone) && (
                  <p className="text-xs text-red-500">{getPhoneError(formData.phone)}</p>
                )}
                {formData.phone && isValidPhone(formData.phone) && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <Check className="h-3 w-3" />
                    <span>Valid number</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-semibold text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all mt-2"
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Join the Waitlist
                  </>
                )}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground pt-1">
                We'll only contact you about the launch. No spam, promise! 🤞
              </p>
            </form>
          </div>
        ) : (
          <div className="relative">
            {/* Success state with celebration */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 px-6 pt-10 pb-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4 animate-bounce" style={{ animationDuration: '1s', animationIterationCount: '2' }}>
                <PartyPopper className="h-10 w-10 text-emerald-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground">You're In!</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                Thanks <span className="font-semibold text-foreground">{submittedData.name}</span>! You're on the list.
              </DialogDescription>
            </div>
            
            <div className="px-6 pb-6 pt-4">
              {/* Notification details - cleaner layout */}
              <div className="bg-muted/50 rounded-xl p-4 mb-5 space-y-3">
                <p className="text-sm font-medium text-foreground text-center">We'll notify you when we launch</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{submittedData.email}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{submittedData.phone}</span>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleClose} className="w-full h-11 rounded-xl font-medium">
                Got it, thanks!
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
