import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { formatNaira } from "../utils/formatCurrency";
import { useAuthStore } from "../store/authStore";
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
  ChevronRight,
  Search,
  Check,
  Mail,
  MessageCircle,
  ChevronUp,
  Fuel,
  Wind,
  Plus,
} from "lucide-react";

// Import your own navbar and footer here
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();
  const [featured, setFeatured] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentCity, setCurrentCity] = useState("Lagos");
  const [openFaq, setOpenFaq] = useState(null);
  const fleetRef = useRef(null);
  const heroRef = useRef(null);

  const PHONE_NUMBER = "07054770904";
  const WHATSAPP_NUMBER = "2347054770904"; // WhatsApp needs country code without + or 0

  const categories = ["all", "sedan", "suv", "bus", "van"];

  const cities = [
    { name: "Lagos", tagline: "Mainland & Island coverage" },
    { name: "Abuja", tagline: "Airport & city center" },
    { name: "Port Harcourt", tagline: "Trans Amadi to GRA" },
  ];

  const faqs = [
    { q: "How do I rent a car?", a: "Browse our fleet, select your dates, and complete payment online. We'll deliver the car to your location." },
    { q: "What documents do I need?", a: "A valid driver license and a government-issued ID. International drivers must provide a passport." },
    { q: "Can I cancel my booking?", a: "Yes, cancellations are free up to 24 hours before your pickup time for a full refund." },
    { q: "Do you offer airport pickup?", a: "Absolutely. We deliver to all major airports in Lagos, Abuja, and Port Harcourt." },
    { q: "Is insurance included?", a: "Yes, comprehensive insurance is included in every rental at no extra cost." },
    { q: "What payment methods do you accept?", a: "We accept card payments, bank transfers, and mobile money via Paystack." },
  ];

  useEffect(() => {
    fetchFeatured();
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await api.get("/vehicles?limit=4");
      setFeatured(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch featured vehicles:", error);
    }
  };

  const filteredVehicles =
    activeCategory === "all"
      ? featured
      : featured.filter((v) =>
          (v.type || "").toLowerCase().includes(activeCategory.toLowerCase())
        );

  const scrollToFleet = () => {
    fleetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCall = () => {
    window.location.href = `tel:${PHONE_NUMBER}`;
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi Viva Rental! I would like to make an enquiry about car rentals.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">

      {/* Your old navbar goes here */}
      {/* <Navbar /> */}

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1920&q=80"
            alt="Premium SUV on city road"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920&q=80"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-5">
                Drive<br />Without Limits
              </h1>
              <p className="text-white/70 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
                Find the perfect car for every journey.
              </p>
              <div className="space-y-3 mb-8">
                {["Economy", "SUVs", "Luxury", "Electric"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={scrollToFleet} className="bg-amber-500 text-slate-900 px-8 py-3.5 rounded-lg font-bold text-sm hover:bg-amber-400 transition-all duration-200 active:scale-[0.98] flex items-center gap-2">
                Find a Car <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md ml-auto w-full">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Book Your Ride</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none">
                      <option>Lagos, Nigeria</option>
                      <option>Abuja, Nigeria</option>
                      <option>Port Harcourt, Nigeria</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Pickup Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" defaultValue="24 May 2024" className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Pickup Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" defaultValue="09:00" className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Return Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" defaultValue="27 May 2024" className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Return Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" defaultValue="09:00" className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Car Type</label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none">
                      <option>Any</option>
                      <option>Economy</option>
                      <option>SUV</option>
                      <option>Luxury</option>
                      <option>Electric</option>
                    </select>
                  </div>
                </div>
                <button className="w-full bg-amber-500 text-slate-900 py-3.5 rounded-lg font-bold text-sm hover:bg-amber-400 transition-all duration-200 active:scale-[0.98]">
                  Search Cars
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16 md:py-20 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Featured Cars</h2>
            <Link to="/vehicles" className="text-amber-500 text-sm font-semibold hover:text-amber-600 transition-colors flex items-center gap-1">
              View All Cars <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(filteredVehicles.length > 0 ? filteredVehicles : [
              { id: 1, name: "Toyota Corolla 2024", brand: "Toyota", model: "Corolla", type: "Economy", seats: 5, fuelType: "Petrol", pricePerDay: 42000, images: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600"], location: "Lagos", avgRating: 4.8, transmission: "Automatic" },
              { id: 2, name: "Toyota Land Cruiser Prado", brand: "Toyota", model: "Prado", type: "SUV", seats: 7, fuelType: "Diesel", pricePerDay: 120000, images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600"], location: "Lagos", avgRating: 4.9, transmission: "Automatic" },
              { id: 3, name: "Mercedes-Benz C-Class 2024", brand: "Mercedes", model: "C-Class", type: "Luxury", seats: 5, fuelType: "Petrol", pricePerDay: 110000, images: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600"], location: "Lagos", avgRating: 4.7, transmission: "Automatic" },
              { id: 4, name: "Tesla Model 3 2024", brand: "Tesla", model: "Model 3", type: "Electric", seats: 5, fuelType: "Electric", pricePerDay: 105000, images: ["https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600"], location: "Lagos", avgRating: 4.9, transmission: "Automatic" },
            ]).map((vehicle) => (
              <div key={vehicle.id} className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img src={vehicle.images?.[0] || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600"} alt={vehicle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{vehicle.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {vehicle.transmission || "Automatic"}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {vehicle.seats} Seats</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> {vehicle.fuelType}</span>
                    <span className="flex items-center gap-1"><Wind className="w-3 h-3" /> Air Conditioning</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-lg font-bold text-slate-900">{formatNaira(vehicle.pricePerDay)}</span>
                      <span className="text-xs text-slate-400">/day</span>
                    </div>
                    <Link to={`/vehicles/${vehicle.id}`} className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors">
                      Rent Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-20 px-6 md:px-10 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80" alt="Customer service" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-8">Why Choose Viva Rental?</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { icon: CheckCircle2, title: "Affordable Pricing" },
                  { icon: Headphones, title: "Roadside Assistance" },
                  { icon: Shield, title: "No Hidden Fees" },
                  { icon: Calendar, title: "Flexible Booking" },
                  { icon: CheckCircle2, title: "Fully Insured Vehicles" },
                  { icon: Clock, title: "Instant Confirmation" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">How It Works</h2>
            <p className="text-slate-500 text-sm">Simple steps to get you on the road</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-amber-300"></div>
            {[
              { num: "1", title: "Choose a Car", desc: "Select from a wide range of vehicles", icon: Car },
              { num: "2", title: "Book Online", desc: "Pick your dates and complete booking", icon: Calendar },
              { num: "3", title: "Pick Up", desc: "Pick up your car at your convenience", icon: MapPin },
              { num: "4", title: "Drive Away", desc: "Enjoy your journey with peace of mind", icon: CheckCircle2 },
            ].map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-xl font-bold mb-4 relative z-10 shadow-lg shadow-amber-200">
                  {step.num}
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                  <step.icon className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-xs text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 md:py-20 px-6 md:px-10 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-10">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Economy", img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400" },
              { name: "SUV", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400" },
              { name: "Luxury", img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400" },
              { name: "Electric", img: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400" },
              { name: "Sports", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400" },
              { name: "Family Vans", img: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400" },
            ].map((cat) => (
              <Link key={cat.name} to={`/vehicles?category=${cat.name.toLowerCase()}`} className="group relative aspect-square rounded-xl overflow-hidden">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4">
                  <span className="text-white text-sm font-bold">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Weekend Deal Banner */}
      <section className="py-16 md:py-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900">
            <div className="absolute inset-0">
              <img src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80" alt="Luxury car" className="w-full h-full object-cover opacity-40" />
            </div>
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 block">Special Offer</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Weekend Deal</h2>
                <p className="text-white/80 text-lg">Get <span className="text-amber-400 font-bold">20% OFF</span> Luxury Cars</p>
              </div>
              <Link to="/vehicles?category=luxury" className="bg-amber-500 text-slate-900 px-8 py-3 rounded-lg font-bold text-sm hover:bg-amber-400 transition-all whitespace-nowrap">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-10">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah J.", text: "The booking process was incredibly easy, and the car was spotless. Highly recommend Viva Rental!", rating: 5, avatar: "SJ" },
              { name: "David M.", text: "Affordable prices and excellent customer service. Will definitely rent again!", rating: 5, avatar: "DM" },
              { name: "Michael O.", text: "I have used Viva Rental several times and they never disappoint.", rating: 5, avatar: "MO" },
            ].map((review, i) => (
              <div key={i} className="p-6 rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-4 h-4 ${j < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                    {review.avatar}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">— {review.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download */}
      <section className="py-16 md:py-20 px-6 md:px-10 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Download the<br />Viva Rental App</h2>
              <div className="space-y-3 mb-8">
                {["Book your ride", "Manage your bookings", "Track your rentals", "Get exclusive discounts"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="bg-slate-900 text-white px-5 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                  <span>Google Play</span>
                </button>
                <button className="bg-slate-900 text-white px-5 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <span>App Store</span>
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <img src="appicon.png" alt="App preview" className="w-64 h-auto rounded-3xl shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 px-6 md:px-10 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-semibold text-slate-900">{faq.q}</span>
                  {openFaq === i ? <X className="w-4 h-4 text-slate-400" /> : <Plus className="w-4 h-4 text-amber-500" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your old footer goes here */}
      {/* <Footer /> */}

      {/* Chat & Call Floating Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <button 
          onClick={handleWhatsApp}
          className="w-12 h-12 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center shadow-lg hover:bg-amber-400 transition-colors"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        <button 
          onClick={handleCall}
          className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
          title="Call Us"
        >
          <Phone className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}