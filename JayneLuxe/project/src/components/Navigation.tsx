import { Home, Building2, Mail, Menu, Users, X, Briefcase, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavigationProps {
  currentRoute: string;
}

export const Navigation = ({ currentRoute }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // On the homepage, navbar background is transparent until the user scrolls.
  // On all other pages the solid background is always shown.
  const isTransparent = currentRoute === 'home' && !isScrolled;

  const navLinks = [
    { href: '#/', label: 'Home', icon: Home, route: 'home' },
    { href: '#/properties', label: 'Properties', icon: Building2, route: 'properties' },
    { href: '#/about', label: 'About Us', icon: Users, route: 'about' },
    { href: '#/contact', label: 'Contact', icon: Mail, route: 'contact' },
    { href: '#/careers', label: 'Careers', icon: Briefcase, route: 'careers' },
    { href: '#/prospect', label: 'Get Started', icon: ClipboardList, route: 'prospect' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 text-white transition-all duration-500 ease-in-out
        ${isTransparent ? 'bg-transparent shadow-none' : 'bg-[#134137] shadow-lg'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <a href="#/" className="flex items-center group">
            <div className={`relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300
              ring-1 ring-[#F3CF92]/25 group-hover:ring-2 group-hover:ring-[#F3CF92]/70
              shadow-md group-hover:shadow-[0_0_18px_rgba(243,207,146,0.25)]
              ${isTransparent ? 'ring-[#F3CF92]/40' : ''}`}
            >
              <img
                src="/jlr-logo.jpg"
                alt="Jayne Luxe Realty Logo"
                className="h-16 w-16 object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.route}
                href={link.href}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all hover:bg-[#F3CF92] hover:text-[#134137]
                  ${currentRoute === link.route && !isTransparent ? 'bg-[#F3CF92] text-[#134137]' : ''}
                  ${isTransparent ? 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]' : ''}`}
              >
                <link.icon className="w-4 h-4" />
                <span className="font-medium">{link.label}</span>
              </a>
            ))}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors hover:bg-[#F3CF92] hover:text-[#134137]
              ${isTransparent ? 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]' : ''}`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div
            className={`md:hidden pb-4 space-y-2 ${isTransparent ? 'bg-black/40 backdrop-blur-sm rounded-xl px-2 mb-2' : ''}`}
          >
            {navLinks.map((link) => (
              <a
                key={link.route}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all hover:bg-[#F3CF92] hover:text-[#134137]
                  ${currentRoute === link.route && !isTransparent ? 'bg-[#F3CF92] text-[#134137]' : ''}`}
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
