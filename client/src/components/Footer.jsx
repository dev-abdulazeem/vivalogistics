import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

// Social icons
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Viva Logistic Logo
function VivaLogo({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="22" fill="#0F172A" />
      <path d="M14 14L24 34L34 14" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 28L24 38L30 28" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      <circle cx="24" cy="10" r="2" fill="#F59E0B" />
    </svg>
  );
}

export default function Footer() {
  const socialLinks = [
    { icon: FacebookIcon, href: '#', label: 'Facebook' },
    { icon: XIcon, href: '#', label: 'X (Twitter)' },
    { icon: InstagramIcon, href: '#', label: 'Instagram' },
  ];

  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'Vehicles', to: '/vehicles' },
    { label: 'My Bookings', to: '/my-bookings' },
    { label: 'About Us', to: '#' },
    { label: 'Contact', to: '#' },
  ];

  const services = [
    'Car Rental',
    'Bus Rental',
    'Van Rental',
    'SUV Rental',
    'Airport Pickup',
    'Corporate Fleet',
  ];

  return (
    <footer className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <VivaLogo className="w-10 h-10" />
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight leading-none">VIVA</span>
                <span className="text-[9px] font-semibold tracking-[0.3em] text-amber-500 uppercase leading-none mt-0.5">Logistic</span>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-8 text-sm max-w-xs">
              Premium car, bus, and van rentals across Nigeria. Reliable rides for every journey — business, leisure, or events.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 rounded-lg flex items-center justify-center transition-all duration-200 text-slate-400"
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-slate-300">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-slate-500 hover:text-amber-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-slate-300">Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-slate-500 text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-slate-300">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-500 text-sm leading-relaxed">
                  123 Victoria Island,<br />
                  Lagos, Nigeria
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href="tel:+2348000000000" className="text-slate-500 hover:text-amber-400 transition text-sm">
                  +234 800 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href="mailto:support@vivalogistic.ng" className="text-slate-500 hover:text-amber-400 transition text-sm">
                  support@vivalogistic.ng
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm">
            &copy; {new Date().getFullYear()} Viva Logistic. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}