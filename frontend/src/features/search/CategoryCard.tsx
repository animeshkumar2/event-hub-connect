import { Link } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/card";

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
}

export const CategoryCard = ({ id, name, icon }: CategoryCardProps) => {
  return (
    <Link to={`/search?category=${id}`}>
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
        <CardContent className="p-6 text-center">
          <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="font-semibold text-foreground">{name}</h3>
        </CardContent>
      </Card>
    </Link>
  );
};
