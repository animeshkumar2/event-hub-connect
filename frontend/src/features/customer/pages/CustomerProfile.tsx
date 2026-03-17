import { useState } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { CustomerLayout } from '../components/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  User,
  Mail,
  Phone,
  UserCircle,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

export default function CustomerProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
  });

  const handleSave = () => {
    // TODO: Implement profile update API call
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been updated successfully.',
    });
    setIsEditing(false);
  };

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your personal information</p>
        </div>

        <Card className="shadow-sm border">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Manage your personal details and preferences</p>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1.5 h-8">
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="gap-1.5 h-8">
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} className="gap-1.5 h-8">
                    <Check className="h-3.5 w-3.5" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-1.5 h-9 text-sm"
                  />
                ) : (
                  <p className="mt-1.5 text-sm font-medium">{formData.fullName || 'Not set'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1.5 h-9 text-sm"
                  />
                ) : (
                  <p className="mt-1.5 text-sm font-medium">{formData.email || 'Not set'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Mobile Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1.5 h-9 text-sm"
                  />
                ) : (
                  <p className="mt-1.5 text-sm font-medium">{formData.phone || 'Not set'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender" className="text-sm font-medium flex items-center gap-1.5">
                  <UserCircle className="h-3.5 w-3.5" />
                  Gender
                </Label>
                {isEditing ? (
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="mt-1.5 text-sm font-medium capitalize">{formData.gender || 'Not set'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
