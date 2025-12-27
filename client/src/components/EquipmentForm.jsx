import { useState, useEffect } from 'react';
import api from '../api';

export default function EquipmentForm({ onRefresh }) {
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: '', 
    serialNumber: '', 
    location: '', 
    department: '',    // NEW FIELD
    purchaseDate: '',  // NEW FIELD
    warrantyEnd: '',   // NEW FIELD
    maintenanceTeamId: ''
  });

  // Fetch teams for the dropdown
  useEffect(() => {
    api.get('/teams').then(res => setTeams(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a copy of data to send (ensure date strings are valid or null)
      const payload = {
        ...formData,
        // Ensure empty strings for dates are sent as null if backend requires it, 
        // or keep as empty string if your backend handles it. 
        // Based on typical Prisma, dates are ISO-8601 strings.
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : null,
        warrantyEnd: formData.warrantyEnd ? new Date(formData.warrantyEnd).toISOString() : null,
      };

      await api.post('/equipment', payload);
      alert('Equipment Added!');
      
      // Reset form
      setFormData({ 
        name: '', 
        serialNumber: '', 
        location: '', 
        department: '', 
        purchaseDate: '', 
        warrantyEnd: '', 
        maintenanceTeamId: '' 
      });
      onRefresh(); // Reload the list below
    } catch (err) {
      console.error(err);
      alert('Error adding equipment');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4">Add New Equipment</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input
          placeholder="Equipment Name"
          className="p-2 border rounded"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          required
        />
        <input
          placeholder="Serial Number"
          className="p-2 border rounded"
          value={formData.serialNumber}
          onChange={e => setFormData({...formData, serialNumber: e.target.value})}
          required
        />
        <input
          placeholder="Location"
          className="p-2 border rounded"
          value={formData.location}
          onChange={e => setFormData({...formData, location: e.target.value})}
          required
        />
        <input
          placeholder="Department"
          className="p-2 border rounded"
          value={formData.department}
          onChange={e => setFormData({...formData, department: e.target.value})}
        />
        
        {/* NEW DATE FIELDS */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Purchase Date</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={formData.purchaseDate}
            onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Warranty End</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={formData.warrantyEnd}
            onChange={e => setFormData({...formData, warrantyEnd: e.target.value})}
          />
        </div>

        <select
          className="p-2 border rounded"
          value={formData.maintenanceTeamId}
          onChange={e => setFormData({...formData, maintenanceTeamId: e.target.value})}
          required
        >
          <option value="">Select Team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        
        <button type="submit" className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Save Equipment
        </button>
      </form>
    </div>
  );
}