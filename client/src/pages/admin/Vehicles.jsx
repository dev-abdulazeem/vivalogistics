import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatNaira } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, X, ChevronDown, ChevronUp, Car, MapPin, Tag, Phone, Image as ImageIcon } from 'lucide-react';

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);

  const [form, setForm] = useState({
    name: '',
    type: 'CAR',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    seats: 5,
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    pricePerDay: '',
    location: '',
    description: '',
    features: '',
    driverPhone: '',
  });

  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles?limit=100');
      setVehicles(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        name: form.name,
        type: form.type,
        brand: form.brand,
        model: form.model,
        year: parseInt(form.year),
        seats: parseInt(form.seats),
        transmission: form.transmission,
        fuelType: form.fuelType,
        pricePerDay: parseFloat(form.pricePerDay),
        location: form.location,
        description: form.description || '',
        driverPhone: form.driverPhone || '',
        features: form.features
          ? form.features.split(',').map((f) => f.trim()).filter(Boolean)
          : [],
      };

      let res;

      if (editingVehicle) {
        if (images.length > 0) {
          const formData = new FormData();
          Object.keys(data).forEach((key) => {
            formData.append(
              key,
              key === 'features' ? JSON.stringify(data[key]) : data[key]
            );
          });
          images.forEach((img) => formData.append('images', img));

          res = await api.patch(`/admin/vehicles/${editingVehicle.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          res = await api.patch(`/admin/vehicles/${editingVehicle.id}`, data);
        }
        toast.success('Vehicle updated');
      } else {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          formData.append(
            key,
            key === 'features' ? JSON.stringify(data[key]) : data[key]
          );
        });
        if (images.length > 0) {
          images.forEach((img) => formData.append('images', img));
        }

        res = await api.post('/admin/vehicles', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Vehicle created');
      }

      setShowModal(false);
      resetForm();
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this vehicle?')) return;
    try {
      await api.delete(`/admin/vehicles/${id}`);
      toast.success('Vehicle deactivated');
      fetchVehicles();
    } catch (error) {
      toast.error('Deactivate failed');
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.patch(`/admin/vehicles/${id}`, { isActive: true, isAvailable: true });
      toast.success('Vehicle restored');
      fetchVehicles();
    } catch (error) {
      toast.error('Restore failed');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      type: 'CAR',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      seats: 5,
      transmission: 'AUTOMATIC',
      fuelType: 'PETROL',
      pricePerDay: '',
      location: '',
      description: '',
      features: '',
      driverPhone: '',
    });
    setImages([]);
    setEditingVehicle(null);
  };

  const openEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      name: vehicle.name || '',
      type: vehicle.type || 'CAR',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      seats: vehicle.seats || 5,
      transmission: vehicle.transmission || 'AUTOMATIC',
      fuelType: vehicle.fuelType || 'PETROL',
      pricePerDay: vehicle.pricePerDay || '',
      location: vehicle.location || '',
      description: vehicle.description || '',
      features: Array.isArray(vehicle.features) ? vehicle.features.join(', ') : '',
      driverPhone: vehicle.driverPhone || '',
    });
    setImages([]);
    setShowModal(true);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesFilter = filter === 'all' ? true : filter === 'active' ? v.isActive : !v.isActive;
    const matchesSearch = searchQuery === '' ||
      v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Vehicles</h1>
          <p className="text-slate-500 text-sm mt-0.5">{vehicles.length} total vehicles</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Vehicle</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: Card Layout */}
      <div className="sm:hidden space-y-3">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
          >
            <div
              className="p-4 flex items-center gap-3"
              onClick={() => toggleCard(vehicle.id)}
            >
              <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                {vehicle.images?.[0] ? (
                  <img
                    src={vehicle.images[0]}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Car className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 text-sm truncate">{vehicle.name}</p>
                  <span
                    className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      vehicle.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {vehicle.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5">
                  {vehicle.brand} {vehicle.model} · {vehicle.type}
                </p>
                <p className="text-amber-600 font-bold text-sm mt-1">
                  {formatNaira(vehicle.pricePerDay)}
                  <span className="text-slate-400 font-normal text-xs">/day</span>
                </p>
              </div>
              <div className="shrink-0">
                {expandedCard === vehicle.id ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>

            {expandedCard === vehicle.id && (
              <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs">{vehicle.location || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs">{vehicle.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs">{vehicle.seats} seats</span>
                  </div>
                  {vehicle.driverPhone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs">{vehicle.driverPhone}</span>
                    </div>
                  )}
                </div>

                {vehicle.features?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {vehicle.features.slice(0, 4).map((feat, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium"
                      >
                        {feat}
                      </span>
                    ))}
                    {vehicle.features.length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px]">
                        +{vehicle.features.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {vehicle.isActive ? (
                    <>
                      <button
                        onClick={() => openEdit(vehicle)}
                        className="flex-1 bg-amber-50 text-amber-700 py-2 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        Deactivate
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleRestore(vehicle.id)}
                      className="w-full bg-emerald-50 text-emerald-700 py-2 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Car className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No vehicles found</p>
          </div>
        )}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Type</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Price/Day</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Location</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                        {vehicle.images?.[0] ? (
                          <img
                            src={vehicle.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{vehicle.name}</p>
                        <p className="text-slate-500 text-xs">
                          {vehicle.brand} {vehicle.model}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-medium">
                      {vehicle.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {formatNaira(vehicle.pricePerDay)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {vehicle.location || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        vehicle.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {vehicle.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {vehicle.isActive ? (
                        <>
                          <button
                            onClick={() => openEdit(vehicle)}
                            className="text-sm text-amber-600 hover:text-amber-700 font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Deactivate
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(vehicle.id)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Car className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            No vehicles found
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'name', label: 'Name', type: 'text', required: true },
                  { name: 'brand', label: 'Brand', type: 'text', required: true },
                  { name: 'model', label: 'Model', type: 'text', required: true },
                  { name: 'year', label: 'Year', type: 'number', required: true },
                  { name: 'seats', label: 'Seats', type: 'number', required: true },
                  { name: 'pricePerDay', label: 'Price per Day (₦)', type: 'number', required: true },
                  { name: 'location', label: 'Location', type: 'text', required: true },
                  { name: 'driverPhone', label: 'Driver Phone', type: 'tel', required: false },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={
                        field.name === 'driverPhone' ? '+234 801 234 5678' : undefined
                      }
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      value={form[field.name]}
                      onChange={(e) =>
                        setForm({ ...form, [field.name]: e.target.value })
                      }
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="CAR">Car</option>
                    <option value="SEDAN">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="BUS">Bus</option>
                    <option value="VAN">Van</option>
                    <option value="TRUCK">Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Transmission</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    value={form.transmission}
                    onChange={(e) =>
                      setForm({ ...form, transmission: e.target.value })
                    }
                  >
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Fuel Type</label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    value={form.fuelType}
                    onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                  >
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none transition-all"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Features <span className="text-slate-400 font-normal">(comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="AC, GPS, Bluetooth, Reverse Camera"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Images {editingVehicle ? <span className="text-slate-400 font-normal">(leave empty to keep current)</span> : ''}
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-amber-300 transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="vehicle-images"
                    onChange={(e) => setImages(Array.from(e.target.files))}
                  />
                  <label htmlFor="vehicle-images" className="cursor-pointer block">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 font-medium">Click to upload images</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB each</p>
                  </label>
                </div>
                {images.length > 0 && (
                  <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {images.length} file(s) selected
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-300 text-slate-950 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
              >
                {submitting
                  ? 'Saving...'
                  : editingVehicle
                  ? 'Update Vehicle'
                  : 'Create Vehicle'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}