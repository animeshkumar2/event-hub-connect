import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, vendorApi } from '@/shared/services/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'VENDOR';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
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

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        apiClient.setToken(storedToken);
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_id');
        localStorage.removeItem('vendor_id');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{
        token: string;
        userId: string;
        email: string;
        role: string;
      }>('/auth/login', { email, password });

      if (response.success && response.data) {
        const { token: newToken, userId, email: userEmail, role } = response.data;
        
        // Store token
        setToken(newToken);
        apiClient.setToken(newToken);
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('user_id', userId);

        // Create user object
        const userData: User = {
          id: userId,
          email: userEmail,
          fullName: '', // Will be fetched from profile if needed
          role: role as 'CUSTOMER' | 'VENDOR',
        };

        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));

        // If vendor, fetch and store vendor ID
        if (role === 'VENDOR') {
          try {
            const vendorResponse = await vendorApi.getVendorByUserId(userId);
            if (vendorResponse.success && vendorResponse.data) {
              const vendorId = vendorResponse.data.id;
              localStorage.setItem('vendor_id', vendorId);
            }
          } catch (error) {
            console.error('Error fetching vendor ID:', error);
            // Vendor might not have completed onboarding yet - this is OK
            // They will be redirected to onboarding if needed
          }
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await apiClient.post<{
        token: string;
        userId: string;
        email: string;
        role: string;
      }>('/auth/register', {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        isVendor: data.isVendor || false,
      });

      if (response.success && response.data) {
        const { token: newToken, userId, email: userEmail, role } = response.data;
        
        // Store token
        setToken(newToken);
        apiClient.setToken(newToken);
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('user_id', userId);

        // Create user object
        const userData: User = {
          id: userId,
          email: userEmail,
          fullName: data.fullName,
          role: role as 'CUSTOMER' | 'VENDOR',
          phone: data.phone,
        };

        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));

        // If vendor, fetch and store vendor ID (if vendor profile exists)
        if (data.isVendor) {
          sessionStorage.setItem('vendorSignupData', JSON.stringify({
            email: userEmail,
          }));
          // Try to fetch vendor ID if vendor profile already exists
          try {
            const vendorResponse = await vendorApi.getVendorByUserId(userId);
            if (vendorResponse.success && vendorResponse.data) {
              const vendorId = vendorResponse.data.id;
              localStorage.setItem('vendor_id', vendorId);
            }
          } catch (error) {
            // Vendor profile doesn't exist yet - will be created during onboarding
            console.log('Vendor profile not found - will be created during onboarding');
          }
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    apiClient.setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_id');
    localStorage.removeItem('vendor_id');
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

