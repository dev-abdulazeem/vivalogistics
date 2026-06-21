import { Link } from 'react-router-dom';
import {
  Shield,
  Clock,
  Headphones,
  MapPin,
  Users,
  TrendingUp,
  Award,
  ArrowRight,
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      
      {/* ─── Hero ─── */}
      <section className="relative py-32 md:py-40 px-5 md:px-10 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=85"
            alt="Viva fleet"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <p className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              About Viva
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.95] tracking-tight mb-6">
              Moving Nigeria<br />
              <span className="text-amber-400">forward.</span>
            </h1>
            <p className="text-white/50 text-lg md:text-xl max-w-lg leading-relaxed font-light">
              Since 2019, we've been the trusted choice for premium vehicle rentals across Lagos, Abuja, and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Our Story ─── */}
      <section className="py-24 md:py-32 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Our story</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
                Built from a simple idea.
              </h2>
              <div className="space-y-4 text-slate-500 leading-relaxed">
                <p>
                  Viva Logistics started with one bus and a belief: that renting a vehicle in Nigeria shouldn't feel like a gamble. No more mismatched photos. No more hidden charges. No more showing up to a dirty car.
                </p>
                <p>
                  Today, we operate a fleet of over 500 vehicles — from executive sedans and luxury SUVs to 50-seater coaches and compact vans. Every vehicle is owned, maintained, and insured by us. No middlemen.
                </p>
                <p>
                  Whether you're planning a corporate retreat, a wedding convoy, or just need a reliable ride for the week, we handle the logistics so you don't have to.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80"
                  alt="Our office"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 md:-left-10 bg-amber-500 rounded-2xl p-6 md:p-8 shadow-xl">
                <p className="text-4xl md:text-5xl font-bold text-slate-900">7+</p>
                <p className="text-slate-900/70 text-sm font-medium mt-1">Years of service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-20 md:py-24 bg-slate-950 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { num: '500+', label: 'Vehicles Owned' },
              { num: '50K+', label: 'Trips Completed' },
              { num: '4.9', label: 'Customer Rating' },
              { num: '2', label: 'Cities Served' },
            ].map((stat, i) => (
              <div key={stat.label} className={`text-center ${i !== 3 ? 'md:border-r md:border-slate-800' : ''}`}>
                <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">{stat.num}</p>
                <p className="text-slate-500 text-sm mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What We Offer ─── */}
      <section className="py-24 md:py-32 px-5 md:px-10 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-3">What we offer</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Every ride, elevated.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Fully Insured Fleet',
                desc: 'Every vehicle in our fleet carries comprehensive insurance. You drive with peace of mind, always.',
              },
              {
                icon: Clock,
                title: 'Flexible Scheduling',
                desc: 'Book by the hour, day, or month. Modify or cancel up to 24 hours before pickup at no charge.',
              },
              {
                icon: Headphones,
                title: '24/7 Human Support',
                desc: 'Our support team is available round the clock. Real people, real solutions, zero bots.',
              },
              {
                icon: MapPin,
                title: 'Lagos & Abuja',
                desc: 'We operate across Nigeria\'s two busiest cities with dedicated pickup and drop-off points.',
              },
              {
                icon: Users,
                title: 'Professional Drivers',
                desc: 'Licensed, vetted chauffeurs available on request. Sit back and enjoy the ride.',
              },
              {
                icon: TrendingUp,
                title: 'Corporate Packages',
                desc: 'Special rates for businesses, events, and long-term contracts. We scale with you.',
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

      {/* ─── Fleet Showcase ─── */}
      <section className="py-24 md:py-32 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="md:flex md:items-end md:justify-between mb-12 md:mb-16">
            <div>
              <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Our fleet</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Built for every need</h2>
            </div>
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-2 mt-4 md:mt-0 text-sm font-semibold text-slate-900 hover:text-amber-600 transition-colors"
            >
              Browse all vehicles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Executive Sedans',
                count: '120+ vehicles',
                image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80',
                desc: 'Toyota Camry, Honda Accord, Lexus ES — perfect for business travel and airport runs.',
              },
              {
                title: 'Premium SUVs',
                count: '80+ vehicles',
                image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80',
                desc: 'Lexus GX, Toyota Land Cruiser, Range Rover — comfort and presence for any occasion.',
              },
              {
                title: 'Luxury Coaches',
                count: '60+ vehicles',
                image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80',
                desc: '30 to 50-seater buses with AC, reclining seats, and onboard entertainment.',
              },
            ].map((fleet) => (
              <div
                key={fleet.title}
                className="group rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={fleet.image}
                    alt={fleet.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{fleet.title}</h3>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                      {fleet.count}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{fleet.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Values ─── */}
      <section className="py-24 md:py-32 px-5 md:px-10 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80"
                    alt="On the road"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mt-8">
                  <img
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80"
                    alt="Travel"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Our values</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
                We don't cut corners.
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: 'Transparency First',
                    desc: 'What you see is what you pay. No surprise charges, no last-minute fees.',
                  },
                  {
                    title: 'Reliability Above All',
                    desc: 'Every vehicle is inspected before every trip. Breakdowns are rare because we prevent them.',
                  },
                  {
                    title: 'Customer Obsession',
                    desc: 'We measure success by how many customers come back. And most of them do.',
                  },
                ].map((value) => (
                  <div key={value.title} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center mt-0.5">
                      <Award className="w-4 h-4 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{value.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{value.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 md:py-32 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
                alt="Road ahead"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/80" />
            </div>
            <div className="relative z-10 py-20 md:py-28 px-8 md:px-16 text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
                Ready to ride?
              </h2>
              <p className="text-slate-400 mb-10 max-w-lg mx-auto text-base md:text-lg leading-relaxed">
                Join thousands of Nigerians who trust Viva for their transportation needs. Your next vehicle is waiting.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/vehicles"
                  className="bg-white text-slate-900 px-8 py-4 rounded-full font-semibold text-sm hover:bg-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-white/10"
                >
                  Browse our fleet
                </Link>
                <Link
                  to="/register"
                  className="text-white/70 hover:text-white px-8 py-4 text-sm font-medium transition-colors border border-white/20 rounded-full hover:bg-white/5"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}