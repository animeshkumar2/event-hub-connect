import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, vendorApi } from '@/shared/services/api';
import { jwtDecode } from 'jwt-decode';

interface GoogleCredentialResponse {
  credential: string;
  clientId: string;
  select_by: string;
}

interface GoogleDecodedToken {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
}

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credentialResponse: GoogleCredentialResponse, isVendor?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshVendorInfo: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  isVendor?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to batch localStorage operations
// This reduces UI blocking on slow devices by batching multiple sync operations
const batchLocalStorageUpdate = (updates: Record<string, string | null>) => {
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');
    const storedUserId = localStorage.getItem('user_id');
    const storedVendorId = localStorage.getItem('vendor_id');
    const storedRole = localStorage.getItem('user_role');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // If admin role is stored separately, use it
        if (storedRole === 'ADMIN' && userData.role !== 'ADMIN') {
          userData.role = 'ADMIN';
        }
        setToken(storedToken);
        setUser(userData);
        apiClient.setToken(storedToken);
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear invalid data using batch operation
        batchLocalStorageUpdate({
          'auth_token': null,
          'user_data': null,
          'user_id': null,
          'vendor_id': null,
          'user_role': null,
        });
      }
    }
    setIsLoading(false);
  }, []);

  const loginWithGoogle = async (credentialResponse: GoogleCredentialResponse, isVendor: boolean = false) => {
    try {
      // Decode the Google credential to get user info
      const decoded = jwtDecode<GoogleDecodedToken>(credentialResponse.credential);
      
      // Send to backend for verification and user creation/login
      const response = await apiClient.post<{
        token: string;
        userId: string;
        email: string;
        role: string;
        isNewUser?: boolean;
        vendorId?: string;
      }>('/auth/google', {
        credential: credentialResponse.credential,
        isVendor: isVendor,
      });

      if (response.success && response.data) {
        const { token: newToken, userId, email: userEmail, role, isNewUser, vendorId } = response.data;
        
        // Store token
        setToken(newToken);
        apiClient.setToken(newToken);

        // Create user object
        const userData: User = {
          id: userId,
          email: userEmail,
          fullName: decoded.name || '',
          role: role as 'CUSTOMER' | 'VENDOR',
        };

        setUser(userData);

        // Batch all localStorage operations for better performance
        const storageUpdates: Record<string, string> = {
          'auth_token': newToken,
          'user_id': userId,
          'user_data': JSON.stringify(userData),
          'user_role': role,
        };

        // Add vendor ID if present (already returned from backend - no extra API call needed!)
        if (vendorId) {
          storageUpdates['vendor_id'] = vendorId;
        }

        batchLocalStorageUpdate(storageUpdates);

        // Store flag if this is a new user (for onboarding)
        if (isNewUser && isVendor) {
          sessionStorage.setItem('vendorSignupData', JSON.stringify({
            email: userEmail,
          }));
        }
      } else {
        throw new Error(response.message || 'Google login failed');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      // Extract error code and message from API response
      const errorCode = error.response?.data?.code || error.code;
      const errorMessage = error.response?.data?.message || error.message || 'Google login failed. Please try again.';
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).code = errorCode;
      throw enhancedError;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{
        token: string;
        userId: string;
        email: string;
        role: string;
        vendorId?: string;
      }>('/auth/login', { email, password });

      if (response.success && response.data) {
        const { token: newToken, userId, email: userEmail, role, vendorId } = response.data;
        
        // Store token
        setToken(newToken);
        apiClient.setToken(newToken);

        // Create user object
        const userData: User = {
          id: userId,
          email: userEmail,
          fullName: '', // Will be fetched from profile if needed
          role: role as 'CUSTOMER' | 'VENDOR',
        };

        setUser(userData);

        // Batch all localStorage operations for better performance
        const storageUpdates: Record<string, string> = {
          'auth_token': newToken,
          'user_id': userId,
          'user_data': JSON.stringify(userData),
          'user_role': role,
        };

        // Add vendor ID if present (already returned from backend - no extra API call needed!)
        if (vendorId) {
          storageUpdates['vendor_id'] = vendorId;
        }

        batchLocalStorageUpdate(storageUpdates);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Extract error code and message from API response
      const errorCode = error.response?.data?.code || error.code;
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).code = errorCode;
      throw enhancedError;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await apiClient.post<{
        token: string;
        userId: string;
        email: string;
        role: string;
        vendorId?: string;
      }>('/auth/register', {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        isVendor: data.isVendor || false,
      });

      if (response.success && response.data) {
        const { token: newToken, userId, email: userEmail, role, vendorId } = response.data;
        
        // Store token
        setToken(newToken);
        apiClient.setToken(newToken);

        // Create user object
        const userData: User = {
          id: userId,
          email: userEmail,
          fullName: data.fullName,
          role: role as 'CUSTOMER' | 'VENDOR',
          phone: data.phone,
        };

        setUser(userData);

        // Batch all localStorage operations for better performance
        const storageUpdates: Record<string, string> = {
          'auth_token': newToken,
          'user_id': userId,
          'user_data': JSON.stringify(userData),
          'user_role': role,
        };

        // Add vendor ID if present (already returned from backend - no extra API call needed!)
        if (vendorId) {
          storageUpdates['vendor_id'] = vendorId;
        }

        batchLocalStorageUpdate(storageUpdates);

        // If vendor, store signup data for onboarding
        if (data.isVendor) {
          sessionStorage.setItem('vendorSignupData', JSON.stringify({
            email: userEmail,
          }));
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      // Extract error code and message from API response
      const errorCode = error.response?.data?.code || error.code;
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).code = errorCode;
      throw enhancedError;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    apiClient.setToken(null);
    
    // Batch all localStorage clear operations for better performance
    batchLocalStorageUpdate({
      'auth_token': null,
      'user_data': null,
      'user_id': null,
      'user_role': null,
      'vendor_id': null,
    });
    
    sessionStorage.removeItem('vendorSignupData');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  const refreshVendorInfo = async () => {
    if (!user || !token) return;
    
    try {
      // If user is a vendor, fetch vendor ID
      if (user.role === 'VENDOR') {
        const vendorResponse = await vendorApi.getVendorByUserId(user.id);
        if (vendorResponse.success && vendorResponse.data) {
          const vendorId = vendorResponse.data.id;
          localStorage.setItem('vendor_id', vendorId);
        }
      }
    } catch (error) {
      console.error('Error refreshing vendor info:', error);
      // Vendor might not have completed onboarding yet
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
        refreshVendorInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

