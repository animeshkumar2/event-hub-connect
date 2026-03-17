import { useState } from 'react';
import { CustomerLayout } from '../components/CustomerLayout';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  X,
  Check,
} from 'lucide-react';
import { customerApi } from '@/shared/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

const emptyForm = { label: 'Home', fullAddress: '', city: '', state: '', pincode: '', isDefault: false };

export default function CustomerAddresses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const { data: addressesData, isLoading } = useQuery({
    queryKey: ['customerAddresses'],
    queryFn: async () => {
      const response = await customerApi.getAddresses();
      return response.success ? response.data : [];
    },
  });

  const createAddress = useMutation({
    mutationFn: (data: typeof emptyForm) => customerApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerAddresses'] });
      toast({ title: 'Address saved' });
      closeForm();
    },
    onError: () => toast({ title: 'Failed to save address', variant: 'destructive' }),
  });

  const updateAddress = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof emptyForm }) => customerApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerAddresses'] });
      toast({ title: 'Address updated' });
      closeForm();
    },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  });

  const deleteAddress = useMutation({
    mutationFn: (id: string) => customerApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerAddresses'] });
      toast({ title: 'Address deleted' });
    },
    onError: () => toast({ title: 'Failed to delete', variant: 'destructive' }),
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => customerApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerAddresses'] });
      toast({ title: 'Default address updated' });
    },
    onError: () => toast({ title: 'Failed to update default', variant: 'destructive' }),
  });

  const addresses = addressesData || [];

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const openEdit = (address: any) => {
    setFormData({
      label: address.label || 'Home',
      fullAddress: address.fullAddress || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      isDefault: address.isDefault || false,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.fullAddress.trim()) {
      toast({ title: 'Address is required', variant: 'destructive' });
      return;
    }
    if (editingId) {
      updateAddress.mutate({ id: editingId, data: formData });
    } else {
      createAddress.mutate(formData);
    }
  };

  const labelOptions = ['Home', 'Office', 'Event Venue', 'Other'];

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Saved Addresses</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your delivery and event addresses</p>
          </div>
          <Button onClick={() => { setFormData(emptyForm); setEditingId(null); setShowForm(true); }} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        </div>

        {isLoading ? (
          <Card className="shadow-sm border">
            <CardContent className="p-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading addresses...</p>
            </CardContent>
          </Card>
        ) : addresses.length === 0 ? (
          <Card className="shadow-sm border">
            <CardContent className="p-10 text-center">
              <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">No saved addresses</h3>
              <p className="text-sm text-muted-foreground mb-4">Add addresses to quickly fill in event details</p>
              <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((address: any) => (
              <Card key={address.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-semibold">{address.label}</span>
                      {address.isDefault && (
                        <Badge variant="secondary" className="text-[10px]">Default</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setDefault.mutate(address.id)}
                          title="Set as default"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(address)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteAddress.mutate(address.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{address.fullAddress}</p>
                  {(address.city || address.state || address.pincode) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {[address.city, address.state, address.pincode].filter(Boolean).join(', ')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Address Dialog */}
        <Dialog open={showForm} onOpenChange={(open) => { if (!open) closeForm(); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-sm font-medium">Label</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {labelOptions.map((opt) => (
                    <Button
                      key={opt}
                      variant={formData.label === opt ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setFormData({ ...formData, label: opt })}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="fullAddress" className="text-sm font-medium">Full Address *</Label>
                <Input
                  id="fullAddress"
                  placeholder="House/flat no., street, locality..."
                  value={formData.fullAddress}
                  onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-sm font-medium">State</Label>
                  <Input
                    id="state"
                    placeholder="e.g. Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="w-1/2">
                <Label htmlFor="pincode" className="text-sm font-medium">Pincode</Label>
                <Input
                  id="pincode"
                  placeholder="e.g. 400001"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="mt-1.5"
                  maxLength={6}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isDefault" className="text-sm cursor-pointer">Set as default address</Label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={closeForm}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={createAddress.isPending || updateAddress.isPending}
                >
                  {(createAddress.isPending || updateAddress.isPending) ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CustomerLayout>
  );
}
