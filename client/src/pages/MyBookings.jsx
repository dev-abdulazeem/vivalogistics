import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatNaira } from '../utils/formatCurrency';
import { format } from 'date-fns';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed');
    }
  };

  const statusConfig = {
    CONFIRMED: { label: 'Confirmed', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    PENDING: { label: 'Pending', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
    ACTIVE: { label: 'Active', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
    CANCELLED: { label: 'Cancelled', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
    COMPLETED: { label: 'Completed', dot: 'bg-slate-500', bg: 'bg-slate-100', text: 'text-slate-700' },
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 mt-2">Manage your rentals and track upcoming trips.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
            <p className="text-slate-400 text-lg">You haven't made any bookings yet.</p>
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-2 mt-4 text-amber-600 font-semibold hover:text-amber-700"
            >
              Browse vehicles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const status = statusConfig[booking.status] || statusConfig.PENDING;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Vehicle Image */}
                      <div className="shrink-0">
                        <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-slate-100">
                          <img
                            src={booking.vehicle?.images?.[0] || '/placeholder.jpg'}
                            alt={booking.vehicle?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {booking.vehicle?.name}
                            </h3>
                            <p className="text-slate-500 text-sm mt-0.5">
                              {booking.vehicle?.brand} {booking.vehicle?.model}
                            </p>
                          </div>
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </div>
                        </div>

                        {/* Trip Info */}
                        <div className="flex flex-wrap gap-6 text-sm text-slate-500 mt-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>
                              {format(new Date(booking.startDate), 'MMM d')} — {format(new Date(booking.endDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{booking.pickupLocation || 'Lagos'}</span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 my-4" />

                        {/* Footer Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-2xl font-bold text-slate-900">
                              {formatNaira(booking.totalPrice)}
                            </p>
                            <p className="text-slate-400 text-sm">
                              {booking.totalDays} day{booking.totalDays !== 1 ? 's' : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <Link
                              to={`/vehicles/${booking.vehicleId}`}
                              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                            >
                              View Vehicle
                            </Link>

                            {booking.status === 'PENDING' && (
                              <>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() => handleCancel(booking.id)}
                                  className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {booking.status === 'CONFIRMED' && (
                              <>
                                <span className="text-slate-300">|</span>
                                <Link
                                  to={`/bookings/${booking.id}`}
                                  className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                                >
                                  View Details
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}