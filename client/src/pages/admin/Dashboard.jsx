import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatNaira } from '../../utils/formatCurrency';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Add cache-buster to prevent browser caching
      const res = await api.get('/admin/dashboard', {
        params: { _t: Date.now() }
      });
      
      console.log('Dashboard data:', res.data.data); // Debug log
      
      setStats(res.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount AND when component regains focus
  useEffect(() => {
    fetchStats();

    // Refresh when user comes back to this tab/page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Optional: auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Safely extract stats with defaults
  const totalUsers = stats?.stats?.totalUsers ?? 0;
  const totalVehicles = stats?.stats?.totalVehicles ?? 0;
  const totalBookings = stats?.stats?.totalBookings ?? 0;
  const totalRevenue = stats?.stats?.totalRevenue ?? 0;
  const recentBookings = stats?.recentBookings ?? [];

  const statCards = [
    { label: 'Total Users', value: totalUsers, href: '/admin/users' },
    { label: 'Total Vehicles', value: totalVehicles, href: '/admin/vehicles' },
    { label: 'Total Bookings', value: totalBookings, href: '/admin/bookings' },
    { label: 'Total Revenue', value: formatNaira(totalRevenue), href: '/admin/bookings' },
  ];

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

  return (
    <div>
      {/* Header with refresh */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchStats}
            disabled={loading}
            className="text-sm text-slate-600 hover:text-amber-600 font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.href}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors"
          >
            <p className="text-slate-500 text-sm font-medium">{card.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link
          to="/admin/vehicles"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors group"
        >
          <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Manage Vehicles</h3>
          <p className="text-slate-500 text-sm mt-1">{totalVehicles} vehicles in fleet</p>
        </Link>
        <Link
          to="/admin/bookings"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors group"
        >
          <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Manage Bookings</h3>
          <p className="text-slate-500 text-sm mt-1">{totalBookings} total bookings</p>
        </Link>
        <Link
          to="/admin/users"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors group"
        >
          <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Manage Users</h3>
          <p className="text-slate-500 text-sm mt-1">{totalUsers} registered users</p>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 font-medium text-slate-500">Customer</th>
                <th className="px-6 py-3 font-medium text-slate-500">Vehicle</th>
                <th className="px-6 py-3 font-medium text-slate-500">Amount</th>
                <th className="px-6 py-3 font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-medium text-slate-900">{booking.user?.fullName || 'Unknown'}</td>
                    <td className="px-6 py-3 text-slate-600">{booking.vehicle?.name || 'Unknown'}</td>
                    <td className="px-6 py-3 font-medium text-slate-900">{formatNaira(booking.totalPrice || 0)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}