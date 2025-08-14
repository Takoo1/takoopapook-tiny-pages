
import { Home, MapPin, Package, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'My Tour', path: '/my-tour', icon: Package },
    { name: 'Packages', path: '/packages', icon: MapPin },
    { name: 'Explore', path: '/explore', icon: Compass },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border shadow-lg">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center space-y-1 p-2 rounded-full transition-all duration-300 ${
                isActive(item.path)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <div className={`p-2 rounded-full transition-all duration-300 ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-primary/5'
              }`}>
                <Icon className={`h-5 w-5 ${isActive(item.path) ? 'scale-110' : ''} transition-transform`} />
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
