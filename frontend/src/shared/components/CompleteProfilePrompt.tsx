import { ArrowRight, Building2, MapPin, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

interface CompleteProfilePromptProps {
  title?: string;
  description?: string;
  featureName?: string;
}

export default function CompleteProfilePrompt({ 
  title = "Complete Your Profile to Get Started",
  description,
  featureName = "this feature"
}: CompleteProfilePromptProps) {
  const navigate = useNavigate();
  
  const defaultDescription = `Set up your vendor profile to access ${featureName}.`;

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full border-primary/20 shadow-elegant overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5950b3] to-[#7867dc] px-6 py-5 text-center">
          <h3 className="text-xl font-bold text-white">
            {title}
          </h3>
          <p className="text-white/80 text-sm mt-1">
            {description || defaultDescription}
          </p>
        </div>
        
        <CardContent className="p-6 space-y-6">
          {/* Required Steps */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">You need to complete:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Business Name</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">City</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Service Category</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/vendor/profile')}
              className="w-full h-12 bg-gradient-to-r from-[#5950b3] to-[#7867dc] hover:from-[#4a42a0] hover:to-[#6858c8] text-white font-semibold"
              size="lg"
            >
              Complete Profile Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => navigate('/vendor/dashboard')}
              variant="ghost"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Takes less than a minute to complete
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
