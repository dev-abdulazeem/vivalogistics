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
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();
  const [featured, setFeatured] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const fleetRef = useRef(null);

  const categories = ['all', 'sedan', 'suv', 'bus', 'van'];

  useEffect(() => {
    fetchFeatured();
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
      
      {/* ─── Mobile Menu Overlay ─── */}
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
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block w-full text-center py-4 bg-amber-500 text-slate-900 rounded-xl font-bold hover:bg-amber-400 transition-colors">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[100dvh] flex flex-col justify-end overflow-hidden">
        {/* Background - dark base with centered bus image */}
        <div className="absolute inset-0 bg-slate-950">
          {/* Mobile-optimized: bus centered, slightly zoomed for impact */}
          <img
            src="https://kimi-web-img.moonshot.cn/img/t3.ftcdn.net/7274b94b5f4e068d5dd7388d9672fe726ec6410e.jpg"
            alt="Luxury coach bus"
            className="w-full h-full object-cover object-center md:object-[center_30%] scale-110 md:scale-100"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 pb-20 md:pb-28 px-5 md:px-10 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-[11px] font-semibold tracking-[0.15em] uppercase">
                Viva Logistics
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[0.95] tracking-tight mb-6">
              Travel in<br />
              <span className="text-amber-400">comfort.</span>
            </h1>
            
            <p className="text-white/60 text-lg md:text-xl mb-10 max-w-md leading-relaxed font-light">
              Premium buses, SUVs, and sedans across Nigeria. No hidden fees. No stress. Just drive.
            </p>
            
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={scrollToFleet}
                className="bg-white text-slate-900 px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-white/10 active:scale-95"
              >
                See what's available
              </button>
              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="text-white/60 hover:text-white text-sm font-medium px-4 py-3.5 transition-colors flex items-center gap-2 group"
                >
                  Sign up free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  to="/vehicles"
                  className="text-white/60 hover:text-white text-sm font-medium px-4 py-3.5 transition-colors flex items-center gap-2 group"
                >
                  Browse fleet
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Smooth fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent z-10" />
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="bg-white py-16 md:py-20 -mt-1 relative z-20">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { num: '500+', label: 'Premium Vehicles' },
              { num: '50K+', label: 'Successful Trips' },
              { num: '4.9', label: 'Average Rating' },
              { num: '24/7', label: 'Live Support' },
            ].map((stat, i) => (
              <div key={stat.label} className={`text-center md:text-left ${i !== 3 ? 'md:border-r md:border-slate-100' : ''}`}>
                <p className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{stat.num}</p>
                <p className="text-slate-400 text-sm mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Us ─── */}
      <section className="py-24 md:py-32 px-5 md:px-10 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="md:flex md:items-end md:justify-between mb-16 md:mb-20">
            <div className="max-w-lg">
              <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Why us</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                We handle the<br />hard stuff.
              </h2>
            </div>
            <p className="text-slate-500 mt-4 md:mt-0 max-w-sm text-base leading-relaxed">
              Every vehicle is inspected, insured, and cleaned before it reaches you. That's the standard.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Fully Insured',
                desc: 'Comprehensive coverage on every vehicle. No exceptions, no hidden clauses.',
              },
              {
                icon: Clock,
                title: 'Flexible Booking',
                desc: 'Hourly, daily, or weekly. Modify or cancel your booking before pickup at no charge.',
              },
              {
                icon: Headphones,
                title: 'Real Support',
                desc: 'A human answers when you call. Any time, any day. No bots, no queues.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group p-8 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-300">
                  <item.icon className="w-5 h-5 text-white group-hover:text-slate-900 transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-24 md:py-32 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Three steps. No paperwork.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-16 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-slate-200" />
            
            {[
              {
                num: '01',
                title: 'Browse',
                desc: 'Filter by type, price, or location. See real photos and live availability.',
              },
              {
                num: '02',
                title: 'Book',
                desc: 'Pick your dates, pay securely with Paystack, get instant confirmation.',
              },
              {
                num: '03',
                title: 'Drive',
                desc: 'Show your ID, grab the keys. Most pickups take under five minutes.',
              },
            ].map((step) => (
              <div key={step.num} className="relative text-center">
                <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto mb-8 text-xl font-bold tracking-tight relative z-10 border-4 border-white">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Fleet ─── */}
      <section ref={fleetRef} className="py-24 md:py-32 px-5 md:px-10 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="md:flex md:items-end md:justify-between mb-12 md:mb-16">
            <div>
              <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-3">The fleet</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">What's available</h2>
            </div>
            <div className="flex gap-2 mt-6 md:mt-0 overflow-x-auto pb-2 md:pb-0 -mx-5 px-5 md:mx-0 md:px-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'all' ? 'All Vehicles' : cat}
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
                  className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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

      {/* ─── Testimonials ─── */}
      <section className="py-24 md:py-32 bg-slate-950 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">What people say</h2>
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
                className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors duration-300"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-8">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{review.name}</p>
                    <p className="text-slate-500 text-xs">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 md:py-32 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80"
                alt="Road ahead"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/80" />
            </div>
            <div className="relative z-10 py-20 md:py-28 px-8 md:px-16 text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
                {isAuthenticated
                  ? `Back for more, ${user?.fullName?.split(' ')[0]}?`
                  : 'Ready when you are.'}
              </h2>
              <p className="text-slate-400 mb-10 max-w-lg mx-auto text-base md:text-lg leading-relaxed">
                {isAuthenticated
                  ? 'Your next ride is a few taps away.'
                  : 'Join thousands of Nigerians who book direct. No commitment, no hassle.'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to={isAuthenticated ? '/vehicles' : '/register'}
                  className="bg-white text-slate-900 px-8 py-4 rounded-full font-semibold text-sm hover:bg-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-white/10"
                >
                  {isAuthenticated ? 'Book a vehicle' : 'Create free account'}
                </Link>
                <Link
                  to="/vehicles"
                  className="text-white/70 hover:text-white px-8 py-4 text-sm font-medium transition-colors border border-white/20 rounded-full hover:bg-white/5"
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