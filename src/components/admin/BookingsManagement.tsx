
import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, User, CreditCard, Eye, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBookings, useUpdateBookingStatus } from '@/hooks/useBookings';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBookingCancellations, useUpdateCancellationStatus, BookingCancellation } from '@/hooks/useBookingCancellations';

const BookingsManagement = () => {
  const { data: bookings = [], isLoading } = useBookings();
  const updateBookingStatus = useUpdateBookingStatus();
  const { data: cancellations = [] } = useBookingCancellations();
  const updateCancellationStatus = useUpdateCancellationStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const cancellationByBooking = useMemo(() => {
    const map = new Map<string, BookingCancellation>();
    for (const c of cancellations) {
      if (!map.has(c.booking_id)) {
        map.set(c.booking_id, c); // cancellations already sorted desc
      }
    }
    return map;
  }, [cancellations]);

  // Filter bookings based on search term and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.package_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.package_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tourists.some(tourist => 
        tourist.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'processing_cancellation':
        return 'secondary';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingStatus.mutateAsync({ bookingId, status: newStatus });
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleCancellationStatusUpdate = async (cancellationId: string, newStatus: 'processing' | 'cancelled') => {
    try {
      await updateCancellationStatus.mutateAsync({ cancellationId, status: newStatus });
    } catch (error) {
      console.error('Error updating cancellation status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-lg">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bookings Management</h1>
          <p className="text-muted-foreground">
            View and manage all travel package bookings
          </p>
        </div>
        <Card className="p-4">
          <div className="text-2xl font-bold text-primary">{bookings.length}</div>
          <div className="text-sm text-muted-foreground">Total Bookings</div>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by package, location, or tourist name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing_cancellation">Processing Cancellation</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Tourists</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booking Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const cancellation = cancellationByBooking.get(booking.id);
                  return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.package_image_url || '/placeholder.svg'}
                          alt={booking.package_title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-medium">{booking.package_title}</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.package_duration}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.package_location}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {booking.tourists.length}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        ₹{booking.total_price.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {booking.status === 'processing_cancellation' ? 'Processing Cancellation' : booking.status}
                        </Badge>
                        {cancellation && (
                          <Badge variant={cancellation.status === 'processing' ? 'secondary' : 'destructive'}>
                            {cancellation.status === 'processing' ? 'Processing Cancellation' : 'Cancelled'}
                          </Badge>
                        )}
                        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                            className="text-xs h-6 px-2"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(booking.booking_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                            <DialogDescription>
                              Complete information for booking #{booking.id.slice(0, 8)}
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="max-h-96 pr-4">
                            <div className="space-y-4">
                              {/* Package Info */}
                              <div>
                                <h4 className="font-semibold mb-2">Package Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Title:</span>
                                    <div className="font-medium">{booking.package_title}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Location:</span>
                                    <div className="font-medium">{booking.package_location}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Duration:</span>
                                    <div className="font-medium">{booking.package_duration}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Package Price:</span>
                                    <div className="font-medium">{booking.package_price}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Tourist Details */}
                              <div>
                                <h4 className="font-semibold mb-2">Tourist Information</h4>
                                <div className="space-y-2">
                                  {booking.tourists.map((tourist, index) => (
                                    <div key={tourist.id} className="border rounded-lg p-3">
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                          <span className="text-muted-foreground">Name:</span>
                                          <div className="font-medium">{tourist.name}</div>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">ID Type:</span>
                                          <div className="font-medium">{tourist.idType}</div>
                                        </div>
                                        <div className="col-span-2">
                                          <span className="text-muted-foreground">ID Number:</span>
                                          <div className="font-medium">{tourist.idNumber}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Booking Summary */}
                              <div>
                                <h4 className="font-semibold mb-2">Booking Summary</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Total Price:</span>
                                    <div className="font-medium text-lg">₹{booking.total_price.toLocaleString()}</div>
                                  </div>
                                   <div>
                                     <span className="text-muted-foreground">Status:</span>
                                     <div className="flex items-center gap-2">
                                       <Select 
                                         value={booking.status}
                                         onValueChange={(newStatus) => handleStatusUpdate(booking.id, newStatus)}
                                       >
                                         <SelectTrigger className="w-48 h-8">
                                           <SelectValue />
                                         </SelectTrigger>
                                         <SelectContent>
                                           <SelectItem value="confirmed">Confirmed</SelectItem>
                                           <SelectItem value="processing_cancellation">Processing Cancellation</SelectItem>
                                           <SelectItem value="completed">Completed</SelectItem>
                                           <SelectItem value="cancelled">Cancelled</SelectItem>
                                         </SelectContent>
                                       </Select>
                                     </div>
                                   </div>
                                  <div>
                                    <span className="text-muted-foreground">Booking Date:</span>
                                    <div className="font-medium">{formatDate(booking.booking_date)}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Created:</span>
                                    <div className="font-medium">{formatDate(booking.created_at)}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Cancellation Section */}
                              {cancellation && (
                                <div>
                                  <h4 className="font-semibold mb-2">Cancellation</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Status:</span>
                                      <div className="mt-1">
                                        <Select
                                          value={cancellation.status}
                                          onValueChange={(newStatus) => handleCancellationStatusUpdate(cancellation.id, newStatus as 'processing' | 'cancelled')}
                                        >
                                          <SelectTrigger className="w-40 h-8">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Reason:</span>
                                      <div className="font-medium">{cancellation.reason}</div>
                                    </div>
                                    {cancellation.details && (
                                      <div className="col-span-2">
                                        <span className="text-muted-foreground">Details:</span>
                                        <div className="font-medium whitespace-pre-wrap">{cancellation.details}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'No bookings found matching your criteria.' 
                : 'No bookings found.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsManagement;
