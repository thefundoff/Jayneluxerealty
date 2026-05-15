import { Facebook, X, Instagram, Linkedin, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#134137] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <div className="rounded-xl overflow-hidden ring-1 ring-[#F3CF92]/30 shadow-md inline-block">
                <img
                  src="/jlr-logo.jpg"
                  alt="Jayne Luxe Realty Logo"
                  className="h-16 w-16 object-contain"
                />
              </div>
            </div>
            <p className="text-gray-300">
              Your trusted partner in finding premium real estate properties across Nigeria.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-[#F3CF92] hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-[#F3CF92] hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/jayneluxerealty?igsh=ZjJnNWluMmV1bnZs&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-[#F3CF92] hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/company/jayne-luxe-realty/" target="_blank" rel="noopener noreferrer" className="text-[#F3CF92] hover:text-white transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#/" className="text-gray-300 hover:text-[#F3CF92] transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#/about" className="text-gray-300 hover:text-[#F3CF92] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#/properties" className="text-gray-300 hover:text-[#F3CF92] transition-colors">
                  Properties
                </a>
              </li>
              <li>
                <a href="#/contact" className="text-gray-300 hover:text-[#F3CF92] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#F3CF92] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">+234 (807) 263-6542</p>
                  <p className="text-gray-300">0810 441 6929</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-[#F3CF92] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">jayneluxerealty@gmail.com</p>
                  <p className="text-gray-300">info.jayneluxerealty@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#F3CF92] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Inna Plaza, Gaduwa, Abuja</p>
                  <p className="text-gray-300">Abuja, Nigeria 480211</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Business Hours</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex justify-between">
                <span>Monday - Friday:</span>
                <span className="text-[#F3CF92]">9:00 AM - 5:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-[#F3CF92]">Closed</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-[#F3CF92]">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h5 className="font-bold text-[#F3CF92] mb-3"></h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-[#F3CF92] transition-colors"></a></li>
                <li><a href="#" className="hover:text-[#F3CF92] transition-colors"></a></li>
                <li><a href="#" className="hover:text-[#F3CF92] transition-colors"></a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-[#F3CF92] mb-3"></h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-[#F3CF92] transition-colors"></a></li>
                <li><a href="#" className="hover:text-[#F3CF92] transition-colors"></a></li>
                <li><a href="#" className="hover:text-[#F3CF92] transition-colors"></a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-[#F3CF92] mb-3"></h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#/about" className="hover:text-[#F3CF92] transition-colors"></a></li>
                <li><a href="#" className="hover:text-[#F3CF92] transition-colors"></a></li>
                <li><a href="#" className="hover:text-[#F3CF92] transition-colors"></a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 JayneLuxe Realty. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
