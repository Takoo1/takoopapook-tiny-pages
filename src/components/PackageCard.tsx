import { Star, MapPin, Clock, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package } from '@/hooks/usePackages';
import PlanButton from '@/components/PlanButton';

interface PackageCardProps {
  package: Package;
}

const PackageCard = ({ package: pkg }: PackageCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/my-tour/package/${pkg.id}`);
  };

  
  const handlePlanClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation when clicking heart
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    navigate(`/my-tour/package/${pkg.id}`);
  };

  return (
    <Card 
      className="h-full flex flex-col group hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1" 
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={pkg.image_url || '/placeholder.svg'}
          alt={pkg.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        
        {/* Plan Button (Heart Icon) */}
        <div className="absolute top-2 left-2" onClick={handlePlanClick}>
          <PlanButton 
            itemId={pkg.id} 
            itemType="package"
            itemName={pkg.title}
            variant="compact"
          />
        </div>
        
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            {pkg.package_code}
          </Badge>
        </div>
      </div>
      
      <CardContent className="flex-1 p-3">
        <h3 className="font-semibold text-base mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">{pkg.title}</h3>
        
        <div className="flex items-center text-muted-foreground text-xs mb-1.5">
          <MapPin className="h-3 w-3 mr-1 text-primary" />
          <span>{pkg.location}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 text-primary" />
            <span>{pkg.duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1 text-primary" />
            <span>{pkg.group_size}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="font-medium text-xs">{pkg.rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs ml-1">
              ({pkg.reviews_count})
            </span>
          </div>
          <span className="font-bold text-base text-primary">{pkg.price}</span>
        </div>
        
        {pkg.features.length > 0 && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {pkg.features.slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                  {feature}
                </Badge>
              ))}
              {pkg.features.length > 2 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  +{pkg.features.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {pkg.locations_included.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Includes:</span> {pkg.locations_included.slice(0, 1).join(', ')}
            {pkg.locations_included.length > 1 && ` +${pkg.locations_included.length - 1} more`}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-3 pt-0">
        <Button 
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-xs py-2" 
          onClick={handleButtonClick}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PackageCard;