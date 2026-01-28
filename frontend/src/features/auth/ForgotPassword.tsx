import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useToast } from "@/shared/hooks/use-toast";
import { Loader2, ArrowLeft, Mail, CheckCircle2, KeyRound, Inbox, Clock, RotateCcw } from "lucide-react";
import { apiClient } from "@/shared/services/api";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      
      if (response.success) {
        setEmailSent(true);
        toast({
          title: "Email sent!",
          description: "Check your email for password reset instructions.",
          variant: "success",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />
        </div>
        
        <Card className="w-full max-w-md shadow-2xl shadow-emerald-500/5 border-0 bg-white/95 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Inbox</CardTitle>
            <CardDescription className="mt-2">
              We've sent a reset link to <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Check your email</p>
                  <p className="text-xs text-muted-foreground">Look for an email from cartevent</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <KeyRound className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Click the reset link</p>
                  <p className="text-xs text-muted-foreground">It will take you to create a new password</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Link expires in 1 hour</p>
                  <p className="text-xs text-muted-foreground">Request a new one if it expires</p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground py-2 border-t border-border/50 mt-4">
              Didn't receive it? Check spam or{" "}
              <button
                onClick={() => setEmailSent(false)}
                className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                try again
              </button>
            </div>

            <Link to="/login">
              <Button variant="outline" className="w-full h-11 rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      {/* Back to Login link */}
      <Link 
        to="/login" 
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm border border-border/50"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Login</span>
      </Link>
      
      <Card className="w-full max-w-md shadow-2xl shadow-primary/5 border-0 bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-2">
          <Link to="/" className="inline-flex items-center justify-center mb-4 group">
            <span className="text-2xl font-bold text-[#5046E5] group-hover:opacity-80 transition-opacity">
              cartevent<span className="text-[#7C6BFF]">.</span>
            </span>
          </Link>
          <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription className="mt-2">
            Enter your email and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-xl border-border/60 focus:border-primary pl-10"
                />
              </div>
              {email && !isValidEmail(email) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all" 
              disabled={isLoading || !email || !isValidEmail(email)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Remember your password?{" "}
              <Link to="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
