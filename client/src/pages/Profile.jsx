import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Shield, Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await api.delete('/auth/delete-account');
      logout();
      navigate('/');
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText('');
    setDeleteError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 mb-6">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-amber-700">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
              <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Mail className="w-5 h-5 text-slate-400" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 mb-0.5">Email</p>
                <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
              </div>
              {user?.emailVerified ? (
                <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <Shield className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <span className="text-amber-600 text-xs font-medium">Unverified</span>
              )}
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Phone className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Phone</p>
                <p className="text-sm font-medium text-slate-900">{user?.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-500 mb-6">
            Once you delete your account, all your data and bookings will be permanently removed. This cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete your account?</h3>
                <p className="text-sm text-slate-500">This action is permanent.</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700 leading-relaxed">
                All your bookings, saved vehicles, and personal data will be permanently deleted. You will not be able to recover this account.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type <span className="font-bold text-slate-900">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm font-medium uppercase tracking-wider"
                onKeyDown={(e) => e.key === 'Enter' && handleDeleteAccount()}
              />
            </div>

            {deleteError && (
              <p className="text-sm text-red-600 mb-4">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}