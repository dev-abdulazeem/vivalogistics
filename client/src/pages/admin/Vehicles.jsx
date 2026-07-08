import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatNaira } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [filter, setFilter] = useState('all');

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
    if (filter === 'active') return v.isActive;
    if (filter === 'inactive') return !v.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Manage Vehicles</h1>
        <button
          onClick={openCreate}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: `All (${vehicles.length})` },
          { id: 'active', label: `Active (${vehicles.filter((v) => v.isActive).length})` },
          { id: 'inactive', label: `Inactive (${vehicles.filter((v) => !v.isActive).length})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f.id
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 font-medium text-slate-500">Vehicle</th>
                <th className="px-6 py-3 font-medium text-slate-500">Type</th>
                <th className="px-6 py-3 font-medium text-slate-500">Price/Day</th>
                <th className="px-6 py-3 font-medium text-slate-500">Location</th>
                <th className="px-6 py-3 font-medium text-slate-500">Status</th>
                <th className="px-6 py-3 font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
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
                            No img
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
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">
                      {vehicle.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {formatNaira(vehicle.pricePerDay)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {vehicle.location || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
                            className="text-sm text-amber-600 hover:text-amber-700 font-medium px-2 py-1 rounded hover:bg-amber-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            Deactivate
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(vehicle.id)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
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
          <div className="text-center py-12 text-slate-400">No vehicles found.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={
                        field.name === 'driverPhone' ? '+234 801 234 5678' : undefined
                      }
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500"
                      value={form[field.name]}
                      onChange={(e) =>
                        setForm({ ...form, [field.name]: e.target.value })
                      }
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Transmission
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fuel Type
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500 resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Features (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="AC, GPS, Bluetooth, Reverse Camera"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:border-amber-500"
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Images {editingVehicle ? '(leave empty to keep current)' : ''}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-sm"
                  onChange={(e) => setImages(Array.from(e.target.files))}
                />
                {images.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {images.length} file(s) selected
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-300 text-slate-950 py-3 rounded-xl font-bold transition-colors"
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