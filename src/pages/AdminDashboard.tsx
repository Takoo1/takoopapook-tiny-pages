import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  MapPin, 
  BookOpen, 
  Star,
  Users,
  Settings,
  FileText,
  BarChart3
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AdminDashboard = () => {
  const adminSections = [
    {
      title: 'Package Management',
      description: 'Create, edit, and manage travel packages',
      icon: Package,
      link: '/admin/packages',
      color: 'bg-blue-500'
    },
    {
      title: 'Destination Management',
      description: 'Add and manage tourist destinations',
      icon: MapPin,
      link: '/admin/destinations',
      color: 'bg-green-500'
    },
    {
      title: 'Bookings Management',
      description: 'View and manage customer bookings',
      icon: BookOpen,
      link: '/admin/bookings',
      color: 'bg-purple-500'
    },
    {
      title: 'Reviews Management',
      description: 'Moderate and manage customer reviews',
      icon: Star,
      link: '/admin/reviews',
      color: 'bg-yellow-500'
    },
    {
      title: 'Analytics',
      description: 'View statistics and reports',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'bg-indigo-500'
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: Settings,
      link: '/admin/settings',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-br from-primary/5 to-secondary/5 py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Manage your travel business from one central location
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section) => {
              const IconComponent = section.icon;
              
              return (
                <Card key={section.title} className="hover:shadow-lg transition-all duration-200 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${section.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {section.description}
                    </p>
                    <Button asChild className="w-full">
                      <Link to={section.link}>
                        Access {section.title}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Quick Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">--</div>
                  <div className="text-sm text-muted-foreground">Total Packages</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">--</div>
                  <div className="text-sm text-muted-foreground">Destinations</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">--</div>
                  <div className="text-sm text-muted-foreground">Total Bookings</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold">--</div>
                  <div className="text-sm text-muted-foreground">Reviews</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link to="/admin/packages">
                  <Package className="h-4 w-4 mr-2" />
                  Add New Package
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/destinations">
                  <MapPin className="h-4 w-4 mr-2" />
                  Add Destination
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/reviews">
                  <Star className="h-4 w-4 mr-2" />
                  Review Submissions
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/bookings">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Bookings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;