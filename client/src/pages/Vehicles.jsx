import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatNaira } from '../utils/formatCurrency';
import { Search, Star, MapPin, X, SlidersHorizontal } from 'lucide-react';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    transmission: '',
    fuelType: '',
    seats: '',
    search: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles', { params });
      setVehicles(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    fetchVehicles(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      type: '', location: '', minPrice: '', maxPrice: '',
      transmission: '', fuelType: '', seats: '', search: '',
    });
    fetchVehicles();
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'CAR', label: 'Car' },
    { value: 'SEDAN', label: 'Sedan' },
    { value: 'SUV', label: 'SUV' },
    { value: 'BUS', label: 'Bus' },
    { value: 'VAN', label: 'Van' },
    { value: 'TRUCK', label: 'Truck' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Our Fleet</h1>
          <p className="text-slate-500 mt-2">Find the perfect vehicle for your next journey</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, brand, or model..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors placeholder:text-slate-400"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all border ${
              showFilters || hasActiveFilters
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-amber-500 text-slate-950 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                !
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-200">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Type</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  {typeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Lagos"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500 placeholder:text-slate-400"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Min Price (₦)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500 placeholder:text-slate-400"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Max Price (₦)</label>
                <input
                  type="number"
                  placeholder="No limit"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500 placeholder:text-slate-400"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleFilter}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-slate-500 hover:text-slate-900 flex items-center gap-2 px-4 font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <p className="text-slate-500 text-sm mb-6">
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-400 text-lg">No vehicles match your search.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-amber-600 font-medium hover:text-amber-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                to={`/vehicles/${vehicle.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors"
              >
                {/* Image */}
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={vehicle.images?.[0] || '/placeholder.jpg'}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                      {vehicle.type}
                    </span>
                  </div>
                  {vehicle.avgRating > 0 && (
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-slate-900">{vehicle.avgRating}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-amber-600 transition-colors">
                    {vehicle.name}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {vehicle.brand} {vehicle.model} · {vehicle.seats} seats · {vehicle.transmission || 'Auto'}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 text-sm text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {vehicle.location || 'Lagos'}
                    </span>
                    <span className="font-bold text-slate-900 text-lg">
                      {formatNaira(vehicle.pricePerDay)}
                      <span className="text-slate-400 text-sm font-normal">/day</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}