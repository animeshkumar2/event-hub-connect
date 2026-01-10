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

interface AuthProps {
  mode?: "login" | "signup";
}

const Auth = ({ mode: propMode }: AuthProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { login, loginWithGoogle, register, isAuthenticated, user } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Support mode and type from URL search params
  const urlMode = searchParams.get('mode') as "login" | "signup" | null;
  const urlType = searchParams.get('type');
  const mode = propMode || urlMode || "login";
  
  const [isVendor, setIsVendor] = useState(urlType === 'vendor');
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
  }>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail && mode === 'login') {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
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

  // Reset form when mode changes and load remembered email for login
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    const shouldRemember = localStorage.getItem('remember_me') === 'true';
    
    setFormData({
      name: "",
      email: (mode === 'login' && shouldRemember && rememberedEmail) ? rememberedEmail : "",
      password: "",
      confirmPassword: "",
      phone: "",
    });
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    // Set remember me checkbox if email was remembered
    if (mode === 'login' && shouldRemember && rememberedEmail) {
      setRememberMe(true);
    } else {
      setRememberMe(false);
    }
  }, [mode]);

  // Redirect if already authenticated (but allow vendor onboarding)
  if (isAuthenticated && !isLoading && mode === "login") {
    navigate("/");
    return null;
  }
  // For signup, allow authenticated users to proceed (they might be completing onboarding)

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

        // Register
        setLoadingMessage("Creating your account...");
        await register({
          email: formData.email,
          password: formData.password,
          fullName: formData.name,
          phone: formData.phone || undefined,
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
          // For vendors, ensure vendor ID is fetched before navigating
          // This prevents race condition where dashboard loads before vendor ID is available
          setLoadingMessage("Setting up your vendor profile...");
          await ensureVendorIdLoaded();
          setLoadingMessage("Redirecting to dashboard...");
          navigate("/vendor/dashboard");
        } else {
          // Customer
          setLoadingMessage("Redirecting...");
          navigate("/");
        }
      } else {
        // Login
        setLoadingMessage("Signing you in...");
        await login(formData.email, formData.password);

        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('remembered_email', formData.email);
          localStorage.setItem('remember_me', 'true');
        } else {
          localStorage.removeItem('remembered_email');
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
          
          if (userRole === 'ADMIN') {
            setLoadingMessage("Redirecting to admin dashboard...");
            navigate('/admin/dashboard');
          } else if (userRole === 'VENDOR' || userData.role === 'VENDOR') {
            // For vendors, ensure vendor ID is fetched before navigating
            // This prevents race condition where dashboard loads before vendor ID is available
            setLoadingMessage("Loading your vendor profile...");
            await ensureVendorIdLoaded();
            setLoadingMessage("Redirecting to dashboard...");
            navigate('/vendor/dashboard');
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
        setFieldErrors({ email: "No account found with this email" });
      } else if (errorCode === 'INVALID_PASSWORD') {
        setFieldErrors({ password: "Incorrect password" });
      } else if (errorCode === 'EMAIL_ALREADY_EXISTS') {
        setFieldErrors({ email: "This email is already registered" });
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
    } finally {
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
        
        if (userRole === 'ADMIN') {
          setLoadingMessage("Redirecting to admin dashboard...");
          navigate('/admin/dashboard');
        } else if (isVendor || userRole === 'VENDOR' || userData.role === 'VENDOR') {
          // For vendors, ensure vendor ID is fetched before navigating
          // This prevents race condition where dashboard loads before vendor ID is available
          setLoadingMessage("Setting up your profile...");
          await ensureVendorIdLoaded();
          setLoadingMessage("Redirecting to dashboard...");
          navigate('/vendor/dashboard');
        } else {
          // Customer
          setLoadingMessage("Redirecting...");
          navigate("/");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Google sign-in failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
      setLoadingMessage("");
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Error",
      description: "Google sign-in was cancelled or failed. Please try again.",
      variant: "destructive",
    });
  };

  // Helper function to ensure vendor ID is loaded before navigating
  const ensureVendorIdLoaded = async () => {
    // Check if vendor ID is already in localStorage
    const existingVendorId = localStorage.getItem('vendor_id');
    if (existingVendorId) {
      return; // Already loaded
    }

    // If not, fetch it from the API
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.warn('No user ID found, cannot fetch vendor ID');
        return;
      }

      // Import vendorApi dynamically to avoid circular dependencies
      const { vendorApi } = await import('@/shared/services/api');
      const response = await vendorApi.getVendorByUserId(userId);
      
      if (response.success && response.data?.id) {
        localStorage.setItem('vendor_id', response.data.id);
      } else {
        console.warn('Vendor not found - user may need to complete onboarding');
      }
    } catch (error) {
      console.error('Error fetching vendor ID:', error);
      // Don't throw - let the dashboard handle the missing vendor ID
    }
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
          {/* Vendor Checkbox - Show BEFORE Google Sign-In for signup */}
          {mode === "signup" && (
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <Checkbox
                id="vendor-google"
                checked={isVendor}
                onCheckedChange={(checked) => setIsVendor(checked === true)}
                disabled={isLoading || isGoogleLoading}
              />
              <Label htmlFor="vendor-google" className="text-sm font-medium cursor-pointer">
                I want to register as a vendor
              </Label>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="mb-6">
            <div className="flex justify-center">
              {isGoogleLoading ? (
                <Button disabled className="w-full h-10">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in with Google...
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
                  Or continue with email
                </span>
              </div>
            </div>
          </div>

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

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
            </div>

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
                  {/* Show success indicator when passwords match */}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                      <Check className="h-3 w-3" />
                      <span>Passwords match</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isLoading}
                  />
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

            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
