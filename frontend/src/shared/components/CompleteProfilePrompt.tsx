import { AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

interface CompleteProfilePromptProps {
  title?: string;
  description?: string;
  featureName?: string;
}

export default function CompleteProfilePrompt({ 
  title = "Complete Your Profile First",
  description = "You need to complete your vendor profile to access this feature.",
  featureName = "this feature"
}: CompleteProfilePromptProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/vendor/onboarding')}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
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

          <p className="text-xs text-muted-foreground">
            It only takes 2 minutes to set up your profile
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
