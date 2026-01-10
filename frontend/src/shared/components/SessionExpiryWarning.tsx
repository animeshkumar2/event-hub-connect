import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export function SessionExpiryWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check token expiry every 30 seconds
    const checkInterval = setInterval(() => {
      if (dismissed) return;

      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const decoded = jwtDecode<{ exp: number }>(token);
          const expiresAt = decoded.exp * 1000;
          const now = Date.now();
          const timeUntilExpiry = expiresAt - now;

          // Show warning if less than 5 minutes left
          if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
            setShowWarning(true);
            setTimeLeft(Math.floor(timeUntilExpiry / 1000));
          } else {
            setShowWarning(false);
          }
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    }, 30000); // Check every 30 seconds

    // Also check immediately on mount
    const token = localStorage.getItem('auth_token');
    if (token && !dismissed) {
      try {
        const decoded = jwtDecode<{ exp: number }>(token);
        const expiresAt = decoded.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          setShowWarning(true);
          setTimeLeft(Math.floor(timeUntilExpiry / 1000));
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    return () => clearInterval(checkInterval);
  }, [dismissed]);

  // Update countdown every second when warning is shown
  useEffect(() => {
    if (!showWarning || dismissed) return;

    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowWarning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [showWarning, dismissed]);

  if (!showWarning || dismissed) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Alert className="fixed bottom-4 right-4 w-96 border-yellow-500 bg-yellow-50 shadow-lg z-50 animate-in slide-in-from-bottom-5">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="flex items-center justify-between">
        <span className="text-yellow-800">Session Expiring Soon</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-yellow-100"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="text-yellow-700">
        Your session will expire in{' '}
        <span className="font-semibold">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
        . Save your work to avoid losing changes.
      </AlertDescription>
    </Alert>
  );
}
