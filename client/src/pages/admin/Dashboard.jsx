import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatNaira } from '../../utils/formatCurrency';
import { 
  TrendingUp, Users, Car, Calendar, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, Wallet, Activity 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard', { params: { _t: Date.now() } });
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const s = stats?.stats || {};
  const recent = stats?.recentBookings || [];
  const statusCounts = stats?.statusCounts || {};

  const statCards = [
    { 
      label: 'Total Revenue', 
      value: formatNaira(s.totalRevenue || 0), 
      sub: `+${formatNaira(s.monthlyRevenue || 0)} this month`,
      href: '/admin/bookings',
      icon: Wallet,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      trend: 'up'
    },
    { 
      label: 'Total Bookings', 
      value: s.totalBookings || 0, 
      sub: `${s.pendingBookings || 0} pending · ${s.activeBookings || 0} active`,
      href: '/admin/bookings',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      trend: 'neutral'
    },
    { 
      label: 'Registered Users', 
      value: s.totalUsers || 0, 
      sub: 'All time',
      href: '/admin/users',
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      trend: 'neutral'
    },
    { 
      label: 'Fleet Size', 
      value: s.totalVehicles || 0, 
      sub: 'Active vehicles',
      href: '/admin/vehicles',
      icon: Car,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      trend: 'neutral'
    },
  ];

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
    };
    return config[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of your rental business</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-all disabled:opacity-50"
        >
          <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Attention Banner */}
      {(s.needsAttention || 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-red-800 font-semibold text-sm">
              {s.needsAttention} booking{s.needsAttention !== 1 ? 's' : ''} need attention
            </p>
            <p className="text-red-600 text-xs">
              Clients marked vehicles as returned — verify them to avoid auto-completion fees.
            </p>
          </div>
          <Link
            to="/admin/bookings"
            className="ml-auto px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.href}
              className={`group bg-white rounded-xl border ${card.border} p-5 hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                {card.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
              </div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
              <p className="text-slate-400 text-xs mt-1">{card.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Recent Bookings</h2>
              <p className="text-slate-400 text-xs mt-0.5">Latest customer activity</p>
            </div>
            <Link 
              to="/admin/bookings" 
              className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="divide-y divide-slate-50">
            {recent.length > 0 ? recent.map((booking) => (
              <div key={booking.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  <img 
                    src={booking.vehicle?.images?.[0] || '/placeholder.jpg'} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {booking.user?.fullName || 'Unknown'}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(booking.status)}`}>
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {booking.vehicle?.name || 'Unknown vehicle'} · {formatNaira(booking.totalPrice || 0)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400">
                    {new Date(booking.createdAt).toLocaleDateString('en-NG', { 
                      month: 'short', day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            )) : (
              <div className="px-6 py-12 text-center text-slate-400 text-sm">No bookings yet</div>
            )}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Booking Status</h2>
            <p className="text-slate-400 text-xs mt-0.5">Current distribution</p>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${statusBadge(status).split(' ')[0].replace('bg-', 'bg-').replace('100', '500')}`} />
                <span className="text-sm text-slate-600 flex-1">{status.replace(/_/g, ' ')}</span>
                <span className="text-sm font-bold text-slate-900">{count}</span>
              </div>
            ))}
            {Object.keys(statusCounts).length === 0 && (
              <p className="text-center text-slate-400 text-sm py-4">No data</p>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-2">
              <Link 
                to="/admin/vehicles" 
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-amber-300 transition-colors"
              >
                <Car className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-700">Manage Fleet</span>
              </Link>
              <Link 
                to="/admin/users" 
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-amber-300 transition-colors"
              >
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700">Manage Users</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}