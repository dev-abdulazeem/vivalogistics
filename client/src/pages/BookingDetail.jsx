import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { formatNaira } from "../utils/formatCurrency";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Car,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.data);
    } catch (error) {
      toast.error("Failed to load booking details");
      navigate("/my-bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled");
      fetchBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancel failed");
    }
  };

  const handleMarkComplete = async () => {
    if (!confirm("Mark this vehicle as returned?")) return;
    try {
      const res = await api.patch(`/bookings/${id}/mark-complete`);
      toast.success(res.data.message);
      fetchBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark as complete");
    }
  };

  const statusConfig = {
    PENDING: {
      label: "Pending Payment",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    CONFIRMED: {
      label: "Confirmed",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    ACTIVE: {
      label: "Active — In Use",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    CLIENT_MARKED_COMPLETE: {
      label: "Awaiting Verification",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    PENDING_VERIFICATION: {
      label: "Extra Charges Pending",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    COMPLETED: {
      label: "Completed",
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
    },
    AUTO_COMPLETED: {
      label: "Auto-Completed",
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
    },
    CANCELLED: {
      label: "Cancelled",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    REFUNDED: {
      label: "Refunded",
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
    },
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) return null;

  const status = statusConfig[booking.status] || statusConfig.PENDING;
  const vehicle = booking.vehicle;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to my bookings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Booking Details</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Vehicle Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
          <div className="h-48 md:h-56 bg-slate-100 relative">
            <img
              src={vehicle?.images?.[0] || "/placeholder.jpg"}
              alt={vehicle?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-900">{vehicle?.name}</h2>
            <p className="text-slate-500 text-sm">
              {vehicle?.brand} {vehicle?.model} · {vehicle?.seats} seats · {vehicle?.transmission}
            </p>
          </div>
        </div>

        {/* Booking Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 mb-6">
          <h3 className="font-bold text-slate-900 mb-4">Trip Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Rental Period</p>
                <p className="text-sm font-semibold text-slate-900">
                  {format(new Date(booking.startDate), "EEEE, MMM d")} —{" "}
                  {format(new Date(booking.endDate), "EEEE, MMM d, yyyy")}
                </p>
                <p className="text-xs text-slate-400">
                  {booking.totalDays} day{booking.totalDays !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Pickup Location</p>
                <p className="text-sm font-semibold text-slate-900">{booking.pickupLocation}</p>
              </div>
            </div>

            {booking.dropoffLocation && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Drop-off Location</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.dropoffLocation}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Price</p>
                <p className="text-sm font-bold text-slate-900">{formatNaira(booking.totalPrice)}</p>
              </div>
            </div>

            {booking.driverRequired && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Driver</p>
                  <p className="text-sm font-semibold text-slate-900">Professional driver included</p>
                </div>
              </div>
            )}

            {booking.specialRequests && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-medium mb-1">Special Requests</p>
                <p className="text-sm text-slate-700">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Extra charges warning */}
        {(booking.status === "PENDING_VERIFICATION" || booking.status === "AUTO_COMPLETED") &&
          Number(booking.extraCharges) > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 md:p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 font-medium">Extra charges applied</p>
                  <p className="text-red-600 text-sm mt-1">
                    {booking.extraChargeDays} day(s) overdue — {formatNaira(booking.extraCharges)}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Verification pending */}
        {booking.status === "CLIENT_MARKED_COMPLETE" && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 md:p-6 mb-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-700 font-medium">Awaiting admin verification</p>
                <p className="text-purple-600 text-sm mt-1">
                  Admin will verify your return within 48 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {booking.status === "PENDING" && (
            <button
              onClick={handleCancel}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-3.5 rounded-xl font-semibold text-sm transition-colors"
            >
              Cancel Booking
            </button>
          )}

          {booking.status === "ACTIVE" && (
            <button
              onClick={handleMarkComplete}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-3.5 rounded-xl font-semibold text-sm transition-colors"
            >
              Mark as Returned
            </button>
          )}

          <Link
            to="/vehicles"
            className="flex-1 text-center py-3.5 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
          >
            Book Another Vehicle
          </Link>
        </div>
      </div>
    </div>
  );
}