import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, AddOn } from '@/data/mockData';
import { Plus, Minus } from 'lucide-react';

interface PackageCustomizationProps {
  pkg: Package;
  onCustomize: (addOns: AddOn[], customizations: any[]) => void;
  initialAddOns?: AddOn[];
}

export const PackageCustomization = ({
  pkg,
  onCustomize,
  initialAddOns = [],
}: PackageCustomizationProps) => {
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>(initialAddOns);
  const [customizations, setCustomizations] = useState<any[]>([]);

  const toggleAddOn = (addOn: AddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.find((a) => a.id === addOn.id);
      if (exists) {
        return prev.filter((a) => a.id !== addOn.id);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const updateCustomization = (id: string, name: string, value: string, price: number) => {
    setCustomizations((prev) => {
      const exists = prev.find((c) => c.id === id);
      if (exists) {
        return prev.map((c) => (c.id === id ? { ...c, value, price } : c));
      } else {
        return [...prev, { id, name, value, price }];
      }
    });
  };

  const calculateTotal = () => {
    const addOnsTotal = selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
    const customizationsTotal = customizations.reduce((sum, custom) => sum + custom.price, 0);
    return pkg.price + addOnsTotal + customizationsTotal;
  };

  const handleApply = () => {
    onCustomize(selectedAddOns, customizations);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Package</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Base Package */}
        <div>
          <h4 className="font-semibold mb-3">Base Package</h4>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{pkg.name}</span>
              <span className="font-bold">₹{pkg.price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Add-ons */}
        {pkg.addOns.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Add-ons</h4>
            <div className="space-y-3">
              {pkg.addOns.map((addOn) => (
                <div
                  key={addOn.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <Checkbox
                    id={addOn.id}
                    checked={selectedAddOns.some((a) => a.id === addOn.id)}
                    onCheckedChange={() => toggleAddOn(addOn)}
                  />
                  <Label htmlFor={addOn.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{addOn.title}</div>
                        {addOn.description && (
                          <div className="text-sm text-muted-foreground">
                            {addOn.description}
                          </div>
                      )}
                      </div>
                      <Badge variant="outline" className="ml-4">
                        +₹{addOn.price.toLocaleString()}
                      </Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customization Options */}
        <div>
          <h4 className="font-semibold mb-3">Customization Options</h4>
          <div className="space-y-4">
            {/* Example: Photography hours */}
            {pkg.vendorId === 'v1' && (
              <div className="space-y-2">
                <Label>Photography Hours</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const current = customizations.find((c) => c.id === 'hours')?.value || '8';
                      const newValue = Math.max(4, parseInt(current) - 1);
                      updateCustomization(
                        'hours',
                        'Photography Hours',
                        newValue.toString(),
                        (newValue - 8) * 5000
                      );
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">
                    {customizations.find((c) => c.id === 'hours')?.value || '8'} hours
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const current = customizations.find((c) => c.id === 'hours')?.value || '8';
                      const newValue = Math.min(12, parseInt(current) + 1);
                      updateCustomization(
                        'hours',
                        'Photography Hours',
                        newValue.toString(),
                        (newValue - 8) * 5000
                      );
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {parseInt(customizations.find((c) => c.id === 'hours')?.value || '8') > 8
                      ? `+₹${((parseInt(customizations.find((c) => c.id === 'hours')?.value || '8') - 8) * 5000).toLocaleString()}`
                      : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Example: DJ hours */}
            {pkg.vendorId === 'v3' && (
              <div className="space-y-2">
                <Label>DJ Hours</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const current = customizations.find((c) => c.id === 'dj-hours')?.value || '5';
                      const newValue = Math.max(3, parseInt(current) - 1);
                      updateCustomization(
                        'dj-hours',
                        'DJ Hours',
                        newValue.toString(),
                        (newValue - 5) * 8000
                      );
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">
                    {customizations.find((c) => c.id === 'dj-hours')?.value || '5'} hours
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const current = customizations.find((c) => c.id === 'dj-hours')?.value || '5';
                      const newValue = Math.min(10, parseInt(current) + 1);
                      updateCustomization(
                        'dj-hours',
                        'DJ Hours',
                        newValue.toString(),
                        (newValue - 5) * 8000
                      );
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {parseInt(customizations.find((c) => c.id === 'dj-hours')?.value || '5') > 5
                      ? `+₹${((parseInt(customizations.find((c) => c.id === 'dj-hours')?.value || '5') - 5) * 8000).toLocaleString()}`
                      : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">₹{calculateTotal().toLocaleString()}</span>
          </div>
        </div>

        <Button onClick={handleApply} className="w-full" size="lg">
          Apply Customizations
        </Button>
      </CardContent>
    </Card>
  );
};

