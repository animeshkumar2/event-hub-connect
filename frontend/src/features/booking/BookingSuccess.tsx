import { Navbar } from '@/features/home/Navbar';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { CheckCircle2, Mail, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingSuccess = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="p-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-8">
              Your event vendors have been successfully booked. You will receive a confirmation
              email with all the details shortly.
            </p>

            <div className="space-y-4 mb-8 text-left bg-muted/50 p-6 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">Confirmation Email</div>
                  <div className="text-sm text-muted-foreground">
                    Sent to your registered email address
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">Vendor Confirmations</div>
                  <div className="text-sm text-muted-foreground">
                    Vendors will confirm within 24 hours
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/search">Browse More Vendors</Link>
              </Button>
              <Button asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingSuccess;


