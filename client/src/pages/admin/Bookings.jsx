import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatNaira } from '../../utils/formatCurrency';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings?limit=100');
      setBookings(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status });
      toast.success(`Booking ${status.toLowerCase()}`);
      fetchBookings();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this booking? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/bookings/${id}`);
      toast.success('Booking deleted');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const statusBadge = (status) => {
    const config = {
      CONFIRMED: 'bg-emerald-100 text-emerald-700',
      PENDING: 'bg-amber-100 text-amber-700',
      ACTIVE: 'bg-blue-100 text-blue-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-slate-100 text-slate-700',
    };
    return config[status] || 'bg-slate-100 text-slate-700';
  };

  const statusFilters = ['all', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Manage Bookings</h1>
        <p className="text-slate-500 text-sm">{bookings.length} total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              filter === s
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {s === 'all' ? 'All' : s.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 font-medium text-slate-500">Customer</th>
                <th className="px-6 py-3 font-medium text-slate-500">Vehicle</th>
                <th className="px-6 py-3 font-medium text-slate-500">Dates</th>
                <th className="px-6 py-3 font-medium text-slate-500">Amount</th>
                <th className="px-6 py-3 font-medium text-slate-500">Status</th>
                <th className="px-6 py-3 font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{booking.user?.fullName}</p>
                    <p className="text-slate-500 text-xs">{booking.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{booking.vehicle?.name}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {format(new Date(booking.startDate), 'MMM d')} — {format(new Date(booking.endDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{formatNaira(booking.totalPrice)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {booking.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateStatus(booking.id, 'CONFIRMED')}
                            className="text-xs font-medium text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, 'CANCELLED')}
                            className="text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateStatus(booking.id, 'ACTIVE')}
                          className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                        >
                          Mark Active
                        </button>
                      )}
                      {booking.status === 'ACTIVE' && (
                        <button
                          onClick={() => updateStatus(booking.id, 'COMPLETED')}
                          className="text-xs font-medium text-slate-600 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {/* DELETE button for cancelled bookings */}
                      {booking.status === 'CANCELLED' && (
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No {filter !== 'all' ? filter.toLowerCase() : ''} bookings found
          </div>
        )}
      </div>
    </div>
  );
}