import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookableSetup } from '@/data/mockData';
import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface BookExactSetupProps {
  setup: BookableSetup;
  vendorName: string;
}

export const BookExactSetup = ({ setup, vendorName }: BookExactSetupProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleBookNow = () => {
    // Add to cart with the setup details
    addToCart({
      vendorId: setup.vendorId,
      vendorName: vendorName,
      packageId: setup.packageId || 'setup-package',
      packageName: setup.title,
      price: setup.price,
      basePrice: setup.price,
      addOns: [],
      quantity: 1,
    });

    toast({
      title: 'Added to Cart!',
      description: `${setup.title} has been added to your cart`,
    });
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video overflow-hidden">
        <img
          src={setup.image}
          alt={setup.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{setup.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{setup.description}</p>
          </div>
          <Badge variant="secondary" className="ml-2 capitalize">
            {setup.category}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="text-xs text-muted-foreground">Price</div>
            <div className="text-xl font-bold text-primary">₹{setup.price.toLocaleString()}</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/vendor/${setup.vendorId}`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" onClick={handleBookNow}>
              <ShoppingCart className="h-4 w-4 mr-1" />
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

