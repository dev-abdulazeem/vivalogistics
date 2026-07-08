import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatNaira } from '../utils/formatCurrency';
import { useAuthStore } from '../store/authStore';
import {
  ArrowRight,
  Star,
  MapPin,
  Shield,
  Clock,
  Headphones,
  X,
  ChevronDown,
  Phone,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();
  const [featured, setFeatured] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const fleetRef = useRef(null);
  const heroRef = useRef(null);

  const categories = ['all', 'sedan', 'suv', 'bus', 'van'];

  useEffect(() => {
    fetchFeatured();
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await api.get('/vehicles?limit=6');
      setFeatured(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredVehicles =
    activeCategory === 'all'
      ? featured
      : featured.filter((v) =>
          (v.type || '').toLowerCase().includes(activeCategory.toLowerCase())
        );

  const scrollToFleet = () => {
    fleetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-white animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <span className="text-xl font-extrabold text-slate-900">VIVA</span>
            <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-900" />
            </button>
          </div>
          <div className="p-6 space-y-1">
            {['Home', 'Vehicles', 'About'].map((item) => (
              <Link
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="block py-4 text-lg font-medium text-slate-700 border-b border-slate-50 hover:text-amber-600 transition-colors"
              >
                {item}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" onClick={() => setMenuOpen(false)} className="block py-4 text-lg font-medium text-slate-700 border-b border-slate-50 hover:text-amber-600 transition-colors">My Bookings</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-4 text-lg font-medium text-slate-700 border-b border-slate-50 hover:text-amber-600 transition-colors">Profile</Link>
              </>
            ) : (
              <div className="pt-6 space-y-3">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full text-center py-4 border border-slate-200 rounded-xl font-semibold text-slate-900 hover:bg-slate-50 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block w-full text-center py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex flex-col">
        {/* Background: Split layout */}
        <div className="absolute inset-0 flex">
          <div className="hidden lg:block w-[45%] bg-slate-950" />
          <div className="flex-1 relative">
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=85"
              alt="Premium fleet on Lagos road"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent lg:via-slate-950/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:hidden" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-10 lg:px-16 max-w-7xl mx-auto w-full py-24 lg:py-0">
          <div className="max-w-xl lg:max-w-lg">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white/70 text-xs font-medium tracking-wide">
                Verified by 12,000+ Nigerians
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.05] tracking-tight mb-6">
              The car you book<br />
              <span className="text-white/40">is the car you get.</span>
            </h1>

            {/* Subhead */}
            <p className="text-white/50 text-base md:text-lg mb-10 max-w-md leading-relaxed">
              Buses, SUVs, and sedans across Lagos, Abuja & Port Harcourt. 
              Real photos. Real prices. No surprises at pickup.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
              <button
                onClick={scrollToFleet}
                className="bg-white text-slate-900 px-8 py-3.5 rounded-lg font-semibold text-sm hover:bg-slate-100 transition-all duration-200 active:scale-[0.98]"
              >
                Browse fleet
              </button>
              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="text-white/50 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group"
                >
                  Create account — it is free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <Link
                  to="/my-bookings"
                  className="text-white/50 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group"
                >
                  View your bookings
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {/* Quick stats row */}
            <div className="flex items-center gap-6 text-xs text-white/30">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Fully insured
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> 24/7 support
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Instant confirmation
              </span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 pb-8 flex justify-center">
          <button
            onClick={scrollToFleet}
            className="flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors group"
          >
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase">Scroll</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <p className="text-slate-400 text-xs font-medium tracking-wide uppercase">
              Trusted by teams at
            </p>
            <div className="flex items-center gap-8 md:gap-12 opacity-40 grayscale">
              {['Andela', 'Flutterwave', 'Paystack', 'Kuda'].map((brand) => (
                <span key={brand} className="text-sm font-bold text-slate-900 tracking-tight">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
            {[
              { num: '500+', label: 'Vehicles', sub: 'across 3 cities' },
              { num: '50K+', label: 'Trips completed', sub: 'since 2019' },
              { num: '4.9', label: 'Average rating', sub: 'on Google Reviews' },
              { num: '< 5 min', label: 'Pickup time', sub: 'at any location' },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <p className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-1 group-hover:text-amber-600 transition-colors duration-300">
                  {stat.num}
                </p>
                <p className="text-slate-900 font-semibold text-sm">{stat.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-24 md:py-32 px-6 md:px-10 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left: sticky heading */}
            <div className="lg:sticky lg:top-24">
              <p className="text-slate-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                Why Viva
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
                No hidden fees.<br />No fake photos.<br />No stress.
              </h2>
              <p className="text-slate-500 text-base leading-relaxed max-w-md">
                We built Viva because we were tired of rental companies that looked great online 
                and disappointed in person. Every vehicle is photographed, inspected, and insured 
                before it goes live.
              </p>
            </div>

            {/* Right: feature cards */}
            <div className="space-y-4">
              {[
                {
                  icon: Shield,
                  title: 'Every vehicle is fully insured',
                  desc: 'Comprehensive coverage included in every booking. No extra paperwork, no surprise charges if something happens.',
                },
                {
                  icon: Clock,
                  title: 'Cancel or modify for free',
                  desc: 'Plans change. Modify your dates or cancel entirely up to 24 hours before pickup at zero cost.',
                },
                {
                  icon: Headphones,
                  title: 'Talk to a human, anytime',
                  desc: 'Our support team is based in Lagos. Call, WhatsApp, or email — someone real answers, usually within minutes.',
                },
                {
                  icon: MapPin,
                  title: 'Multiple pickup locations',
                  desc: 'Airport, hotel, or your doorstep. We deliver to you in Lagos, Abuja, and Port Harcourt.',
                },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="group p-6 md:p-8 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-colors duration-300">
                      <item.icon className="w-4 h-4 text-white group-hover:text-slate-900 transition-colors duration-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold text-slate-300 tracking-wider">0{i + 1}</span>
                        <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-slate-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Three steps. No paperwork.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                num: '01',
                title: 'Browse the fleet',
                desc: 'Filter by vehicle type, price, or location. Every listing has real photos, verified specs, and live availability.',
              },
              {
                num: '02',
                title: 'Book & pay securely',
                desc: 'Select your dates, pay with card or bank transfer via Paystack. You get instant confirmation and a booking reference.',
              },
              {
                num: '03',
                title: 'Pick up & drive',
                desc: 'Show your ID and booking reference. Most pickups take under five minutes. Then you are on the road.',
              },
            ].map((step, i) => (
              <div key={step.num} className="relative">
                <div className="mb-6">
                  <span className="text-6xl md:text-7xl font-bold text-slate-100 select-none">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-12 h-px bg-slate-200 -translate-x-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet */}
      <section ref={fleetRef} className="py-24 md:py-32 px-6 md:px-10 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
            <div>
              <p className="text-slate-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                The fleet
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                What is available
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredVehicles.length > 0 ? filteredVehicles : featured)
              .slice(0, 6)
              .map((vehicle) => (
                <Link
                  key={vehicle.id}
                  to={`/vehicles/${vehicle.id}`}
                  className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={
                        vehicle.images?.[0] ||
                        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'
                      }
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 backdrop-blur text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                        {vehicle.type}
                      </span>
                    </div>
                    {vehicle.isAvailable === false && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full">
                          Currently booked
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                          {vehicle.name}
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">
                          {vehicle.brand} {vehicle.model} · {vehicle.seats} seats
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-slate-900">{formatNaira(vehicle.pricePerDay)}</p>
                        <p className="text-[10px] text-slate-400 font-medium">per day</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-50">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> {vehicle.location || 'Lagos'}
                      </span>
                      {vehicle.avgRating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-slate-600 font-medium">{vehicle.avgRating}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300"
            >
              View all vehicles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-slate-950 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:mb-20">
            <p className="text-slate-500 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              What people say
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight max-w-xl">
              Do not take our word for it.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Chinedu Okonkwo',
                role: 'Business Executive',
                text: 'Pickup took four minutes. Car was spotless, tank full. This is how every rental should work.',
              },
              {
                name: 'Amina Bello',
                role: 'Event Planner',
                text: 'Booked three buses for a corporate retreat. Arrived early, drivers were professional, zero stress.',
              },
              {
                name: 'Tunde Adeyemi',
                role: 'Travel Blogger',
                text: 'The car in the photo actually matched the car at pickup. That never happens in Nigeria.',
              },
            ].map((review, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-slate-900 border border-slate-800/50 hover:border-slate-700 transition-colors duration-300"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-8">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{review.name}</p>
                    <p className="text-slate-600 text-xs">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-950 rounded-3xl px-8 md:px-16 py-20 md:py-24 text-center relative overflow-hidden">
            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
                {isAuthenticated
                  ? `Back for more, ${user?.fullName?.split(' ')[0]}?`
                  : 'Ready when you are.'}
              </h2>
              <p className="text-slate-400 mb-10 text-base md:text-lg leading-relaxed">
                {isAuthenticated
                  ? 'Your next ride is a few taps away.'
                  : 'Join thousands of Nigerians who book direct. No commitment, no hassle.'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to={isAuthenticated ? '/vehicles' : '/register'}
                  className="bg-white text-slate-900 px-8 py-3.5 rounded-lg font-semibold text-sm hover:bg-slate-100 transition-all duration-200"
                >
                  {isAuthenticated ? 'Book a vehicle' : 'Create free account'}
                </Link>
                <Link
                  to="/vehicles"
                  className="text-white/50 hover:text-white px-8 py-3.5 text-sm font-medium transition-colors border border-white/10 rounded-lg hover:bg-white/5"
                >
                  Browse fleet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}