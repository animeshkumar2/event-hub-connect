import { ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VendorSidebar } from './VendorSidebar';
import { Button } from '@/shared/components/ui/button';
import { Menu, WifiOff, RefreshCw } from 'lucide-react';
import { vendorApi } from '@/shared/services/api';

interface VendorLayoutProps {
  children: ReactNode;
}

export const VendorLayout = ({ children }: VendorLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isRetrying, setIsRetrying] = useState(false);

  // Check backend connectivity on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Try to fetch profile - if it fails with network error, backend is down
        const response = await vendorApi.getProfile();
        // Even if response is an error (like 401), backend is reachable
        setBackendStatus('online');
      } catch (error: any) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('err_connection')) {
          setBackendStatus('offline');
        } else {
          // Other errors mean backend is reachable
          setBackendStatus('online');
        }
      }
    };

    checkBackend();
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    setBackendStatus('checking');
    
    try {
      await vendorApi.getProfile();
      setBackendStatus('online');
    } catch (error: any) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('err_connection')) {
        setBackendStatus('offline');
      } else {
        setBackendStatus('online');
      }
    }
    
    setIsRetrying(false);
  };

  // Show loading state while checking backend
  if (backendStatus === 'checking') {
    return (
      <div className="min-h-screen bg-background">
        <VendorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/vendor/dashboard" className="flex items-center gap-2">
            <span className="text-base font-semibold text-[#5046E5]">
              cartevent<span className="text-[#7C6BFF]">.</span>
            </span>
            <span className="text-xs text-muted-foreground">Vendor</span>
          </Link>
          <div className="w-10" />
        </header>

        {sidebarOpen && (
          <div
            className="md:hidden fixed -inset-96 z-30 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="min-h-screen bg-background transition-all duration-300 md:ml-64">
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Connecting to server...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show offline state
  if (backendStatus === 'offline') {
    return (
      <div className="min-h-screen bg-background">
        <VendorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/vendor/dashboard" className="flex items-center gap-2">
            <span className="text-base font-semibold text-[#5046E5]">
              cartevent<span className="text-[#7C6BFF]">.</span>
            </span>
            <span className="text-xs text-muted-foreground">Vendor</span>
          </Link>
          <div className="w-10" />
        </header>

        {sidebarOpen && (
          <div
            className="md:hidden fixed -inset-96 z-30 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="min-h-screen bg-background transition-all duration-300 md:ml-64">
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <WifiOff className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Unable to connect to server</h2>
              <p className="text-muted-foreground mb-6">
                We're having trouble connecting to our servers. Please check your internet connection and try again.
              </p>
              <Button 
                onClick={handleRetry} 
                disabled={isRetrying}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <VendorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/vendor/dashboard" className="flex items-center gap-2">
          <span className="text-base font-semibold text-[#5046E5]">
            cartevent<span className="text-[#7C6BFF]">.</span>
          </span>
          <span className="text-xs text-muted-foreground">Vendor</span>
        </Link>
        <div className="w-10" />
      </header>

      {/* Backdrop for mobile sidebar - extends beyond viewport for overscroll */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed -inset-96 z-30 bg-black/40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="min-h-screen bg-background transition-all duration-300 md:ml-64">
        {children}
      </main>
    </div>
  );
};
