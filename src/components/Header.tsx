import { useState } from 'react';
import { Menu, X, User, MapPin, ChevronDown, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import logo from '@/assets/logo.png';
import { Capacitor } from '@capacitor/core';
import SearchBar from '@/components/SearchBar';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExploreDropdownOpen, setIsExploreDropdownOpen] = useState(false);
  const [isPackagesDropdownOpen, setIsPackagesDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const {
    user,
    signOut
  } = useAuth();
  const {
    toast
  } = useToast();
  const isNativeApp = Capacitor.isNativePlatform();
  const isHomePage = location.pathname === '/';
  const handleSignOut = async () => {
    const {
      error
    } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
    }
    setIsUserDropdownOpen(false);
  };
  const navItems = [{
    name: 'Home',
    path: '/'
  }, {
    name: 'Account',
    path: '/my-tour'
  }, {
    name: 'About Us',
    path: '/about'
  }];
  const exploreCategories = [{
    name: 'All Destinations',
    path: '/explore'
  }, {
    name: 'Nature',
    path: '/explore?category=Nature'
  }, {
    name: 'Adventure',
    path: '/explore?category=Adventure'
  }, {
    name: 'Cultural',
    path: '/explore?category=Cultural'
  }, {
    name: 'Pilgrims',
    path: '/explore?category=Pilgrims'
  }];
  const packageCategories = [{
    name: 'All Packages',
    path: '/packages'
  }, {
    name: 'Nature',
    path: '/packages?category=nature'
  }, {
    name: 'Adventure',
    path: '/packages?category=adventure'
  }, {
    name: 'Cultural',
    path: '/packages?category=cultural'
  }, {
    name: 'Pilgrims',
    path: '/packages?category=pilgrims'
  }];
  const isActive = (path: string) => location.pathname === path;
  return <header className={`fixed top-0 left-0 right-0 z-50 ${isNativeApp ? 'bg-transparent pt-8' : 'bg-white/95 backdrop-blur-md shadow-lg'}`}>
      <div className={`container mx-auto container-padding ${isNativeApp ? 'pt-4' : ''}`}>
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className={`${isNativeApp ? 'bg-white/90 backdrop-blur-sm rounded-full p-2' : ''}`}>
              <img src={logo} alt="Logo" className="h-12 w-12 sm:h-20 sm:w-20 object-contain group-hover:scale-105 transition-all duration-300" />
            </div>
          </Link>

          {/* Mobile Search Bar - Only on Home page */}
          {isMobile && isHomePage && (
            <div className="flex-1 mx-6">
              <SearchBar />
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navItems.map(item => <Link key={item.name} to={item.path} className={`relative px-2 py-2 text-sm font-medium transition-all duration-300 hover:text-emerald-600 ${isActive(item.path) ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'}`}>
                {item.name}
                {isActive(item.path) && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>}
              </Link>)}
            
            {/* Explore Dropdown */}
            <div className="relative">
              <button onClick={() => setIsExploreDropdownOpen(!isExploreDropdownOpen)} className={`flex items-center space-x-1 px-2 py-2 text-sm font-medium transition-all duration-300 hover:text-emerald-600 ${location.pathname.startsWith('/explore') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'}`}>
                <span>Explore</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isExploreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isExploreDropdownOpen && <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                  {exploreCategories.map(category => <Link key={category.name} to={category.path} onClick={() => setIsExploreDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 first:rounded-t-lg last:rounded-b-lg">
                      {category.name}
                    </Link>)}
                </div>}
              
              {location.pathname.startsWith('/explore') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>}
            </div>
            
            {/* Packages Dropdown */}
            <div className="relative">
              <button onClick={() => setIsPackagesDropdownOpen(!isPackagesDropdownOpen)} className={`flex items-center space-x-1 px-2 py-2 text-sm font-medium transition-all duration-300 hover:text-emerald-600 ${location.pathname.startsWith('/packages') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'}`}>
                <span>Packages</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isPackagesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isPackagesDropdownOpen && <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                  {packageCategories.map(category => <Link key={category.name} to={category.path} onClick={() => setIsPackagesDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 first:rounded-t-lg last:rounded-b-lg">
                      {category.name}
                    </Link>)}
                </div>}
              
              {location.pathname.startsWith('/packages') && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>}
            </div>
          </nav>

          {/* User Actions & Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (/* User Dropdown */
          <div className="hidden md:block relative">
                <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserDropdownOpen && <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    </div>
                    <button onClick={handleSignOut} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>}
              </div>) : (/* Login Button */
          <Link to="/auth" className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>)}

            {/* Mobile menu button - Hidden on native app with mobile layout */}
            {!isNativeApp}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-t max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain">
            <nav className="flex flex-col p-4 space-y-2 pb-12">
              {navItems.map(item => <Link key={item.name} to={item.path} onClick={() => setIsMenuOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${isActive(item.path) ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {item.name}
                </Link>)}
              
              {/* Mobile Packages Submenu */}
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm font-medium text-gray-800 border-b border-gray-200">
                  Packages
                </div>
                {packageCategories.map(category => <Link key={category.name} to={category.path} onClick={() => setIsMenuOpen(false)} className="block px-6 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg">
                    {category.name}
                  </Link>)}
              </div>
              
              {/* Mobile Explore Submenu */}
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm font-medium text-gray-800 border-b border-gray-200">
                  Explore
                </div>
                {exploreCategories.map(category => <Link key={category.name} to={category.path} onClick={() => setIsMenuOpen(false)} className="block px-6 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg">
                    {category.name}
                  </Link>)}
              </div>
              
              {user ? <div className="space-y-2 mt-4">
                  <div className="px-4 py-2 bg-emerald-50 rounded-lg">
                    <p className="text-sm font-medium text-emerald-800">{user.email}</p>
                  </div>
                  <button onClick={handleSignOut} className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div> : <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-lg mt-4 mb-4">
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>}
            </nav>
          </div>}
      </div>
    </header>;
};
export default Header;