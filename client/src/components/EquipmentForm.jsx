import { useState, useEffect } from 'react';
import api from '../api';

export default function EquipmentForm({ onRefresh }) {
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: '', 
    serialNumber: '', 
    location: '', 
    maintenanceTeamId: ''
  });

  // Fetch teams for the dropdown
  useEffect(() => {
    api.get('/teams').then(res => setTeams(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/equipment', formData);
      alert('Equipment Added!');
      // Reset form
      setFormData({ name: '', serialNumber: '', location: '', maintenanceTeamId: '' });
      onRefresh(); // Reload the list below
    } catch (err) {
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