import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { CustomerLayout } from '../components/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import {
  LogOut,
  Trash2,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

export default function CustomerSettings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Account Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account preferences and security</p>
        </div>

        <Card className="shadow-sm border">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                Account Actions
              </h3>
              <div className="space-y-1.5">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-9 text-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm text-destructive hover:text-destructive">
                  <Shield className="h-3.5 w-3.5" />
                  Deactivate Account
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Account
                </Button>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold text-sm mb-1.5">What happens when I update my email address?</p>
                  <p className="text-xs text-muted-foreground">
                    Your login email will change. You'll receive all account-related communication on your updated email address.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold text-sm mb-1.5">How do I cancel an order?</p>
                  <p className="text-xs text-muted-foreground">
                    Go to My Orders, select the order you want to cancel, and click "Cancel Order". Cancellation policies may vary by vendor.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-semibold text-sm mb-1.5">What happens when I delete my account?</p>
                  <p className="text-xs text-muted-foreground">
                    Your account and all associated data will be permanently deleted. Active orders will need to be completed or cancelled first.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
