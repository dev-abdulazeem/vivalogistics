import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('idle'); // idle | verifying | success | error
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    // Extract token from URL
    let rawToken = searchParams.get('token');
    
    if (!rawToken) {
      const fullUrl = window.location.href;
      const match = fullUrl.match(/[?&]token=([^&]+)/);
      if (match) {
        rawToken = decodeURIComponent(match[1]);
      }
    }

    if (!rawToken) {
      setStatus('error');
      setMessage('No verification token found. Please check your email link.');
      return;
    }

    // Clean token
    rawToken = rawToken.trim().replace(/[.,;>)\s]+$/, '');
    setToken(rawToken);
    setStatus('idle'); // Wait for user to click button
  }, [searchParams]);

  const handleVerify = async () => {
    if (!token) return;
    
    setStatus('verifying');
    
    try {
      const res = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
      setStatus('success');
      setMessage(res.data.message);
      toast.success('Email verified!');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Verification failed.';
      setStatus('error');
      setMessage(errorMsg);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setIsResending(true);
    try {
      const res = await api.post('/auth/resend-verification', { email });
      toast.success(res.data.message);
      setStatus('idle');
      setMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-10 max-w-md w-full text-center shadow-sm">
        
        {status === 'idle' && token && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Verify your email</h2>
            <p className="text-slate-500 text-sm mb-8">
              Click the button below to confirm your email address.
            </p>
            <button
              onClick={handleVerify}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              Confirm Email Verification
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Verifying...</h2>
            <p className="text-slate-500 text-sm">Please wait while we confirm your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Email Verified!</h2>
            <p className="text-slate-500 text-sm mb-8">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            
            {(message.includes('Invalid') || message.includes('expired') || message.includes('No verification')) && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-amber-600 hover:text-amber-700 font-medium text-sm disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Back to Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 text-slate-600 font-medium hover:text-slate-900 transition-colors"
              >
                Create New Account
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}