import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { formatNaira } from '../utils/formatCurrency';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  ShieldCheck,
  Copy,
  ArrowRight,
  Loader2,
  AlertCircle,
  User,
  Clock,
  Car,
} from 'lucide-react';

export default function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    if (!reference) {
      setError('No payment reference found.');
      setVerifying(false);
      return;
    }
    verifyPayment();
  }, [reference]);

  const verifyPayment = async () => {
    try {
      const res = await api.post('/bookings/verify-payment', { reference });
      
      if (res.data.success) {
        setBooking(res.data.data);
        toast.success('Payment successful! Your booking is confirmed.');
      } else {
        setError('Payment verification failed.');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      
      // Fallback: try to find booking by reference
      try {
        const bookingRes = await api.get('/bookings/my');
        const found = bookingRes.data.data.find(
          (b) => b.paymentReference === reference || b.payment?.paystackReference === reference
        );
        
        if (found) {
          setBooking(found);
        } else {
          setError('Could not verify payment. Please check your bookings.');
        }
      } catch {
        setError('Payment verification failed. Please contact support.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const copyReference = () => {
    navigator.clipboard.writeText(reference);
    toast.success('Reference copied!');
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Verifying your payment...</h2>
          <p className="text-slate-500 mt-2">Please do not close this page.</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Payment Issue</h2>
          <p className="text-slate-500 mt-2 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <Link
              to="/my-bookings"
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors"
            >
              View My Bookings
            </Link>
            <Link to="/" className="text-slate-500 hover:text-slate-900 text-sm font-medium">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const vehicle = booking.vehicle;
  const isDriverRequested = booking.driverRequired;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Booking Confirmed!</h1>
          <p className="text-slate-500 mt-2">
            Your payment was successful. Here are your booking details.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
          {/* Vehicle Image */}
          <div className="h-56 bg-slate-100 relative">
            <img
              src={vehicle?.images?.[0] || '/placeholder.jpg'}
              alt={vehicle?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {booking.status}
              </span>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900">{vehicle?.name}</h2>
            <p className="text-slate-500 text-sm">
              {vehicle?.brand} {vehicle?.model} · {vehicle?.seats} seats · {vehicle?.transmission}
            </p>

            {/* Booking Reference */}
            <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Booking Reference</p>
                  <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{reference}</p>
                </div>
                <button
                  onClick={copyReference}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Copy reference"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Rental Period</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {format(new Date(booking.startDate), 'EEEE, MMM d')} — {format(new Date(booking.endDate), 'EEEE, MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-slate-400">{booking.totalDays} day{booking.totalDays !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Pickup Location</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.pickupLocation}</p>
                </div>
              </div>

              {booking.dropoffLocation && booking.dropoffLocation !== booking.pickupLocation && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Drop-off Location</p>
                    <p className="text-sm font-semibold text-slate-900">{booking.dropoffLocation}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Amount Paid</p>
                  <p className="text-sm font-bold text-slate-900">{formatNaira(booking.totalPrice)}</p>
                </div>
              </div>

              {/* DRIVER PHONE — ONLY SHOWS IF DRIVER REQUESTED */}
              {isDriverRequested && vehicle?.driverPhone && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider">Driver Contact</p>
                    <p className="text-lg font-bold text-indigo-900">{vehicle.driverPhone}</p>
                    <p className="text-xs text-indigo-400">Call or WhatsApp before pickup</p>
                  </div>
                  <a
                    href={`tel:${vehicle.driverPhone}`}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Call
                  </a>
                </div>
              )}

              {isDriverRequested && !vehicle?.driverPhone && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium">Driver Contact</p>
                    <p className="text-sm font-semibold text-amber-900">Driver will be assigned shortly</p>
                    <p className="text-xs text-amber-500">You will receive contact details before pickup</p>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-5" />

            {/* What's Next */}
            <div>
              <h3 className="font-bold text-slate-900 mb-3">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Confirmation email sent</p>
                    <p className="text-xs text-slate-500">Check your inbox for booking details and receipt.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {isDriverRequested ? 'Your driver will call you' : 'Delivery agent will call you'}
                    </p>
                    <p className="text-xs text-slate-500">30 minutes before pickup time.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Pickup & drive</p>
                    <p className="text-xs text-slate-500">Show your ID and booking reference. Sign the checklist and you are on the road.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 font-medium uppercase tracking-wider mb-1">Special Requests</p>
                <p className="text-sm text-amber-900">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Need help?</h3>
              <p className="text-slate-500 text-sm mt-1">Call or WhatsApp us if you have questions.</p>
              <p className="text-slate-900 font-semibold text-sm mt-2">0803-XXX-XXXX</p>
              <p className="text-slate-400 text-xs">Mon–Sat, 8am–8pm</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/my-bookings"
            className="flex-1 bg-slate-900 text-white text-center py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            View All My Bookings <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/vehicles"
            className="flex-1 text-center py-3.5 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
          >
            Browse More Vehicles
          </Link>
        </div>
      </div>
    </div>
  );
}