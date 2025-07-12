
import { useState } from 'react';
import { Menu, X, User, MapPin, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExploreDropdownOpen, setIsExploreDropdownOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Packages', path: '/packages' },
    { name: 'My Tour', path: '/my-tour' },
    { name: 'Our Services', path: '/services' },
    { name: 'About Us', path: '/about' },
  ];

  const exploreCategories = [
    { name: 'All Destinations', path: '/explore' },
    { name: 'Nature', path: '/explore?category=Nature' },
    { name: 'Adventure', path: '/explore?category=Adventure' },
    { name: 'Cultural', path: '/explore?category=Cultural' },
    { name: 'Pilgrims', path: '/explore?category=Pilgrims' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Takoopapook
              </h1>
              <p className="text-xs text-gray-500 hidden md:block">Arunachal Pradesh Tourism</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 hover:text-emerald-600 ${
                  isActive(item.path)
                    ? 'text-emerald-600'
                    : 'text-gray-700 hover:text-emerald-600'
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                )}
              </Link>
            ))}
            
            {/* Explore Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExploreDropdownOpen(!isExploreDropdownOpen)}
                className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-all duration-300 hover:text-emerald-600 ${
                  location.pathname.startsWith('/explore')
                    ? 'text-emerald-600'
                    : 'text-gray-700 hover:text-emerald-600'
                }`}
              >
                <span>Explore</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isExploreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isExploreDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                  {exploreCategories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      onClick={() => setIsExploreDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
              
              {location.pathname.startsWith('/explore') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
              )}
            </div>
          </nav>

          {/* Login Button & Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            <button className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
              <User className="h-4 w-4" />
              <span>Login</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-t">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Explore Submenu */}
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm font-medium text-gray-800 border-b border-gray-200">
                  Explore
                </div>
                {exploreCategories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-6 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              
              <button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-lg mt-4">
                <User className="h-4 w-4" />
                <span>Login</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
