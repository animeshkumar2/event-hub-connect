import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Check } from "lucide-react";
import { getVendorById } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const VendorDetails = () => {
  const { vendorId } = useParams();
  const { toast } = useToast();
  const vendor = vendorId ? getVendorById(vendorId) : null;

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Vendor not found</h1>
          <Button asChild>
            <Link to="/search">Back to Search</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleBookPackage = (packageId: string, packageName: string) => {
    toast({
      title: "Added to Cart",
      description: `${packageName} has been added to your cart`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={vendor.coverImage}
          alt={vendor.businessName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <Badge variant="secondary" className="mb-4 capitalize">
            {vendor.category}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {vendor.businessName}
          </h1>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground">{vendor.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-secondary text-secondary" />
              <span className="font-semibold">{vendor.rating}</span>
              <span className="text-muted-foreground">({vendor.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{vendor.bio}</p>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {vendor.portfolioImages.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer">
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Packages */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Packages</h2>
              {vendor.packages.map((pkg) => (
                <Card key={pkg.id} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-48 aspect-video overflow-hidden rounded-lg">
                        <img
                          src={pkg.images[0]}
                          alt={pkg.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-foreground mb-2">
                              {pkg.name}
                            </h3>
                            <p className="text-muted-foreground mb-4">{pkg.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-primary">
                              ₹{pkg.price.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 text-sm">What's Included:</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {pkg.includedItems.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {pkg.addOns.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-sm">Available Add-ons:</h4>
                            <div className="flex flex-wrap gap-2">
                              {pkg.addOns.map((addon) => (
                                <Badge key={addon.id} variant="outline" className="text-xs">
                                  {addon.title} (+₹{addon.price.toLocaleString()})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleBookPackage(pkg.id, pkg.name)}
                            className="flex-1"
                          >
                            Add to Cart
                          </Button>
                          <Button variant="outline" asChild>
                            <Link to={`/vendor/${vendor.id}/package/${pkg.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Starting Price</div>
                  <div className="text-2xl font-bold text-primary">
                    ₹{vendor.startingPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Location</div>
                  <div className="font-semibold">{vendor.city}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Category</div>
                  <Badge variant="secondary" className="capitalize">
                    {vendor.category}
                  </Badge>
                </div>
                <Button className="w-full" size="lg">
                  Contact Vendor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
