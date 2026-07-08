import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatNaira } from '../../utils/formatCurrency';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [verifyModal, setVerifyModal] = useState(null);
  const [verifyNotes, setVerifyNotes] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // FIXED: Use correct endpoint /api/admin/bookings (not /bookings/admin/all)
      const res = await api.get('/admin/bookings?limit=100');
      setBookings(res.data.data || []);
    } catch (error) {
      console.error('Fetch bookings error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to load bookings');
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
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleVerifyReturn = async (id, verified) => {
    try {
      const res = await api.patch(`/admin/bookings/${id}/verify-return`, {
        verified,
        notes: verifyNotes,
      });
      toast.success(res.data.message);
      setVerifyModal(null);
      setVerifyNotes('');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleAutoComplete = async (id) => {
    if (!confirm('Auto-complete this booking? Extra charges may apply.')) return;
    try {
      const res = await api.patch(`/admin/bookings/${id}/auto-complete`);
      toast.success(res.data.message);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Auto-complete failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this booking?')) return;
    try {
      await api.delete(`/admin/bookings/${id}`);
      toast.success('Booking deleted');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const statusBadge = (status) => {
    const config = {
      PENDING: 'bg-amber-100 text-amber-700',
      CONFIRMED: 'bg-emerald-100 text-emerald-700',
      ACTIVE: 'bg-blue-100 text-blue-700',
      CLIENT_MARKED_COMPLETE: 'bg-purple-100 text-purple-700',
      PENDING_VERIFICATION: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-slate-100 text-slate-700',
      AUTO_COMPLETED: 'bg-slate-100 text-slate-600',
      CANCELLED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-slate-100 text-slate-600',
    };
    return config[status] || 'bg-slate-100 text-slate-700';
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const statusFilters = [
    'all', 'PENDING', 'CONFIRMED', 'ACTIVE', 
    'CLIENT_MARKED_COMPLETE', 'PENDING_VERIFICATION', 
    'COMPLETED', 'AUTO_COMPLETED', 'CANCELLED'
  ];

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
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
              filter === s
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {s === 'all' ? 'All' : s.replace(/_/g, ' ').toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 font-medium text-slate-500">Customer</th>
                <th className="px-4 py-3 font-medium text-slate-500">Vehicle</th>
                <th className="px-4 py-3 font-medium text-slate-500">Dates</th>
                <th className="px-4 py-3 font-medium text-slate-500">Amount</th>
                <th className="px-4 py-3 font-medium text-slate-500">Extra</th>
                <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{booking.user?.fullName}</p>
                    <p className="text-slate-500 text-xs">{booking.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{booking.vehicle?.name}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {format(new Date(booking.startDate), 'MMM d')} — {format(new Date(booking.endDate), 'MMM d')}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{formatNaira(booking.totalPrice)}</td>
                  <td className="px-4 py-3">
                    {Number(booking.extraCharges) > 0 ? (
                      <span className="text-red-600 font-medium text-xs">{formatNaira(booking.extraCharges)}</span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(booking.status)}`}>
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {booking.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateStatus(booking.id, 'CONFIRMED')}
                            className="text-xs font-medium text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors">
                            Confirm
                          </button>
                          <button onClick={() => updateStatus(booking.id, 'CANCELLED')}
                            className="text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors">
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button onClick={() => updateStatus(booking.id, 'ACTIVE')}
                          className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                          Mark Active
                        </button>
                      )}
                      {booking.status === 'ACTIVE' && (
                        <button onClick={() => updateStatus(booking.id, 'COMPLETED')}
                          className="text-xs font-medium text-slate-600 hover:bg-slate-100 px-2 py-1 rounded transition-colors">
                          Complete
                        </button>
                      )}
                      {booking.status === 'CLIENT_MARKED_COMPLETE' && (
                        <>
                          <button onClick={() => setVerifyModal(booking)}
                            className="text-xs font-medium text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verify
                          </button>
                          <button onClick={() => handleAutoComplete(booking.id)}
                            className="text-xs font-medium text-slate-600 hover:bg-slate-100 px-2 py-1 rounded transition-colors flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Auto
                          </button>
                        </>
                      )}
                      {booking.status === 'PENDING_VERIFICATION' && (
                        <button onClick={() => setVerifyModal(booking)}
                          className="text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors">
                          Review
                        </button>
                      )}
                      {booking.status === 'CANCELLED' && (
                        <button onClick={() => handleDelete(booking.id)}
                          className="text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors">
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
            No {filter !== 'all' ? filter.replace(/_/g, ' ').toLowerCase() : ''} bookings found
          </div>
        )}
      </div>

      {/* Verify Modal */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verify Vehicle Return</h3>
            <p className="text-slate-500 text-sm mb-4">
              Booking: {verifyModal.vehicle?.name} — {verifyModal.user?.fullName}
            </p>
            
            {Number(verifyModal.extraCharges) > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-red-700 text-sm font-medium">
                  Current extra charges: {formatNaira(verifyModal.extraCharges)} ({verifyModal.extraChargeDays} days)
                </p>
              </div>
            )}

            <textarea
              placeholder="Admin notes (optional)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-4 resize-none"
              rows={3}
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleVerifyReturn(verifyModal.id, true)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Verify Returned
              </button>
              <button
                onClick={() => handleVerifyReturn(verifyModal.id, false)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Not Returned
              </button>
            </div>
            <button
              onClick={() => { setVerifyModal(null); setVerifyNotes(''); }}
              className="w-full mt-2 text-slate-400 hover:text-slate-600 text-sm py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}