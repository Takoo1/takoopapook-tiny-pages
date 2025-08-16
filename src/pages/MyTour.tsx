import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import PackageDetail from '@/components/PackageDetail';
import DestinationDetail from '@/components/DestinationDetail';
import PackageCard from '@/components/PackageCard';
import DestinationCard from '@/components/DestinationCard';
import { usePlannedLocations, usePlannedPackages } from '@/hooks/usePlannedLocations';
import { useMyBookings } from '@/hooks/useBookings';
import { MapPin, Plus, CheckCircle, Clock, CreditCard, Users, Calendar, History } from 'lucide-react';
import { useBookingCancellations } from '@/hooks/useBookingCancellations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import { Capacitor } from '@capacitor/core';

const MyTour = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNativeApp = Capacitor.isNativePlatform();
  const { data: plannedLocations = [], isLoading: locationsLoading } = usePlannedLocations();
  const { data: plannedPackages = [], isLoading: packagesLoading } = usePlannedPackages();
  const { data: myBookings = [], isLoading: myBookingsLoading } = useMyBookings(user?.id);
  const { data: cancellations = [] } = useBookingCancellations();

  const currentPath = window.location.pathname;

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, currentPath]);

  // If we have an ID, determine if it's a package or destination
  if (id) {
    if (currentPath.includes('/package/')) {
      return (
        <AppLayout>
          <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
            <PackageDetail />
          </main>
        </AppLayout>
      );
    } else if (currentPath.includes('/destination/')) {
      return (
        <AppLayout>
          <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
            <DestinationDetail />
          </main>
        </AppLayout>
      );
    }
  }

  const handleExploreDestinations = () => {
    navigate('/explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLoading = locationsLoading || packagesLoading || myBookingsLoading;
  const cancellationByBooking = useMemo(() => {
    const map = new Map<string, any>();
    for (const c of cancellations) {
      if (!map.has(c.booking_id)) map.set(c.booking_id, c);
    }
    return map;
  }, [cancellations]);

  const currentBookings = useMemo(() =>
    myBookings.filter((b: any) => {
      const s = (b.status || '').toLowerCase().replace(/\s+/g, '_');
      const cancel = cancellationByBooking.get(b.id);
      const isCancelled = s === 'cancelled' || cancel?.status === 'cancelled';
      const isCompleted = s === 'completed';
      return !isCancelled && !isCompleted;
    })
  , [myBookings, cancellationByBooking]);

  const historyBookings = useMemo(() =>
    myBookings
      .filter((b: any) => {
        const s = (b.status || '').toLowerCase().replace(/\s+/g, '_');
        const cancel = cancellationByBooking.get(b.id);
        return s === 'completed' || s === 'cancelled' || cancel?.status === 'cancelled';
      })
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  , [myBookings, cancellationByBooking]);

  const hasAnyContent = currentBookings.length > 0 || plannedLocations.length > 0 || plannedPackages.length > 0 || historyBookings.length > 0;
  const hasLiked = plannedPackages.length > 0 || plannedLocations.length > 0;

  const handleBookingClick = (bookingId: string) => {
    navigate(`/my-tour/booking/${bookingId}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your tour plans...</p>
          </div>
        </main>
      </AppLayout>
    );
  }

  // Auth gate: only logged-in users see bookings, history and likes
  if (!user) {
    return (
      <AppLayout>
        <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className={`container mx-auto px-4 py-8 ${isNativeApp ? 'px-6' : ''}`}>
            <div className="max-w-2xl mx-auto">
              <Card className="text-center p-8 sm:p-12">
                <CardContent>
                  <MapPin className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">You don't have any bookings yet</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
                    Sign in to view your current bookings, travel history, and liked items.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => navigate('/auth', { state: { returnUrl: '/my-tour' } })} size={isNativeApp ? "lg" : "default"}>
                      Sign in
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/packages')} size={isNativeApp ? "lg" : "default"}>
                      Explore Packages
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }

  // If there are no current bookings and no history, show empty state
  if (!myBookingsLoading && currentBookings.length === 0 && historyBookings.length === 0) {
    return (
      <AppLayout>
        <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className={`container mx-auto px-4 py-8 ${isNativeApp ? 'px-6' : ''}`}>
            <div className="max-w-2xl mx-auto">
              <Card className="text-center p-8 sm:p-12">
                <CardContent>
                  <MapPin className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">You don't have any bookings yet</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
                    Start by exploring packages and destinations to plan your next adventure.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => navigate('/packages')} size={isNativeApp ? "lg" : "default"}>
                      Explore Packages
                    </Button>
                    <Button variant="outline" onClick={handleExploreDestinations} size={isNativeApp ? "lg" : "default"}>
                      Explore Destinations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className={`container mx-auto px-4 py-6 ${isNativeApp ? 'px-6' : ''} space-y-8`}>
          {/* Header */}
          <div className="text-center">
            <h1 className={`${isNativeApp ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800 mb-2`}>
              My Tour Planner
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Manage your current bookings, explore your travel history, and plan your next adventure
            </p>
          </div>

          {/* Current Bookings */}
          {currentBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="h-5 w-5 text-primary" />
                  Your Current Bookings ({currentBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {currentBookings.map((booking: any) => {
                    const cancel = cancellationByBooking.get(booking.id);
                    const isProcessing = cancel?.status === 'processing' || booking.status?.toLowerCase() === 'processing_cancellation';
                    
                    return (
                      <Card 
                        key={booking.id} 
                        className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/30 hover:border-l-primary"
                        onClick={() => handleBookingClick(booking.id)}
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-20 h-48 sm:h-20 object-cover rounded-lg overflow-hidden">
                              <img
                                src={booking.package_image_url}
                                alt={booking.package_title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <h3 className="font-bold text-lg">{booking.package_title}</h3>
                                <Badge variant={isProcessing ? "destructive" : "default"} className="w-fit">
                                  {isProcessing ? 'Cancellation Processing' : 'Confirmed'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                <p className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {booking.package_location}
                                </p>
                                <p className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {booking.package_duration}
                                </p>
                                <p className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {Array.isArray(booking.tourists) ? booking.tourists.length : 0} tourists
                                </p>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
                                <span className="text-xs text-muted-foreground">
                                  Booked: {new Date(booking.booking_date).toLocaleDateString()}
                                </span>
                                <span className="font-semibold text-lg">₹{Number(booking.total_price).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* My Plannings */}
          {hasLiked && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Liked Packages */}
              {plannedPackages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Plus className="h-5 w-5 text-primary" />
                      Liked Packages ({plannedPackages.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plannedPackages.slice(0, 3).map((planned: any) => (
                        planned.packages && (
                          <PackageCard 
                            key={planned.id} 
                            package={planned.packages}
                          />
                        )
                      ))}
                      {plannedPackages.length > 3 && (
                        <Button variant="outline" className="w-full" onClick={() => navigate('/packages')}>
                          View All {plannedPackages.length} Liked Packages
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Liked Destinations */}
              {plannedLocations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <MapPin className="h-5 w-5 text-primary" />
                      Liked Destinations ({plannedLocations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plannedLocations.slice(0, 3).map((planned) => (
                        planned.locations && (
                          <DestinationCard 
                            key={planned.id} 
                            location={planned.locations}
                          />
                        )
                      ))}
                      {plannedLocations.length > 3 && (
                        <Button variant="outline" className="w-full" onClick={() => navigate('/explore')}>
                          View All {plannedLocations.length} Liked Destinations
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Travel History */}
          {historyBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <History className="h-5 w-5 text-primary" />
                  Travel History ({historyBookings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {historyBookings.slice(0, 5).map((booking: any) => {
                    const s = (booking.status || '').toLowerCase().replace(/\s+/g, '_');
                    const cancel = cancellationByBooking.get(booking.id);
                    const wasCancelled = s === 'cancelled' || cancel?.status === 'cancelled';
                    
                    return (
                      <Card 
                        key={booking.id} 
                        className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-muted hover:border-l-primary/50"
                        onClick={() => handleBookingClick(booking.id)}
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-20 h-48 sm:h-20 object-cover rounded-lg overflow-hidden opacity-80">
                              <img
                                src={booking.package_image_url}
                                alt={booking.package_title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <h3 className="font-bold text-lg">{booking.package_title}</h3>
                                <Badge variant={wasCancelled ? "destructive" : "default"}>
                                  {wasCancelled ? 'Cancelled' : 'Completed'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                <p className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {booking.package_location}
                                </p>
                                <p className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {booking.package_duration}
                                </p>
                                <p className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {Array.isArray(booking.tourists) ? booking.tourists.length : 0} tourists
                                </p>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
                                <span className="text-xs text-muted-foreground">
                                  {wasCancelled ? 'Cancelled' : 'Completed'}: {new Date(booking.updated_at).toLocaleDateString()}
                                </span>
                                <span className="font-semibold text-lg">₹{Number(booking.total_price).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {historyBookings.length > 5 && (
                    <div className="text-center">
                      <Button variant="outline">
                        View All {historyBookings.length} Travel History
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action - if no liked items */}
          {!hasLiked && (
            <Card className="text-center">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold mb-4">Ready to Plan Your Next Adventure?</h3>
                <p className="text-muted-foreground mb-6">
                  Explore our amazing packages and destinations to start planning
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => navigate('/packages')} size={isNativeApp ? "lg" : "default"}>
                    Browse Packages
                  </Button>
                  <Button variant="outline" onClick={handleExploreDestinations} size={isNativeApp ? "lg" : "default"}>
                    Explore Destinations
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </AppLayout>
  );
};

export default MyTour;