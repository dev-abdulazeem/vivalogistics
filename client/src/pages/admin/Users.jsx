import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Search, X, Phone, Mail, UserCheck, UserX, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/users/${id}`, { isActive: !currentStatus });
      toast.success(currentStatus ? 'User banned' : 'User activated');
      fetchUsers();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredUsers = users.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    );
  });

  // Mobile Card Component
  const UserCard = ({ user }) => {
    const isExpanded = expandedRow === user.id;
    
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-3 shadow-sm">
        <div 
          className="p-4 cursor-pointer active:bg-slate-50 transition-colors"
          onClick={() => toggleExpand(user.id)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <span className="font-bold text-slate-600 text-sm">
                {user.fullName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-900 truncate">{user.fullName}</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  user.role === 'ADMIN'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                user.isActive
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {user.isActive ? 'Active' : 'Banned'}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</p>
              <a 
                href={`mailto:${user.email}`}
                className="text-sm text-slate-600 flex items-center gap-2 hover:text-amber-600 transition-colors"
              >
                <Mail className="w-4 h-4 text-slate-400" />
                {user.email}
              </a>
              {user.phone && (
                <a 
                  href={`tel:${user.phone}`}
                  className="text-sm text-emerald-600 flex items-center gap-2 font-medium hover:text-emerald-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {user.phone}
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Bookings</p>
                <p className="font-semibold text-slate-900">{user._count?.bookings || 0}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Joined</p>
                <p className="font-semibold text-slate-900 text-xs">
                  {new Date(user.createdAt).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={(e) => { e.stopPropagation(); toggleStatus(user.id, user.isActive); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  user.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {user.isActive ? (
                  <><UserX className="w-3.5 h-3.5" /> Ban User</>
                ) : (
                  <><UserCheck className="w-3.5 h-3.5" /> Activate</>
                )}
              </button>
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-slate-500 text-sm">{users.length} total</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
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
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
            <p className="text-sm">No users found</p>
            {searchQuery && <p className="text-xs mt-1">Try adjusting your search</p>}
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 font-medium text-slate-500">User</th>
                <th className="px-6 py-3 font-medium text-slate-500">Role</th>
                <th className="px-6 py-3 font-medium text-slate-500">Phone</th>
                <th className="px-6 py-3 font-medium text-slate-500">Bookings</th>
                <th className="px-6 py-3 font-medium text-slate-500">Status</th>
                <th className="px-6 py-3 font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="font-bold text-slate-600 text-xs">
                          {user.fullName?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.fullName}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.phone ? (
                      <a href={`tel:${user.phone}`} className="text-emerald-600 text-xs hover:underline">
                        {user.phone}
                      </a>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user._count?.bookings || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(user.id, user.isActive)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        user.isActive
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {user.isActive ? 'Ban' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}