import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Takoopapook</h3>
                <p className="text-emerald-200 text-sm">Arunachal Pradesh Tourism</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Discover the pristine beauty of Arunachal Pradesh with our carefully curated travel experiences. 
              From majestic mountains to vibrant cultures, we bring you closer to nature's paradise.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <button key={index} className="bg-white/10 p-3 rounded-lg hover:bg-emerald-500 transition-all duration-300 group">
                  <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-emerald-200">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'Explore', 'Packages', 'My Tour', 'Our Services', 'About Us'].map((item) => (
                <li key={item}>
                  <Link to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                        className="text-gray-300 hover:text-emerald-200 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-emerald-200">Popular Destinations</h4>
            <ul className="space-y-3">
              {['Tawang', 'Ziro Valley', 'Bomdila', 'Sela Pass', 'Namdapha', 'Itanagar'].map((destination) => (
                <li key={destination}>
                  <Link to="#" className="text-gray-300 hover:text-emerald-200 transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {destination}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-emerald-200">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Tourism Department</p>
                  <p className="text-gray-300">Itanagar, Arunachal Pradesh</p>
                  <p className="text-gray-300">India - 791111</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">+91 360 2212345</p>
                  <p className="text-gray-300">+91 360 2212346</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <p className="text-gray-300">info@takoopapook.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-xl font-semibold mb-4 text-emerald-200">Subscribe to Our Newsletter</h4>
            <p className="text-gray-300 mb-6">Get the latest updates on new packages, destinations, and exclusive offers.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white/20 transition-all duration-300"
              />
              <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 Takoopapook. All rights reserved. | Designed with ❤️ for Arunachal Pradesh
          </p>
          <div className="flex space-x-6 text-sm">
            <Link to="#" className="text-gray-400 hover:text-emerald-200 transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-gray-400 hover:text-emerald-200 transition-colors">Terms of Service</Link>
            <Link to="#" className="text-gray-400 hover:text-emerald-200 transition-colors">Cookie Policy</Link>
            <Link to="/admin/map-editor" className="text-gray-400 hover:text-emerald-200 transition-colors">Admin Panel</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
