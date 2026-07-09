import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { formatNaira } from "../utils/formatCurrency";
import { ArrowLeft, Star, MapPin } from "lucide-react";

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const res = await api.get(`/vehicles/${id}`);
      setVehicle(res.data.data);
    } catch (error) {
      console.error("Failed to load vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Vehicle not found</p>
          <Link
            to="/vehicles"
            className="text-amber-600 font-medium mt-4 inline-block hover:text-amber-700"
          >
            Browse vehicles
          </Link>
        </div>
      </div>
    );
  }

  const images =
    vehicle.images?.length > 0 ? vehicle.images : ["/placeholder.jpg"];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/vehicles"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to fleet
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="rounded-2xl overflow-hidden mb-4 h-64 sm:h-80 md:h-96 lg:h-[480px] bg-slate-100">
              <img
                src={images[selectedImage]}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 md:gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? "border-amber-500"
                        : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Tags */}
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                {vehicle.type}
              </span>
              {vehicle.avgRating > 0 && (
                <span className="flex items-center gap-1 text-sm text-slate-600">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold">{vehicle.avgRating}</span>
                  <span className="text-slate-400">
                    ({vehicle.reviews?.length || 0} reviews)
                  </span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
              {vehicle.name}
            </h1>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-6 md:mb-8">
              {vehicle.description ||
                "Premium vehicle available for rent. Well-maintained, fully insured, and ready for your next journey."}
            </p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-100">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                  Seats
                </p>
                <p className="font-bold text-slate-900 text-sm md:text-base">
                  {vehicle.seats} passengers
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-100">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                  Transmission
                </p>
                <p className="font-bold text-slate-900 text-sm md:text-base">
                  {vehicle.transmission || "Automatic"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-100">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                  Fuel Type
                </p>
                <p className="font-bold text-slate-900 text-sm md:text-base">
                  {vehicle.fuelType || "Petrol"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-100">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                  Location
                </p>
                <p className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {vehicle.location || "Lagos"}
                </p>
              </div>
            </div>

            {/* Features */}
            {vehicle.features?.length > 0 && (
              <div className="mb-6 md:mb-8">
                <h3 className="font-bold text-slate-900 mb-3 md:mb-4">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((f, i) => (
                    <span
                      key={i}
                      className="bg-slate-50 border border-slate-200 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-sm text-slate-600"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price & CTA */}
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Price per day</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    {formatNaira(vehicle.pricePerDay)}
                  </p>
                </div>
                <p className="text-slate-500 text-sm">Fully insured</p>
              </div>
              <Link
                to={`/booking/${vehicle.id}`}
                className="block w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-center py-3.5 md:py-4 rounded-xl font-bold transition-colors"
              >
                Book Now
              </Link>
              <p className="text-center text-slate-500 text-xs mt-3">
                Free cancellation up to 24 hours before pickup
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}