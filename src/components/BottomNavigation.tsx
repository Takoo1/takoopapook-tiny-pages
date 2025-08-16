
import { Home, MapPin, Package, Compass, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface BottomNavigationProps {
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
}

const BottomNavigation = ({ isMenuOpen = false, onMenuToggle }: BottomNavigationProps) => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'My Tour', path: '/my-tour', icon: Package },
    { name: 'Packages', path: '/packages', icon: MapPin },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Menu', path: '#', icon: isMenuOpen ? X : Menu, isMenuButton: true },
  ];

  const isActive = (path: string) => location.pathname === path;


  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border shadow-lg">
      <div className="flex items-center justify-around py-0.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = !item.isMenuButton && isActive(item.path);
          
          if (item.isMenuButton) {
            return (
              <button
                key={item.name}
                onClick={onMenuToggle}
                className="flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 text-muted-foreground hover:text-primary"
              >
                <div className="p-2 bg-primary/10 rounded-lg transition-all duration-300 hover:bg-primary/20">
                  <Icon className="h-5 w-5 transition-transform" />
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            );
          }
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-300 ${
                isItemActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                isItemActive
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-primary/10'
              }`}>
                <Icon className={`h-5 w-5 ${isItemActive ? 'scale-110' : ''} transition-transform`} />
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
