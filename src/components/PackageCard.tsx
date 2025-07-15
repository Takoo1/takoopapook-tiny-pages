import { Star, MapPin, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package } from '@/hooks/usePackages';

interface PackageCardProps {
  package: Package;
}

const PackageCard = ({ package: pkg }: PackageCardProps) => {
  return (
    <Card className="h-full flex flex-col group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={pkg.image_url || '/placeholder.svg'}
          alt={pkg.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            {pkg.package_code}
          </Badge>
        </div>
      </div>
      
      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{pkg.title}</h3>
        
        <div className="flex items-center text-muted-foreground text-sm mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{pkg.location}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{pkg.duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{pkg.group_size}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="font-medium">{pkg.rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm ml-1">
              ({pkg.reviews_count} reviews)
            </span>
          </div>
          <span className="font-bold text-lg text-primary">{pkg.price}</span>
        </div>
        
        {pkg.features.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {pkg.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {pkg.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{pkg.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {pkg.locations_included.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Includes:</span> {pkg.locations_included.slice(0, 2).join(', ')}
            {pkg.locations_included.length > 2 && ` +${pkg.locations_included.length - 2} more`}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  );
};

export default PackageCard;