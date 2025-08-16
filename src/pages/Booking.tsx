
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, User, IdCard } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePackage } from '@/hooks/usePackages';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateBooking } from '@/hooks/useBookings';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

interface Tourist {
  id: string;
  name: string;
  idType: string;
  idNumber: string;
}

const idTypes = [
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Driving License',
  'Voter ID'
];

const Booking = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNativeApp = Capacitor.isNativePlatform();
  const { data: packageData, isLoading } = usePackage(packageId || '');
  const createBooking = useCreateBooking();
  
  const [tourists, setTourists] = useState<Tourist[]>([
    { id: '1', name: '', idType: '', idNumber: '' }
  ]);

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { returnUrl: `/booking/${packageId}` } });
    }
  }, [user, navigate, packageId]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Don't render anything if user is not authenticated (redirect will handle it)
  if (!user) {
    return null;
  }

  if (!packageId) {
    navigate('/packages');
    return null;
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className={`container mx-auto px-4 py-8 ${isNativeApp ? 'px-6' : ''}`}>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading package details...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!packageData) {
    return (
      <AppLayout>
        <div className={`container mx-auto px-4 py-8 ${isNativeApp ? 'px-6' : ''}`}>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Package not found</h1>
            <Button onClick={() => navigate('/packages')}>Back to Packages</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const groupSizeNumber = parseInt(packageData.group_size.replace(/[^\d]/g, ''));
  const extraTourists = Math.max(0, tourists.length - groupSizeNumber);
  const extraCharge = extraTourists * 2000;
  const basePrice = parseFloat(packageData.price.replace(/[^\d.]/g, ''));
  const totalPrice = basePrice + extraCharge;

  const addTourist = () => {
    const newTourist: Tourist = {
      id: Date.now().toString(),
      name: '',
      idType: '',
      idNumber: ''
    };
    setTourists([...tourists, newTourist]);
  };

  const removeTourist = (id: string) => {
    if (tourists.length > 1) {
      setTourists(tourists.filter(tourist => tourist.id !== id));
    }
  };

  const updateTourist = (id: string, field: keyof Tourist, value: string) => {
    setTourists(tourists.map(tourist => 
      tourist.id === id ? { ...tourist, [field]: value } : tourist
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all tourists have required information
    const isValid = tourists.every(tourist => 
      tourist.name.trim() && tourist.idType && tourist.idNumber.trim()
    );

    if (!isValid) {
      toast.error('Please fill in all tourist information');
      return;
    }

    if (!packageData) {
      toast.error('Package data not available');
      return;
    }

    try {
      // Create booking in database
      const bookingData = {
        package_id: packageData.id,
        package_title: packageData.title,
        package_location: packageData.location,
        package_duration: packageData.duration,
        package_price: packageData.price,
        package_image_url: packageData.image_url,
        tourists,
        total_price: totalPrice,
        status: 'confirmed' as const,
        user_session: user.id, // Link booking to the authenticated user
      };

      const created = await createBooking.mutateAsync(bookingData);

      toast.success('Booking confirmed! Redirecting to My Tour...');
      navigate('/my-tour');
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  };

  return (
    <AppLayout className="bg-background">
      <div className={`container mx-auto px-4 py-8 ${isNativeApp ? 'px-6 py-6' : ''}`}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className={`${isNativeApp ? 'text-2xl' : 'text-3xl'} font-bold`}>Book Package</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="space-y-6 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Tourist Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {tourists.map((tourist, index) => (
                      <div key={tourist.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Tourist {index + 1}</h3>
                          {tourists.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTourist(tourist.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid gap-4">
                          <div>
                            <Label htmlFor={`name-${tourist.id}`}>Full Name *</Label>
                            <Input
                              id={`name-${tourist.id}`}
                              type="text"
                              placeholder="Enter full name"
                              value={tourist.name}
                              onChange={(e) => updateTourist(tourist.id, 'name', e.target.value)}
                              required
                            />
                          </div>
                          
                           <div className="grid sm:grid-cols-2 gap-4">
                             <div>
                               <Label htmlFor={`idType-${tourist.id}`}>ID Type *</Label>
                              <Select
                                value={tourist.idType}
                                onValueChange={(value) => updateTourist(tourist.id, 'idType', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {idTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor={`idNumber-${tourist.id}`}>ID Number *</Label>
                              <Input
                                id={`idNumber-${tourist.id}`}
                                type="text"
                                placeholder="Enter ID number"
                                value={tourist.idNumber}
                                onChange={(e) => updateTourist(tourist.id, 'idNumber', e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTourist}
                      className="w-full flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Tourist
                    </Button>
                  </div>

                  {/* Pricing Summary */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Pricing Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Package Price:</span>
                        <span>₹{basePrice.toLocaleString()}</span>
                      </div>
                      
                      {extraTourists > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Extra charge ({extraTourists} people × ₹2,000):</span>
                          <span>₹{extraCharge.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                        <span>Total Price:</span>
                        <span>₹{totalPrice.toLocaleString()}</span>
                      </div>
                      
                      {extraTourists > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Additional ₹2,000 per person beyond group size of {groupSizeNumber}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  <Button type="submit" className="w-full mt-6" size="lg">
                    Book Now
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Package Details & Media */}
          <div className="space-y-6 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle>{packageData.title}</CardTitle>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{packageData.duration}</Badge>
                  <Badge variant="outline">{packageData.group_size}</Badge>
                  <Badge variant="outline">{packageData.location}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Package Image */}
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={packageData.image_url}
                    alt={packageData.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Package Features */}
                <div>
                  <h4 className="font-semibold mb-2">Package Includes:</h4>
                  <div className="grid gap-2">
                    {packageData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Locations Included */}
                {packageData.locations_included.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Locations Included:</h4>
                    <div className="flex flex-wrap gap-2">
                      {packageData.locations_included.map((location, index) => (
                        <Badge key={index} variant="secondary">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < packageData.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span>{packageData.rating}/5</span>
                  <span className="text-muted-foreground">
                    ({packageData.reviews_count} reviews)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Booking;
