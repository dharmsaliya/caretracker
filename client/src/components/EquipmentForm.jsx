import { useState, useEffect } from 'react';
import api from '../api';

export default function EquipmentForm({ onRefresh }) {
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    location: '',
    department: '',
    purchaseDate: '',
    warrantyEnd: '',
    maintenanceTeamId: ''
  });

  // Fetch teams for the dropdown
  useEffect(() => {
    api.get('/teams').then(res => setTeams(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : null,
        warrantyEnd: formData.warrantyEnd ? new Date(formData.warrantyEnd).toISOString() : null,
      };

      await api.post('/equipment', payload);
      alert('Equipment Added!');

      setFormData({
        name: '',
        serialNumber: '',
        location: '',
        department: '',
        purchaseDate: '',
        warrantyEnd: '',
        maintenanceTeamId: ''
      });
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Error adding equipment');
    }
  };

  // Helper classes for consistent styling
  const inputBaseClass = "w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 outline-none placeholder-gray-400";
  const labelClass = "block text-sm font-semibold text-gray-600 mb-1.5 ml-1";

  return (
    <div className="max-w-4xl mx-auto mb-10">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Register Equipment</h2>
            <p className="text-sm text-gray-500 mt-1">Add new assets to the inventory system</p>
          </div>
          {/* Decorative Icon */}
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Row 1: Primary Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Equipment Name</label>
                <input
                  placeholder="e.g. Dell Precision 5000"
                  className={inputBaseClass}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Serial Number</label>
                <input
                  placeholder="e.g. SN-99887766"
                  className={inputBaseClass}
                  value={formData.serialNumber}
                  onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Row 2: Location & Dept */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Location</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <input
                    placeholder="Floor 2, Server Room B"
                    className={`${inputBaseClass} pl-11`} // Extra padding for icon
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <input
                  placeholder="e.g. Engineering"
                  className={inputBaseClass}
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Row 3: Dates & Warranty */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Purchase Date</label>
                <input
                  type="date"
                  className={inputBaseClass}
                  value={formData.purchaseDate}
                  onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Warranty Expiration</label>
                <input
                  type="date"
                  className={inputBaseClass}
                  value={formData.warrantyEnd}
                  onChange={e => setFormData({ ...formData, warrantyEnd: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Maintenance Team</label>
                <div className="relative">
                  <select
                    className={`${inputBaseClass} appearance-none cursor-pointer`}
                    value={formData.maintenanceTeamId}
                    onChange={e => setFormData({ ...formData, maintenanceTeamId: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select a Team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                  {/* Custom Chevron for Select */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
              >
                Save Equipment Record
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}