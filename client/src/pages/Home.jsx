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
  Car,
  Bus,
  Users,
  CreditCard,
  Calendar,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();
  const [featured, setFeatured] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentCity, setCurrentCity] = useState('Lagos');
  const fleetRef = useRef(null);
  const heroRef = useRef(null);

  const categories = ['all', 'sedan', 'suv', 'bus', 'van'];

  const cities = [
    { name: 'Lagos', tagline: 'Mainland & Island coverage' },
    { name: 'Abuja', tagline: 'Airport & city center' },
    { name: 'Port Harcourt', tagline: 'Trans Amadi to GRA' },
  ];

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

      {/* HERO SECTION — Better image, no split layout */}
      <section ref={heroRef} className="relative bg-slate-950 min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-center">
        {/* Background image — premium black SUV on city road at dusk */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1920&q=80"
            alt="Premium SUV on city road"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full py-20 lg:py-0">
          <div className="max-w-2xl">
            
            {/* City selector */}
            <div className="flex items-center gap-2 mb-8">
              <MapPin className="w-4 h-4 text-amber-500" />
              <div className="flex gap-1">
                {cities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => setCurrentCity(city.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      currentCity === city.name
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              Need a ride in {currentCity}?
              <span className="block text-white/40 mt-2 text-3xl sm:text-4xl lg:text-5xl font-semibold">
                We will bring it to you.
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-white/50 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
              Buses, SUVs, and sedans for hire across Lagos, Abuja, and Port Harcourt. 
              We deliver to your hotel, office, or airport — no need to come to us.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
              <button
                onClick={scrollToFleet}
                className="bg-amber-500 text-slate-900 px-8 py-3.5 rounded-lg font-bold text-sm hover:bg-amber-400 transition-all duration-200 active:scale-[0.98]"
              >
                See what is available
              </button>
              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="text-white/40 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group"
                >
                  First time? Sign up takes 2 minutes
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <Link
                  to="/my-bookings"
                  className="text-white/40 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group"
                >
                  Check your upcoming trips
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {/* Quick info pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                <Phone className="w-3 h-3" /> 080-VIVA-LOGISTICS
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                <Clock className="w-3 h-3" /> Same-day delivery available
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                <Shield className="w-3 h-3" /> Insurance included
              </span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 pb-8 flex justify-center">
          <button
            onClick={scrollToFleet}
            className="flex flex-col items-center gap-2 text-white/20 hover:text-white/50 transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-20 px-6 md:px-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-slate-400 text-xs font-semibold tracking-[0.15em] uppercase mb-2">
              How this works
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Three steps. No office visit required.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                num: '1',
                title: 'Pick a vehicle online',
                desc: 'Browse by type, price, or location. Every car has real photos — the one you see is the one you get.',
                icon: Car,
              },
              {
                num: '2',
                title: 'Pay & confirm',
                desc: 'Card or bank transfer via Paystack. You get a booking code and driver contact within minutes.',
                icon: CreditCard,
              },
              {
                num: '3',
                title: 'We deliver to you',
                desc: 'Driver brings the car to your location. Show your ID, sign the checklist, and drive off.',
                icon: Calendar,
              },
            ].map((step, i) => (
              <div key={step.num} className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-sm">
                    {step.num}
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block w-px h-full bg-slate-200 mx-auto mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLEET SECTION */}
      <section ref={fleetRef} className="py-16 md:py-20 px-6 md:px-10 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <p className="text-slate-400 text-xs font-semibold tracking-[0.15em] uppercase mb-2">
                Available now in {currentCity}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Vehicles you can book today
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat === 'all' ? 'All types' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(filteredVehicles.length > 0 ? filteredVehicles : featured)
              .slice(0, 6)
              .map((vehicle) => (
                <Link
                  key={vehicle.id}
                  to={`/vehicles/${vehicle.id}`}
                  className="group block bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={
                        vehicle.images?.[0] ||
                        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'
                      }
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/95 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {vehicle.type}
                      </span>
                    </div>
                    {vehicle.isAvailable === false && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full">
                          Booked until {vehicle.nextAvailable || 'next week'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                          {vehicle.name}
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {vehicle.brand} {vehicle.model} · {vehicle.seats} seats
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900">{formatNaira(vehicle.pricePerDay)}</p>
                        <p className="text-[10px] text-slate-400">per day</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {vehicle.location || currentCity}
                      </span>
                      {vehicle.avgRating > 0 ? (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-slate-600 font-medium">{vehicle.avgRating}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">No reviews yet</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-amber-600 transition-colors"
            >
              See all vehicles in {currentCity}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-16 md:py-20 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-slate-400 text-xs font-semibold tracking-[0.15em] uppercase mb-2">
              Why people keep coming back
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              We are not a faceless app. We are a team in Lagos.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Insurance is included',
                desc: 'Every booking comes with comprehensive cover. If something happens, you are not paying out of pocket.',
              },
              {
                icon: Users,
                title: 'Real people, real support',
                desc: 'Call us and someone answers. WhatsApp us and we reply. No chatbots, no 48-hour email waits.',
              },
              {
                icon: Car,
                title: 'What you see is what you get',
                desc: 'The photos on the site are the actual vehicles. We do not use stock images or "representative" photos.',
              },
              {
                icon: AlertCircle,
                title: 'Cancel up to 24 hours before',
                desc: 'Plans change. Cancel or modify your booking for free up to a day before your pickup time.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center mb-4">
                  <item.icon className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 md:py-20 bg-slate-950 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-slate-500 text-xs font-semibold tracking-[0.15em] uppercase mb-2">
              What customers say
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Straight from the people who have used us.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Chinedu O.',
                location: 'Lekki, Lagos',
                text: 'Booked a Hiace for a family trip to Ibadan. Driver was on time, AC worked, and the bus was clean. Will use again.',
                rating: 5,
              },
              {
                name: 'Amina B.',
                location: 'Wuse, Abuja',
                text: 'Had to change my pickup location last minute. Called them and they sorted it in 10 minutes. That kind of service is rare.',
                rating: 5,
              },
              {
                name: 'Tunde A.',
                location: 'GRA, Port Harcourt',
                text: 'The Corolla I got looked exactly like the photo. Fuel tank was full, car was washed. Small things, but they matter.',
                rating: 4,
              },
            ].map((review, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-slate-900 border border-slate-800"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star 
                      key={j} 
                      className={`w-3 h-3 ${j < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} 
                    />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{review.name}</p>
                    <p className="text-slate-600 text-xs">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-6 md:px-10 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            {isAuthenticated
              ? `Need another ride, ${user?.fullName?.split(' ')[0]}?`
              : 'Book your first ride today'}
          </h2>
          <p className="text-slate-500 mb-8 text-base">
            {isAuthenticated
              ? 'Your account is ready. Browse available vehicles and book in minutes.'
              : 'No deposit required. Pay when you book, cancel for free up to 24 hours before.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to={isAuthenticated ? '/vehicles' : '/register'}
              className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-all duration-200"
            >
              {isAuthenticated ? 'Book a vehicle' : 'Create account'}
            </Link>
            <Link
              to="/vehicles"
              className="text-slate-600 hover:text-slate-900 px-8 py-3 text-sm font-medium transition-colors border border-slate-200 rounded-lg hover:border-slate-300"
            >
              Browse fleet first
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}