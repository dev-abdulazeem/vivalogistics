import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatNaira } from '../../utils/formatCurrency';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  CheckCircle, XCircle, ShieldCheck, Zap, Phone, 
  ChevronDown, ChevronUp, Filter, Search, X,
  MoreVertical, PhoneCall, Mail
} from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [verifyModal, setVerifyModal] = useState(null);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
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
      PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
      CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      ACTIVE: 'bg-blue-100 text-blue-700 border-blue-200',
      CLIENT_MARKED_COMPLETE: 'bg-purple-100 text-purple-700 border-purple-200',
      PENDING_VERIFICATION: 'bg-red-100 text-red-700 border-red-200',
      COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
      AUTO_COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
      REFUNDED: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return config[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const statusFilters = [
    'all', 'PENDING', 'CONFIRMED', 'ACTIVE', 
    'CLIENT_MARKED_COMPLETE', 'PENDING_VERIFICATION', 
    'COMPLETED', 'AUTO_COMPLETED', 'CANCELLED'
  ];

  const filteredBookings = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.user?.fullName?.toLowerCase().includes(q) ||
        b.user?.email?.toLowerCase().includes(q) ||
        b.user?.phone?.includes(q) ||
        b.vehicle?.name?.toLowerCase().includes(q)
      );
    });

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Mobile Card Component
  const BookingCard = ({ booking }) => {
    const isExpanded = expandedRow === booking.id;
    
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-3 shadow-sm">
        {/* Card Header */}
        <div 
          className="p-4 cursor-pointer active:bg-slate-50 transition-colors"
          onClick={() => toggleExpand(booking.id)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge(booking.status)}`}>
                  {booking.status.replace(/_/g, ' ')}
                </span>
                {Number(booking.extraCharges) > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                    +Extra
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 mt-2 truncate">{booking.vehicle?.name}</h3>
              <p className="text-sm text-slate-500 truncate">{booking.user?.fullName}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="font-bold text-slate-900">{formatNaira(booking.totalPrice)}</p>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </div>
          </div>
          
          {/* Quick info row */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span>{format(new Date(booking.startDate), 'MMM d')} — {format(new Date(booking.endDate), 'MMM d')}</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-500" />
              {booking.user?.phone || 'No phone'}
            </span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {/* Customer Details */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">{booking.user?.fullName}</p>
                <a 
                  href={`mailto:${booking.user?.email}`}
                  className="text-sm text-slate-600 flex items-center gap-1.5 hover:text-amber-600 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {booking.user?.email}
                </a>
                {booking.user?.phone && (
                  <a 
                    href={`tel:${booking.user.phone}`}
                    className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium hover:text-emerald-700 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {booking.user.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Total Days</p>
                <p className="font-semibold text-slate-900">{booking.totalDays} days</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Extra Charges</p>
                <p className={`font-semibold ${Number(booking.extraCharges) > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {Number(booking.extraCharges) > 0 ? formatNaira(booking.extraCharges) : '—'}
                </p>
              </div>
            </div>

            {/* Pickup/Dropoff */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-1">
              <p className="text-xs text-slate-500">Pickup: <span className="text-slate-900 font-medium">{booking.pickupLocation}</span></p>
              {booking.dropoffLocation && booking.dropoffLocation !== booking.pickupLocation && (
                <p className="text-xs text-slate-500">Dropoff: <span className="text-slate-900 font-medium">{booking.dropoffLocation}</span></p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {booking.status === 'PENDING' && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'CONFIRMED'); }}
                    className="flex-1 min-w-[80px] bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Confirm
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'CANCELLED'); }}
                    className="flex-1 min-w-[80px] bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                </>
              )}
              {booking.status === 'CONFIRMED' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'ACTIVE'); }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Mark Active
                </button>
              )}
              {booking.status === 'ACTIVE' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'COMPLETED'); }}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Complete
                </button>
              )}
              {booking.status === 'CLIENT_MARKED_COMPLETE' && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setVerifyModal(booking); }}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Verify
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAutoComplete(booking.id); }}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" /> Auto
                  </button>
                </>
              )}
              {booking.status === 'PENDING_VERIFICATION' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setVerifyModal(booking); }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Review Return
                </button>
              )}
              {booking.status === 'CANCELLED' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(booking.id); }}
                  className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Delete Permanently
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Bookings</h1>
          <p className="text-slate-500 text-sm">{bookings.length} total</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle (Mobile) / Filter Pills (Desktop) */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 transition-colors w-full justify-center"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
              {filter === 'all' ? 'All' : filter.replace(/_/g, ' ')}
            </span>
          </button>
          
          {showFilters && (
            <div className="mt-2 flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2 duration-200">
              {statusFilters.map((s) => (
                <button
                  key={s}
                  onClick={() => { setFilter(s); setShowFilters(false); }}
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
          )}
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex flex-wrap gap-2">
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
      </div>

      {/* Mobile View - Cards */}
      <div className="lg:hidden space-y-3">
        {filteredBookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
        {filteredBookings.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
            <p className="text-sm">No bookings found</p>
            {searchQuery && <p className="text-xs mt-1">Try adjusting your search</p>}
          </div>
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                    {booking.user?.phone && (
                      <a 
                        href={`tel:${booking.user.phone}`}
                        className="text-emerald-600 text-xs flex items-center gap-1 mt-0.5 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {booking.user.phone}
                      </a>
                    )}
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
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(booking.status)}`}>
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-w-md w-full animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verify Vehicle Return</h3>
            <p className="text-slate-500 text-sm mb-1">
              Booking: {verifyModal.vehicle?.name} — {verifyModal.user?.fullName}
            </p>
            {verifyModal.user?.phone && (
              <a 
                href={`tel:${verifyModal.user.phone}`}
                className="text-emerald-600 text-sm flex items-center gap-1 mb-4 hover:underline"
              >
                <Phone className="w-4 h-4" />
                {verifyModal.user.phone}
              </a>
            )}
            
            {Number(verifyModal.extraCharges) > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-red-700 text-sm font-medium">
                  Current extra charges: {formatNaira(verifyModal.extraCharges)} ({verifyModal.extraChargeDays} days)
                </p>
              </div>
            )}

            <textarea
              placeholder="Admin notes (optional)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              rows={3}
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleVerifyReturn(verifyModal.id, true)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Verify Returned
              </button>
              <button
                onClick={() => handleVerifyReturn(verifyModal.id, false)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Not Returned
              </button>
            </div>
            <button
              onClick={() => { setVerifyModal(null); setVerifyNotes(''); }}
              className="w-full mt-3 text-slate-400 hover:text-slate-600 text-sm py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}