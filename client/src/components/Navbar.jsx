import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Menu, X, User, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

function VivaLogo({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGrad)" />
      <path d="M14 20L24 32L34 20" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 26L24 34L30 26" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      <circle cx="24" cy="14" r="2.5" fill="#0F172A" />
    </svg>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  if (isAdmin) return null;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/vehicles', label: 'Vehicles' },
    { to: '/about', label: 'About' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-md border-b border-slate-100' : 'bg-white border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <Link to="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => setMenuOpen(false)}>
              <VivaLogo className="w-9 h-9 transition-transform duration-300 group-hover:scale-105" />
              <div className="flex flex-col leading-none">
                <span className="text-lg font-black tracking-tight text-slate-900">VIVA</span>
                <span className="text-[9px] font-bold tracking-[0.3em] text-amber-600 uppercase">Logistics</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="relative px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-lg transition-colors duration-200 group">
                  {link.label}
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link to="/my-bookings" className="relative px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-lg transition-colors duration-200 group">
                    My Bookings
                    <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
                  </Link>

                  <div className="relative ml-3 pl-3 border-l border-slate-200" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                        <span className="text-white text-xs font-bold">{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">{user?.fullName?.split(' ')[0]}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                          <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                        </div>
                        <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 ml-3 pl-3 border-l border-slate-200">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
                  <Link to="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-sm">Get Started</Link>
                </div>
              )}
            </div>

            <button 
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 space-y-0.5">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-3 text-slate-600 hover:text-amber-700 hover:bg-amber-50/60 rounded-lg font-medium transition-colors">
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="border-t border-slate-100 my-2" />
                  <Link to="/my-bookings" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-3 text-slate-600 hover:text-amber-700 hover:bg-amber-50/60 rounded-lg font-medium transition-colors">
                    My Bookings
                  </Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-3 text-slate-600 hover:text-amber-700 hover:bg-amber-50/60 rounded-lg font-medium transition-colors">
                    <User className="w-4 h-4 mr-3" /> Profile
                  </Link>
                  <button onClick={handleLogout} className="flex items-center w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
                    <LogOut className="w-4 h-4 mr-3" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-slate-100 my-2" />
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="flex items-center justify-center bg-amber-500 text-slate-950 px-3 py-3 rounded-lg font-semibold hover:bg-amber-400 active:scale-[0.98] transition-all mt-1">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="h-16" />
    </>
  );
}