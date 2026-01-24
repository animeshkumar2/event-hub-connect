import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/shared/contexts/AuthContext";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { CustomerWaitlistForm } from "@/features/home/CustomerWaitlistForm";

interface AuthProps {
  mode?: "login" | "signup";
}

const Auth = ({ mode: propMode }: AuthProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { login, loginWithGoogle, register, isAuthenticated } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Support mode and type from URL search params
  const urlMode = searchParams.get('mode') as "login" | "signup" | null;
  const urlType = searchParams.get('type');
  const mode = propMode || urlMode || "login";
  
  // PHASE 1: Show waitlist form if customer type is selected in signup
  const [showWaitlistForm, setShowWaitlistForm] = useState(
    mode === 'signup' && urlType === 'customer'
  );
  
  // Default to vendor for signup (Phase 1 priority), unless explicitly set to customer via URL
  const [isVendor, setIsVendor] = useState(
    urlType === 'customer' ? false : (mode === 'signup' || urlType === 'vendor')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
    phone?: string;
    identifier?: string;
  }>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    identifier: "", // For login - can be email or phone
  });

  // Load remembered identifier on mount
  useEffect(() => {
    const rememberedIdentifier = localStorage.getItem('remembered_identifier');
    if (rememberedIdentifier && mode === 'login') {
      setFormData(prev => ({ ...prev, identifier: rememberedIdentifier }));
      setRememberMe(true);
    }
  }, [mode]);

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    if (checks.length) score++;
    if (checks.uppercase) score++;
    if (checks.lowercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Medium', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  // Password requirements
  const passwordRequirements = useMemo(() => {
    const password = formData.password;
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'One lowercase letter', met: /[a-z]/.test(password) },
      { label: 'One number', met: /[0-9]/.test(password) },
    ];
  }, [formData.password]);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  
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
  
  // Simple validity check for form validation
  const isValidPhone = (phoneNumber: string): boolean => {
    return validatePhone(phoneNumber).isValid;
  };
  
  // Get phone validation error message
  const getPhoneError = (phoneNumber: string): string | undefined => {
    if (!phoneNumber) return undefined;
    const result = validatePhone(phoneNumber);
    return result.isValid ? undefined : result.error;
  };
  
  // Check if form is valid for signup
  const isSignupFormValid = useMemo(() => {
    if (mode !== 'signup') return true;
    return (
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      isValidEmail(formData.email) &&
      formData.password.length >= 8 &&
      formData.confirmPassword === formData.password &&
      formData.phone.trim() !== '' &&
      isValidPhone(formData.phone)
    );
  }, [mode, formData]);

  // Check if form is valid for login
  const isLoginFormValid = useMemo(() => {
    if (mode !== 'login') return true;
    const identifier = formData.identifier.trim();
    // Valid if it's a valid email OR a valid phone
    const isValidIdentifier = isValidEmail(identifier) || isValidPhone(identifier);
    return (
      identifier !== '' &&
      isValidIdentifier &&
      formData.password.trim() !== ''
    );
  }, [mode, formData]);

  // Reset form when mode changes and load remembered identifier for login
  useEffect(() => {
    const rememberedIdentifier = localStorage.getItem('remembered_identifier');
    const shouldRemember = localStorage.getItem('remember_me') === 'true';
    
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      identifier: (mode === 'login' && shouldRemember && rememberedIdentifier) ? rememberedIdentifier : "",
    });
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    // Set remember me checkbox if identifier was remembered
    if (mode === 'login' && shouldRemember && rememberedIdentifier) {
      setRememberMe(true);
    } else {
      setRememberMe(false);
    }
    
    // Reset vendor selection to default (vendor for signup, based on URL for login)
    if (mode === 'signup') {
      setIsVendor(urlType === 'customer' ? false : true); // Default to vendor for signup
    }
  }, [mode, urlType]);

  // Note: Removed early redirect for authenticated users
  // The handleSubmit function now handles all redirects based on user role
  // This prevents vendors from being incorrectly redirected to "/" after login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage("Authenticating...");

    try {
      if (mode === "signup") {
        // Validation
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          setIsLoading(false);
          setLoadingMessage("");
          return;
        }

        if (formData.password.length < 6) {
          toast({
            title: "Error",
            description: "Password must be at least 6 characters",
            variant: "destructive",
          });
          setIsLoading(false);
          setLoadingMessage("");
          return;
        }

        if (!formData.name.trim()) {
          toast({
            title: "Error",
            description: "Full name is required",
            variant: "destructive",
          });
          setIsLoading(false);
          setLoadingMessage("");
          return;
        }

        // Validate phone number
        if (!formData.phone || !formData.phone.trim()) {
          setFieldErrors({
            phone: "Phone number is required",
          });
          toast({
            title: "Validation Error",
            description: "Please enter your phone number",
            variant: "destructive",
          });
          setIsLoading(false);
          setLoadingMessage("");
          return;
        }

        // Register
        setLoadingMessage("Creating your account...");
        await register({
          email: formData.email,
          password: formData.password,
          fullName: formData.name,
          phone: formData.phone,
          isVendor: isVendor,
        });

        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        });

        // Navigate based on user type
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const userRole = localStorage.getItem('user_role') || userData.role;
        
        if (userRole === 'ADMIN') {
          setLoadingMessage("Redirecting to admin dashboard...");
          navigate('/admin/dashboard');
        } else if (isVendor || userRole === 'VENDOR' || userData.role === 'VENDOR') {
          // Go directly to profile page to complete mandatory fields
          setLoadingMessage("Setting up your profile...");
          navigate("/vendor/profile");
        } else {
          // Customer
          setLoadingMessage("Redirecting...");
          navigate("/");
        }
      } else {
        // Login - validate identifier (email or phone)
        const identifier = formData.identifier.trim();
        if (!identifier) {
          setFieldErrors({ identifier: "Please enter your email or phone number" });
          toast({
            title: "Validation Error",
            description: "Please enter your email or phone number",
            variant: "destructive",
          });
          setIsLoading(false);
          setLoadingMessage("");
          return;
        }
        
        // Check if it's a valid email or phone
        if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
          setFieldErrors({ identifier: "Please enter a valid email or phone number" });
          toast({
            title: "Validation Error",
            description: "Please enter a valid email or phone number",
            variant: "destructive",
          });
          setIsLoading(false);
          setLoadingMessage("");
          return;
        }
        
        // Login
        setLoadingMessage("Signing you in...");
        await login(identifier, formData.password);

        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('remembered_identifier', identifier);
          localStorage.setItem('remember_me', 'true');
        } else {
          localStorage.removeItem('remembered_identifier');
          localStorage.removeItem('remember_me');
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        // Check for redirect parameter
        const redirect = searchParams.get('redirect');
        if (redirect) {
          setLoadingMessage("Redirecting...");
          navigate(redirect);
        } else {
          // Navigate based on user role
          const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
          const userRole = localStorage.getItem('user_role') || userData.role;
          const vendorId = localStorage.getItem('vendor_id');
          
          if (userRole === 'ADMIN') {
            setLoadingMessage("Redirecting to admin dashboard...");
            navigate('/admin/dashboard');
          } else if (userRole === 'VENDOR' || userData.role === 'VENDOR') {
            // If vendor has profile, go to dashboard; otherwise go to profile to set up
            if (vendorId) {
              setLoadingMessage("Redirecting to dashboard...");
              navigate('/vendor/dashboard');
            } else {
              setLoadingMessage("Setting up your profile...");
              navigate('/vendor/profile');
            }
          } else {
            // Customer or default
            setLoadingMessage("Redirecting...");
            navigate("/");
          }
        }
      }
    } catch (error: any) {
      // Clear previous errors
      setFieldErrors({});
      
      // Parse error code and show specific message
      const errorCode = error.code || error.errorCode;
      const errorMessage = error.message || (mode === "login" ? "Login failed" : "Registration failed");
      
      // Map error codes to field-specific errors
      if (errorCode === 'EMAIL_NOT_FOUND') {
        setFieldErrors({ identifier: "No account found with this email" });
      } else if (errorCode === 'PHONE_NOT_FOUND') {
        setFieldErrors({ identifier: "No account found with this phone number" });
      } else if (errorCode === 'INVALID_PASSWORD') {
        setFieldErrors({ password: "Incorrect password" });
      } else if (errorCode === 'EMAIL_ALREADY_EXISTS') {
        setFieldErrors({ email: "This email is already registered" });
      } else if (errorCode === 'PHONE_ALREADY_EXISTS') {
        setFieldErrors({ phone: "This phone number is already registered" });
      } else if (errorCode === 'INVALID_PHONE_FORMAT') {
        setFieldErrors({ identifier: errorMessage });
      } else if (errorCode === 'WEAK_PASSWORD') {
        setFieldErrors({ password: "Password must be at least 8 characters" });
      } else {
        // Show generic error in toast
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      // Stop loading and prevent any navigation
      setIsLoading(false);
      setLoadingMessage("");
      return; // Explicitly return to prevent any further execution
    } finally {
      // Ensure loading state is cleared even if return is called
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast({
        title: "Error",
        description: "Google sign-in failed. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsGoogleLoading(true);
    setLoadingMessage("Verifying with Google...");
    
    try {
      await loginWithGoogle({
        credential: credentialResponse.credential,
        clientId: credentialResponse.clientId || '',
        select_by: credentialResponse.select_by || '',
      }, isVendor);

      toast({
        title: mode === "signup" ? "Account created!" : "Welcome!",
        description: "You have successfully signed in with Google.",
      });

      // Navigate based on redirect or user type
      const redirect = searchParams.get('redirect');
      if (redirect) {
        setLoadingMessage("Redirecting...");
        navigate(redirect);
      } else {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const userRole = localStorage.getItem('user_role') || userData.role;
        const vendorId = localStorage.getItem('vendor_id');
        
        if (userRole === 'ADMIN') {
          setLoadingMessage("Redirecting to admin dashboard...");
          navigate('/admin/dashboard');
        } else if (isVendor || userRole === 'VENDOR' || userData.role === 'VENDOR') {
          // If vendor has profile, go to dashboard; otherwise go to profile to set up
          if (vendorId) {
            setLoadingMessage("Redirecting to dashboard...");
            navigate('/vendor/dashboard');
          } else {
            setLoadingMessage("Setting up your profile...");
            navigate('/vendor/profile');
          }
        } else {
          // Customer
          setLoadingMessage("Redirecting...");
          navigate("/");
        }
      }
    } catch (error: any) {
      // Better error handling with specific messages
      let errorTitle = "Sign-In Failed";
      let errorMessage = "Please try again or use email/password.";
      
      if (error.message?.includes("network")) {
        errorTitle = "Network Error";
        errorMessage = "Please check your internet connection and try again.";
      } else if (error.message?.includes("already exists")) {
        errorTitle = "Account Exists";
        errorMessage = "This email is already registered. Please log in instead.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
      setLoadingMessage("");
    }
  };

  const handleGoogleError = () => {
    setIsGoogleLoading(false);
    setLoadingMessage("");
    
    toast({
      title: "Google Sign-In Cancelled",
      description: "You can try again or use email/password to sign in.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <Link to="/" className="text-2xl font-bold text-[#5046E5] mb-4 inline-block">
            cartevent<span className="text-[#7C6BFF]">.</span>
          </Link>
          <CardTitle className="text-2xl">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Enter your credentials to access your account"
              : "Sign up to start booking event vendors"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Vendor Selection - PHASE 1: Show waitlist form for customers */}
          {mode === "signup" && (
            <div className="mb-4">
              <Label className="text-sm font-medium mb-3 block">I want to sign up as:</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsVendor(true);
                    setShowWaitlistForm(false);
                  }}
                  disabled={isLoading || isGoogleLoading}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isVendor && !showWaitlistForm
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">💼</div>
                    <div className="font-semibold text-sm">Vendor</div>
                    <div className="text-xs text-muted-foreground mt-1">Offer services</div>
                  </div>
                </button>
                {/* PHASE 1: Customer option opens waitlist form */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVendor(false);
                      setShowWaitlistForm(true);
                    }}
                    disabled={isLoading || isGoogleLoading}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      !isVendor && showWaitlistForm
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎉</div>
                      <div className="font-semibold text-sm">Customer</div>
                      <div className="text-xs text-muted-foreground mt-1">Join waitlist</div>
                    </div>
                  </button>
                  {/* Coming Soon Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-sm opacity-75"></div>
                      <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg uppercase tracking-wider">
                        Soon
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PHASE 1: Show waitlist form for customers in a dialog */}
          <CustomerWaitlistForm 
            open={mode === "signup" && showWaitlistForm} 
            onOpenChange={(open) => {
              if (!open) {
                // When form is closed, go back to vendor selection
                setShowWaitlistForm(false);
                setIsVendor(true);
              }
            }} 
          />

          {/* Regular Vendor Signup / Login Form - Hide when waitlist form is shown */}
          {!(mode === "signup" && showWaitlistForm) && (
            <>
          {/* Google Sign-In Button - Only show if client ID is configured */}
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="mb-6">
              <div className="flex justify-center">
                {isGoogleLoading ? (
                  <Button disabled className="w-full h-10">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingMessage || "Signing in with Google..."}
                  </Button>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="outline"
                    size="large"
                    width="100%"
                    text={mode === "login" ? "signin_with" : "signup_with"}
                  />
                )}
              </div>
              
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with phone
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Identifier field for login (email or phone) */}
            {mode === "login" && (
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Phone Number</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="you@example.com or 9876543210"
                  value={formData.identifier}
                  onChange={(e) => {
                    setFormData({ ...formData, identifier: e.target.value });
                    if (fieldErrors.identifier) {
                      setFieldErrors({ ...fieldErrors, identifier: undefined });
                    }
                  }}
                  required
                  disabled={isLoading}
                  className={fieldErrors.identifier ? "border-red-500" : ""}
                />
                {fieldErrors.identifier && (
                  <p className="text-sm text-red-500">{fieldErrors.identifier}</p>
                )}
              </div>
            )}

            {/* Phone field - required for signup only */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (fieldErrors.phone) {
                      setFieldErrors({ ...fieldErrors, phone: undefined });
                    }
                  }}
                  disabled={isLoading}
                  required
                  className={fieldErrors.phone || (formData.phone && !isValidPhone(formData.phone)) ? "border-red-500" : ""}
                />
                {fieldErrors.phone && (
                  <p className="text-sm text-red-500">{fieldErrors.phone}</p>
                )}
                {formData.phone && !isValidPhone(formData.phone) && !fieldErrors.phone && (
                  <p className="text-sm text-red-500">{getPhoneError(formData.phone) || "Please enter a valid phone number"}</p>
                )}
                {formData.phone && isValidPhone(formData.phone) && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <Check className="h-3 w-3" />
                    <span>Valid phone number</span>
                  </div>
                )}
              </div>
            )}

            {/* Email field - required for signup */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    // Clear error when user starts typing
                    if (fieldErrors.email) {
                      setFieldErrors({ ...fieldErrors, email: undefined });
                    }
                  }}
                  onBlur={() => {
                    // Validate email on blur
                    if (formData.email && !isValidEmail(formData.email)) {
                      setFieldErrors({ ...fieldErrors, email: 'Please enter a valid email address' });
                    }
                  }}
                  required
                  disabled={isLoading}
                  className={fieldErrors.email ? "border-red-500" : ""}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500">{fieldErrors.email}</p>
                )}
                {formData.email && !isValidEmail(formData.email) && !fieldErrors.email && (
                  <p className="text-sm text-red-500">Please enter a valid email address</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    // Clear error when user starts typing
                    if (fieldErrors.password) {
                      setFieldErrors({ ...fieldErrors, password: undefined });
                    }
                  }}
                  required
                  disabled={isLoading}
                  minLength={mode === "signup" ? 8 : undefined}
                  className={fieldErrors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-500">{fieldErrors.password}</p>
              )}
              
              {/* Password strength indicator for signup */}
              {mode === "signup" && formData.password && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {passwordStrength.label}
                    </span>
                  </div>
                  
                  {/* Password requirements checklist */}
                  <div className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {req.met ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        // Clear error when user starts typing
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                        }
                      }}
                      onBlur={() => {
                        // Check if passwords match on blur
                        if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
                          setFieldErrors({ ...fieldErrors, confirmPassword: 'Passwords do not match' });
                        }
                      }}
                      required
                      disabled={isLoading}
                      className={fieldErrors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{fieldErrors.confirmPassword}</p>
                  )}
                  {/* Show success indicator when passwords match and no error */}
                  {!fieldErrors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                      <Check className="h-3 w-3" />
                      <span>Passwords match</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Remember Me checkbox - only for login */}
            {mode === "login" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    disabled={isLoading}
                  />
                  <Label 
                    htmlFor="remember-me" 
                    className="text-sm font-normal cursor-pointer text-muted-foreground"
                  >
                    Remember me
                  </Label>
                </div>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || (mode === 'signup' ? !isSignupFormValid : !isLoginFormValid)}>
              {isLoading || isGoogleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {loadingMessage || (mode === "login" ? "Signing in..." : "Creating account...")}
                </>
              ) : (
                mode === "login" ? "Sign In" : "Create Account"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </form>
          </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
