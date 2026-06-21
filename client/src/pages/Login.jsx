import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Send } from 'lucide-react';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNeedsVerification(false);
    
    const result = await login(form);
    
    if (result.success) {
      toast.success('Welcome back!');
      const { user } = useAuthStore.getState();
      
      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      }
    } else {
      // Check if login failed because email is not verified
      if (result.needsVerification) {
        setNeedsVerification(true);
        setResendEmail(form.email);
        toast.error('Please verify your email first');
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) return;
    
    setIsResending(true);
    try {
      const res = await api.post('/auth/resend-verification', { email: resendEmail });
      toast.success(res.data.message);
      setNeedsVerification(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200"
          alt="Road trip"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <span className="text-lg font-extrabold tracking-tight">VIVA</span>
            <span className="text-[9px] font-semibold tracking-[0.3em] text-amber-500 uppercase block">Logistic</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">Welcome back</h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Sign in to manage your bookings, update your profile, and access exclusive deals.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <span className="text-lg font-extrabold tracking-tight">VIVA</span>
            <span className="text-[9px] font-semibold tracking-[0.3em] text-amber-500 uppercase block">Logistic</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
          <p className="text-slate-500 mb-8">Enter your details to continue</p>

          {/* Verification Banner */}
          {needsVerification && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800 mb-3">
                Your email is not verified. Please check your inbox or resend the verification email.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800 disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-amber-700/30 border-t-amber-700 rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Resend verification email
                  </>
                )}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    setResendEmail(e.target.value);
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors placeholder:text-slate-400"
                  placeholder="••••••••"
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 w-4 h-4 text-amber-500 focus:ring-amber-500" />
                <span className="text-slate-500">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-amber-600 hover:text-amber-700 font-medium">
                Forgot password?
              </Link>
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
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-600 hover:text-amber-700 font-semibold">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}