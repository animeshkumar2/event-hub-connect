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
  const [submittedData, setSubmittedData] = useState({ name: '', email: '' });
  const { toast } = useToast();

  const isValidPhone = (phone: string) => {
    // Normalize and check for 10 digits
    const normalized = phone.replace(/[\s\-\(\)\+]/g, '');
    return /^\d{10,12}$/.test(normalized);
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
      setSubmittedData({ name: formData.name, email: formData.email });
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
                  className="h-11 rounded-xl border-border/60 focus:border-primary"
                />
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
                  className="h-11 rounded-xl border-border/60 focus:border-primary"
                />
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
              <DialogTitle className="text-2xl font-bold text-foreground">You're In! 🎉</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                Thanks <span className="font-semibold text-foreground">{submittedData.name}</span>! You're on the list.
              </DialogDescription>
            </div>
            
            <div className="px-6 pb-6 pt-4">
              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">We'll notify you at</p>
                    <p className="text-sm text-muted-foreground">{submittedData.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 mb-5">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">💡 Know a vendor?</span> Tell them to join now and get free lifetime access as one of our first 100 vendors!
                </p>
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
