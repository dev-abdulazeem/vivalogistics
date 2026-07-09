import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { formatNaira } from "../utils/formatCurrency";
import { format } from "date-fns";
import { Calendar, MapPin, ArrowRight, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data.data);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cancel failed");
    }
  };

  const handleMarkComplete = async (id) => {
    if (!confirm("Mark this vehicle as returned? This will notify admin for verification.")) return;
    try {
      const res = await api.patch(`/bookings/${id}/mark-complete`);
      toast.success(res.data.message);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark as complete");
    }
  };

  const statusConfig = {
    PENDING: {
      label: "Pending Payment",
      dot: "bg-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
      icon: Clock,
    },
    CONFIRMED: {
      label: "Confirmed",
      dot: "bg-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      icon: CheckCircle,
    },
    ACTIVE: {
      label: "Active — In Use",
      dot: "bg-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: CheckCircle,
    },
    CLIENT_MARKED_COMPLETE: {
      label: "Awaiting Verification",
      dot: "bg-purple-500",
      bg: "bg-purple-50",
      text: "text-purple-700",
      icon: Clock,
    },
    PENDING_VERIFICATION: {
      label: "Extra Charges Pending",
      dot: "bg-red-500",
      bg: "bg-red-50",
      text: "text-red-700",
      icon: AlertTriangle,
    },
    COMPLETED: {
      label: "Completed",
      dot: "bg-slate-500",
      bg: "bg-slate-100",
      text: "text-slate-700",
      icon: CheckCircle,
    },
    AUTO_COMPLETED: {
      label: "Auto-Completed",
      dot: "bg-slate-400",
      bg: "bg-slate-100",
      text: "text-slate-600",
      icon: CheckCircle,
    },
    CANCELLED: {
      label: "Cancelled",
      dot: "bg-red-500",
      bg: "bg-red-50",
      text: "text-red-700",
      icon: AlertTriangle,
    },
    REFUNDED: {
      label: "Refunded",
      dot: "bg-slate-400",
      bg: "bg-slate-100",
      text: "text-slate-600",
      icon: CheckCircle,
    },
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-500 mt-2">Manage your rentals and track upcoming trips.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
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
              const StatusIcon = status.icon;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                      {/* Image */}
                      <div className="shrink-0">
                        <div className="w-full md:w-48 h-40 md:h-32 rounded-xl overflow-hidden bg-slate-100">
                          <img
                            src={booking.vehicle?.images?.[0] || "/placeholder.jpg"}
                            alt={booking.vehicle?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="text-base md:text-lg font-bold text-slate-900">
                              {booking.vehicle?.name}
                            </h3>
                            <p className="text-slate-500 text-sm mt-0.5">
                              {booking.vehicle?.brand} {booking.vehicle?.model}
                            </p>
                          </div>
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </div>
                        </div>

                        {/* Trip info */}
                        <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-slate-500 mt-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>
                              {format(new Date(booking.startDate), "MMM d")} —{" "}
                              {format(new Date(booking.endDate), "MMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{booking.pickupLocation || "Lagos"}</span>
                          </div>
                        </div>

                        {/* Extra charges */}
                        {(booking.status === "PENDING_VERIFICATION" ||
                          booking.status === "AUTO_COMPLETED") &&
                          Number(booking.extraCharges) > 0 && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-red-700 text-sm font-medium">
                                    Extra charges applied
                                  </p>
                                  <p className="text-red-600 text-xs mt-0.5">
                                    {booking.extraChargeDays} day(s) overdue —{" "}
                                    {formatNaira(booking.extraCharges)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Verification pending */}
                        {booking.status === "CLIENT_MARKED_COMPLETE" && (
                          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-purple-700 text-sm font-medium">
                                  Awaiting admin verification
                                </p>
                                <p className="text-purple-600 text-xs mt-0.5">
                                  Admin will verify your return within 48 hours.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="border-t border-slate-100 my-4" />

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="text-xl md:text-2xl font-bold text-slate-900">
                              {formatNaira(booking.totalPrice)}
                            </p>
                            <p className="text-slate-400 text-sm">
                              {booking.totalDays} day{booking.totalDays !== 1 ? "s" : ""}
                            </p>
                            {Number(booking.extraCharges) > 0 && (
                              <p className="text-red-600 text-xs font-medium mt-1">
                                + {formatNaira(booking.extraCharges)} extra
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <Link
                              to={`/vehicles/${booking.vehicleId}`}
                              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                            >
                              View Vehicle
                            </Link>

                            {booking.status === "PENDING" && (
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

                            {booking.status === "ACTIVE" && (
                              <>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() => handleMarkComplete(booking.id)}
                                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                                >
                                  Mark as Returned
                                </button>
                              </>
                            )}

                            {(booking.status === "CONFIRMED" ||
                              booking.status === "COMPLETED") && (
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