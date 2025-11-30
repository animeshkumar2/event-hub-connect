import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CategoryTileProps {
  id: string;
  name: string;
  icon: string;
  theme: 'wedding' | 'dj' | 'birthday' | 'baby-shower' | 'corporate' | 'house-party' | 'engagement' | 'anniversary';
  description?: string;
}

const themeStyles = {
  wedding: 'theme-wedding hover:shadow-amber-200/50',
  dj: 'theme-dj hover:shadow-purple-500/50',
  birthday: 'theme-birthday hover:shadow-blue-200/50',
  'baby-shower': 'theme-baby-shower hover:shadow-pink-200/50',
  corporate: 'theme-corporate hover:shadow-slate-400/50',
  'house-party': 'theme-house-party hover:shadow-orange-300/50',
  engagement: 'theme-engagement hover:shadow-pink-200/50',
  anniversary: 'theme-anniversary hover:shadow-red-300/50',
};

export const CategoryTile = ({ id, name, icon, theme, description }: CategoryTileProps) => {
  return (
    <Link to={`/search?category=${id}`}>
      <Card className={cn(
        'h-full cursor-pointer transition-all duration-300 hover-lift rounded-2xl overflow-hidden border-0',
        themeStyles[theme]
      )}>
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-6xl mb-4 animate-float">{icon}</div>
          <h3 className={cn(
            'text-2xl font-bold mb-2',
            theme === 'dj' || theme === 'corporate' ? 'text-white' : 'text-foreground'
          )}>
            {name}
          </h3>
          {description && (
            <p className={cn(
              'text-sm',
              theme === 'dj' || theme === 'corporate' ? 'text-white/80' : 'text-muted-foreground'
            )}>
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

