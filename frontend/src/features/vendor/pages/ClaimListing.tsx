import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { 
  CheckCircle2, 
  ArrowRight,
  Phone,
  Mail,
  Building2,
  Loader2,
  AlertCircle,
  Gift,
  Check,
  X,
  Eye,
  EyeOff,
  Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/shared/contexts/AuthContext';

interface ClaimData {
  businessName: string;
  email: string;
  mobile: string;
  tokenValid: boolean;
  alreadyClaimed: boolean;
}

export default function ClaimListing() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Add shimmer and scale animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [password, setPassword] = useState('Welcome@2025');
  const [confirmPassword, setConfirmPassword] = useState('Welcome@2025');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  
  // Edit mode for pre-filled fields
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingMobile, setEditingMobile] = useState(false);
  
  // Field errors
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    mobile?: string;
    password?: string;
    confirmPassword?: string;
  }>({});


  // Email validation
  const isValidEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  // Phone validation
  const isValidPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && /^[6-9]/.test(cleaned);
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: pwd.length >= 6,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
    };

    if (checks.length) score++;
    if (checks.uppercase) score++;
    if (checks.lowercase) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Medium', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  // Password requirements
  const passwordRequirements = useMemo(() => {
    return [
      { label: 'At least 6 characters', met: password.length >= 6 },
      { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    ];
  }, [password]);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    // Use edited value if exists, otherwise original
    const finalEmail = email || claimData?.email || '';
    const finalMobile = mobile || claimData?.mobile || '';
    return (
      finalEmail.trim() !== '' &&
      isValidEmail(finalEmail) &&
      finalMobile.trim() !== '' &&
      isValidPhone(finalMobile) &&
      password.length >= 6 &&
      confirmPassword === password
    );
  }, [claimData?.email, claimData?.mobile, email, mobile, password, confirmPassword]);

  useEffect(() => {
    if (token) {
      fetchClaimData();
    }
  }, [token]);

  const fetchClaimData = async () => {
    try {
      setLoading(true);
      
      // Try to decode base64 data from token
      try {
        let base64 = token!.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        
        const decoded = JSON.parse(atob(base64));
        
        if (decoded.b && decoded.m) {
          setClaimData({
            businessName: decoded.b,
            email: decoded.e || '',
            mobile: decoded.m,
            tokenValid: true,
            alreadyClaimed: false
          });
          setLoading(false);
          return;
        }
      } catch (decodeErr) {
        console.log('Not base64, trying API...');
      }
      
      // MOCK DATA FOR TESTING - Remove when backend is ready
      if (token === 'test123' || token === 'demo') {
        setClaimData({
          businessName: 'Studio X Photography',
          email: 'rahul@studiox.com',
          mobile: '9876543210',
          tokenValid: true,
          alreadyClaimed: false
        });
        setLoading(false);
        return;
      }
      if (token === 'noemail') {
        setClaimData({
          businessName: 'Priya Decorations',
          email: '',
          mobile: '9876543211',
          tokenValid: true,
          alreadyClaimed: false
        });
        setLoading(false);
        return;
      }
      // END MOCK DATA
      
      // If we reach here, the token couldn't be decoded
      setError('Invalid or expired claim link. Please contact support.');
    } catch (err) {
      setError('Invalid or expired claim link. Please contact support.');
    } finally {
      setLoading(false);
    }
  };


  const handleClaimAccount = async () => {
    // Clear previous errors
    setFieldErrors({});
    
    // Get final values - use edited value if it exists, otherwise original
    // Note: email/mobile state holds the edited value even after blur
    const finalEmail = email || claimData?.email || '';
    const finalMobile = mobile || claimData?.mobile || '';
    
    // Validate email
    if (!finalEmail || !finalEmail.trim()) {
      setFieldErrors(prev => ({ ...prev, email: 'Email address is required' }));
      toast.error('Please enter your email address');
      return;
    }
    if (!isValidEmail(finalEmail)) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Validate mobile
    if (!finalMobile || !finalMobile.trim()) {
      setFieldErrors(prev => ({ ...prev, mobile: 'Mobile number is required' }));
      toast.error('Please enter your mobile number');
      return;
    }
    if (!isValidPhone(finalMobile)) {
      setFieldErrors(prev => ({ ...prev, mobile: 'Please enter a valid 10-digit mobile number' }));
      toast.error('Please enter a valid mobile number');
      return;
    }
    
    // Validate password
    if (!password || password.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      setClaiming(true);
      
      // Use the same register API as signup page
      await register({
        email: finalEmail,
        password,
        fullName: claimData?.businessName || '',
        phone: finalMobile,
        isVendor: true, // Claim is always for vendors
      });
      
      toast.success('Account claimed successfully! Setting up your profile...');
      // Navigate to profile page to complete setup
      setTimeout(() => navigate('/vendor/profile'), 1000);
      
    } catch (err: any) {
      // Handle specific error codes
      if (err.code === 'EMAIL_ALREADY_EXISTS' || err.message?.includes('email')) {
        setFieldErrors(prev => ({ ...prev, email: 'This email is already registered' }));
        toast.error('This email is already registered. Please login instead.');
      } else if (err.code === 'PHONE_ALREADY_EXISTS' || err.message?.includes('phone')) {
        toast.error('This phone number is already registered. Please login instead.');
      } else {
        toast.error(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setClaiming(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Verifying your claim link...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Link Invalid</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Go to Login
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-1.5 mb-4">
            <Gift className="h-4 w-4" />
            <span className="text-sm font-medium">Exclusive Invitation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Welcome, {claimData?.businessName}!
          </h1>
          <p className="text-gray-600">
            Claim your free listing on CartEvent
          </p>
        </div>

        {/* Claim Form Card */}
        <Card className="shadow-xl border-2 border-purple-100">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Pre-filled Business Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-100">
              <div className="font-semibold text-gray-900 text-lg">{claimData?.businessName}</div>
            </div>

            <div className="space-y-4">
              {/* Mobile - Editable with pencil icon */}
              {!editingMobile && claimData?.mobile ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Mobile</div>
                    <div className="text-gray-900">{mobile || claimData.mobile}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobile(mobile || claimData.mobile);
                      setEditingMobile(true);
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                    title="Edit mobile number"
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="mobile" className="text-sm font-medium">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="9876543210"
                    value={mobile}
                    autoFocus
                    onChange={(e) => {
                      setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                      if (fieldErrors.mobile) {
                        setFieldErrors(prev => ({ ...prev, mobile: undefined }));
                      }
                    }}
                    onBlur={() => {
                      // Only go back to display mode if we have a valid value
                      if (mobile && isValidPhone(mobile)) {
                        setEditingMobile(false);
                      }
                    }}
                    className={`h-11 ${fieldErrors.mobile ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {fieldErrors.mobile && (
                    <p className="text-xs text-red-500">{fieldErrors.mobile}</p>
                  )}
                  {mobile && !isValidPhone(mobile) && !fieldErrors.mobile && (
                    <p className="text-xs text-red-500">Enter a valid 10-digit mobile number</p>
                  )}
                  {mobile && isValidPhone(mobile) && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <Check className="h-3 w-3" />
                      <span>Valid mobile number</span>
                    </div>
                  )}
                </div>
              )}

              {/* Email - Editable with pencil icon */}
              {!editingEmail && claimData?.email ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-gray-900">{email || claimData.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(email || claimData.email);
                      setEditingEmail(true);
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                    title="Edit email address"
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    autoFocus
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                    onBlur={() => {
                      if (email && !isValidEmail(email)) {
                        setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
                      } else if (email && isValidEmail(email)) {
                        // Go back to display mode if valid
                        setEditingEmail(false);
                      }
                    }}
                    className={`h-11 ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500">{fieldErrors.email}</p>
                  )}
                  {email && !isValidEmail(email) && !fieldErrors.email && (
                    <p className="text-xs text-red-500">Please enter a valid email address</p>
                  )}
                  {email && isValidEmail(email) && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <Check className="h-3 w-3" />
                      <span>Valid email</span>
                    </div>
                  )}
                </div>
              )}


              {/* Password with strength indicator */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password && e.target.value.length >= 6) {
                        setFieldErrors(prev => ({ ...prev, password: undefined }));
                      }
                    }}
                    onBlur={() => {
                      if (password && password.length < 6) {
                        setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
                      }
                    }}
                    className={`h-11 pr-10 ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-500">{fieldErrors.password}</p>
                )}
                
                {/* Password strength indicator */}
                {password && (
                  <div className="space-y-2 mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.label === 'Strong' ? 'text-emerald-600' :
                        passwordStrength.label === 'Medium' ? 'text-amber-600' : 'text-red-500'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    
                    {/* Password requirements checklist */}
                    <div className="grid grid-cols-2 gap-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-xs">
                          {req.met ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-gray-300" />
                          )}
                          <span className={req.met ? "text-emerald-600" : "text-gray-400"}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    onBlur={() => {
                      if (confirmPassword && password !== confirmPassword) {
                        setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
                      }
                    }}
                    className={`h-11 pr-10 ${fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                )}
                {!fieldErrors.confirmPassword && confirmPassword && password === confirmPassword && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <Check className="h-3 w-3" />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>


              {/* BIG Claim Button with shine and breathe animation */}
              <Button 
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg relative overflow-hidden group mt-2"
                style={{ animation: 'breathe 2s ease-in-out infinite' }}
                onClick={handleClaimAccount}
                disabled={claiming || !isFormValid}
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                
                {claiming ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Claiming...
                  </>
                ) : (
                  <span className="relative flex items-center justify-center gap-2">
                    🚀 Start Getting Bookings
                    <ArrowRight className="h-5 w-5 animate-bounce" />
                  </span>
                )}
              </Button>

              {/* Simple benefit line */}
              <p className="text-center text-sm text-gray-600">
                ✓ Get bookings &nbsp; ✓ Verified badge &nbsp; ✓ Easy setup
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <p className="text-xs text-center text-gray-500 mt-4">
          By claiming, you agree to our{' '}
          <a href="/vendor-terms" className="text-purple-600 hover:underline">Terms</a>
          {' '}and{' '}
          <a href="/vendor-privacy" className="text-purple-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
