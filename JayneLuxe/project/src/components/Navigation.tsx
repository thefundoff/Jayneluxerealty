import { Home, Building2, Mail, Menu, Users, X } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  currentRoute: string;
}

export const Navigation = ({ currentRoute }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePropertiesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (currentRoute !== 'home') {
      window.location.hash = '/';
      setTimeout(() => {
        document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { href: '#/', label: 'Home', icon: Home, route: 'home', onClick: undefined as ((e: React.MouseEvent) => void) | undefined },
    { href: '#properties', label: 'Properties', icon: Building2, route: 'properties', onClick: handlePropertiesClick },
    { href: '#/contact', label: 'Contact', icon: Mail, route: 'contact', onClick: undefined as ((e: React.MouseEvent) => void) | undefined },
    { href: '#/about', label: 'About Us', icon: Users, route: 'about', onClick: undefined as ((e: React.MouseEvent) => void) | undefined },
  ];

  return (
    <nav className="bg-[#134137] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <a href="#/" className="flex items-center space-x-3 group">
            <img
              src="/photo_5875219655968885966_y.jpg"
              alt="Jayne Luxe Realty Logo"
              className="h-16 w-32 object-cover group-hover:scale-105 transition-transform"
            />
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.route}
                href={link.href}
                onClick={link.onClick}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all hover:bg-[#F3CF92] hover:text-[#134137] ${
                  currentRoute === link.route ? 'bg-[#F3CF92] text-[#134137]' : ''
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="font-medium">{link.label}</span>
              </a>
            ))}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#F3CF92] hover:text-[#134137] transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.route}
                href={link.href}
                onClick={link.onClick ?? (() => setIsMenuOpen(false))}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all hover:bg-[#F3CF92] hover:text-[#134137] ${
                  currentRoute === link.route ? 'bg-[#F3CF92] text-[#134137]' : ''
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
