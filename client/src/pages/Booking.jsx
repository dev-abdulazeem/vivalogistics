import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { formatNaira } from '../utils/formatCurrency';
import toast from 'react-hot-toast';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function Booking() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    dropoffLocation: '',
    driverRequired: false,
    specialRequests: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to book a vehicle');
      navigate('/login');
      return;
    }
    fetchVehicle();
  }, [vehicleId, isAuthenticated, navigate]);

  const fetchVehicle = async () => {
    try {
      const res = await api.get(`/vehicles/${vehicleId}`);
      setVehicle(res.data.data);
      setForm(prev => ({ ...prev, pickupLocation: res.data.data.location || '' }));
    } catch (error) {
      toast.error('Failed to load vehicle');
    } finally {
      setLoading(false);
    }
  };

  const calculateBreakdown = () => {
    if (!form.startDate || !form.endDate || !vehicle) return null;

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const days = differenceInDays(end, start) + 1;

    if (days <= 0) return null;

    const rentalCost = days * Number(vehicle.pricePerDay);
    const driverCost = form.driverRequired ? days * 5000 : 0;
    const total = rentalCost + driverCost;

    return { days, rentalCost, driverCost, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const breakdown = calculateBreakdown();
    if (!breakdown || breakdown.days <= 0) {
      toast.error('Please select valid dates');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/bookings', {
        ...form,
        vehicleId,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });

      const { paymentUrl } = res.data.data;

      // Redirect to Paystack instead of popup
      window.location.href = paymentUrl;

    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Vehicle not found</p>
          <Link to="/vehicles" className="text-amber-600 font-medium mt-4 inline-block hover:text-amber-700">
            Browse vehicles
          </Link>
        </div>
      </div>
    );
  }

  const breakdown = calculateBreakdown();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6">
          <Link
            to={`/vehicles/${vehicleId}`}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to vehicle
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Complete Your Booking</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              {/* Dates */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Pickup Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Return Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      min={form.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Where should we deliver the vehicle?"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors placeholder:text-slate-400"
                    value={form.pickupLocation}
                    onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Drop-off Location <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Same as pickup if left empty"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors placeholder:text-slate-400"
                    value={form.dropoffLocation}
                    onChange={(e) => setForm({ ...form, dropoffLocation: e.target.value })}
                  />
                </div>
              </div>

              {/* Driver checkbox */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="driver"
                  className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 mt-0.5"
                  checked={form.driverRequired}
                  onChange={(e) => setForm({ ...form, driverRequired: e.target.checked })}
                />
                <div>
                  <label htmlFor="driver" className="font-semibold text-slate-900 text-sm">
                    I need a professional driver
                  </label>
                  <p className="text-slate-500 text-sm mt-1">
                    + {formatNaira(5000)} per day. Licensed, experienced chauffeur included.
                  </p>
                </div>
              </div>

              {/* Special requests */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Special Requests <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Child seat, specific pickup time, etc."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-none placeholder:text-slate-400"
                  value={form.specialRequests}
                  onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !breakdown}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-300 disabled:cursor-not-allowed text-slate-950 py-4 rounded-xl font-bold transition-colors"
              >
                {submitting ? 'Redirecting to payment...' : 'Proceed to Payment'}
              </button>

              <p className="text-center text-xs text-slate-400">
                You will be redirected to Paystack to complete your payment securely.
              </p>
            </form>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-24">
              {/* Vehicle Preview */}
              <div className="h-40 overflow-hidden">
                <img
                  src={vehicle.images?.[0] || '/placeholder.jpg'}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                <h3 className="font-bold text-lg text-slate-900">{vehicle.name}</h3>
                <p className="text-slate-500 text-sm">
                  {vehicle.brand} {vehicle.model} · {vehicle.seats} seats
                </p>

                <div className="border-t border-slate-100 my-5" />

                {breakdown ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>{breakdown.days} day{breakdown.days !== 1 ? 's' : ''} rental</span>
                      <span className="font-medium">{formatNaira(breakdown.rentalCost)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{formatNaira(vehicle.pricePerDay)} / day</span>
                    </div>

                    {form.driverRequired && (
                      <div className="flex justify-between text-slate-600">
                        <span>Driver fee ({breakdown.days} day{breakdown.days !== 1 ? 's' : ''})</span>
                        <span className="font-medium">{formatNaira(breakdown.driverCost)}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-100 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-base">Total</span>
                        <span className="font-bold text-2xl text-slate-900">{formatNaira(breakdown.total)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">
                    Select dates to see pricing
                  </p>
                )}

                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <span className="font-semibold text-slate-700">Free cancellation</span> up to 24 hours before pickup. Full refund guaranteed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}