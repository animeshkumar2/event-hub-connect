import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { BrandedLoader } from '@/shared/components/BrandedLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVendor?: boolean;
}

export function ProtectedRoute({ children, requireVendor = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <BrandedLoader message="Verifying access..." />;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vendor route but user is not a vendor - redirect to home
  if (requireVendor && user.role !== 'VENDOR') {
    return <Navigate to="/" replace />;
  }

  // Authenticated and authorized
  return <>{children}</>;
}
