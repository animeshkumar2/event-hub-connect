import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/shared/contexts/AuthContext";
import { Loader2 } from "lucide-react";
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  // Redirect if already authenticated (but allow vendor onboarding)
  if (isAuthenticated && !isLoading && mode === "login") {
    navigate("/");
    return null;
  }
  // For signup, allow authenticated users to proceed (they might be completing onboarding)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
          return;
        }

        if (formData.password.length < 6) {
          toast({
            title: "Error",
            description: "Password must be at least 6 characters",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!formData.name.trim()) {
          toast({
            title: "Error",
            description: "Full name is required",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Register
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

        // For vendor signup, navigate to onboarding
        // For customer signup, navigate to home
        if (isVendor) {
          // Small delay to ensure state is saved
          setTimeout(() => {
            navigate("/vendor/onboarding");
          }, 100);
        } else {
          navigate("/");
        }
      } else {
        // Login
        await login(formData.email, formData.password);

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        // Small delay to ensure state is updated
        setTimeout(() => {
          // Check for redirect parameter
          const redirect = searchParams.get('redirect');
          if (redirect) {
            navigate(redirect);
          } else {
            // If vendor, check if they have completed onboarding
            const vendorId = localStorage.getItem('vendor_id');
            const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
            if (userData.role === 'VENDOR') {
              if (vendorId) {
                navigate('/vendor/dashboard');
              } else {
                navigate('/vendor/onboarding');
              }
            } else {
              navigate("/");
            }
          }
        }, 100);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || (mode === "login" ? "Login failed. Please check your credentials." : "Registration failed. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

      // Small delay to ensure state is updated
      setTimeout(() => {
        const redirect = searchParams.get('redirect');
        if (redirect) {
          navigate(redirect);
        } else if (isVendor) {
          // Check if vendor has completed onboarding
          const vendorId = localStorage.getItem('vendor_id');
          if (vendorId) {
            navigate('/vendor/dashboard');
          } else {
            navigate('/vendor/onboarding');
          }
        } else {
          navigate("/");
        }
      }, 100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Google sign-in failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Error",
      description: "Google sign-in was cancelled or failed. Please try again.",
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={mode === "login" ? "Enter your password" : "At least 6 characters"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                minLength={mode === "signup" ? 6 : undefined}
              />
            </div>

            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={isLoading}
                  />
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
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
