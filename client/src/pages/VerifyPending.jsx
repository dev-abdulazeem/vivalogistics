import { useLocation, Link } from "react-router-dom";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function VerifyPending() {
  const location = useLocation();
  const email = location.state?.email || "";
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      const res = await api.post("/auth/resend-verification", { email });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-8 md:p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5 md:mb-6">
          <Mail className="w-7 h-7 md:w-8 md:h-8 text-amber-600" />
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
          Check your email
        </h2>
        <p className="text-slate-500 mb-2">We sent a verification link to:</p>
        <p className="text-slate-900 font-semibold mb-5 md:mb-6 break-all">
          {email}
        </p>

        <p className="text-slate-500 text-sm mb-6 md:mb-8 leading-relaxed">
          Click the link in the email to verify your account. Once verified, you
          can sign in and start booking.
        </p>

        <div className="space-y-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={handleResend}
            disabled={isResending}
            className="inline-flex items-center justify-center gap-2 w-full text-slate-600 font-medium hover:text-slate-900 transition-colors disabled:opacity-50 py-3"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend verification email"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}