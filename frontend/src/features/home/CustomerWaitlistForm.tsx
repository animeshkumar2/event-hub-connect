import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Loader2, Sparkles, CheckCircle2, Mail, User, Phone } from 'lucide-react';
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
  const { toast } = useToast();

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[\d\s+()-]{10,}$/;
    return phoneRegex.test(phone);
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
      // Note: apiClient already has /api as base URL, so we don't add it again
      await apiClient.post('/customer-waitlist', formData);
      
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
      <DialogContent className="sm:max-w-md">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">Join the Waitlist!</DialogTitle>
              <DialogDescription className="text-center">
                Be the first to know when we launch for customers. We'll keep you updated, <span className="font-semibold text-foreground">{formData.name || 'friend'}</span>!
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-glow"
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Waitlist'
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <DialogTitle className="text-2xl mb-3">You're on the list!</DialogTitle>
            <DialogDescription className="text-base mb-6">
              Thanks for your interest, <span className="font-semibold text-foreground">{formData.name || 'friend'}</span>! We'll notify you at <span className="font-semibold text-foreground">{formData.email}</span> as soon as we launch for customers.
            </DialogDescription>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                💡 <span className="font-semibold">Pro tip:</span> Know a vendor? Ask them to join now and get free lifetime access as one of our first 100 vendors!
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Got it!
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
