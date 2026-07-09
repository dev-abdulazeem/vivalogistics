import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.success) {
      toast.success('Account created! Please check your email to verify.');
      // Redirect to a "check your email" page, not dashboard
      navigate('/verify-pending', { state: { email: form.email } });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200"
          alt="Road trip"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <span className="text-lg font-extrabold tracking-tight">VIVA</span>
            <span className="text-[9px] font-semibold tracking-[0.3em] text-amber-500 uppercase block">Logistic</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">Start your journey</h2>
          <p className="text-white/60 text-lg leading-relaxed mb-8">
            Join thousands of Nigerians who trust Viva Logistic for their transportation needs.
          </p>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Instant booking confirmation
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Exclusive member discounts
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              24/7 priority support
            </li>
          </ul>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <span className="text-lg font-extrabold tracking-tight">VIVA</span>
            <span className="text-[9px] font-semibold tracking-[0.3em] text-amber-500 uppercase block">Logistic</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-500 mb-8">Fill in your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors placeholder:text-slate-400"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors placeholder:text-slate-400"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  minLength={10}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors placeholder:text-slate-400"
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Required for booking confirmations and admin contact</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors placeholder:text-slate-400"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-300 text-slate-950 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}