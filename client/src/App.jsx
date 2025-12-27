import { useEffect, useState } from 'react';
import api from './api';
import EquipmentForm from './components/EquipmentForm';

function App() {
  const [equipment, setEquipment] = useState([]);

  const fetchEquipment = () => {
    api.get('/equipment').then(res => setEquipment(res.data));
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">GearGuard Manager</h1>
        
        {/* The Form Component */}
        <EquipmentForm onRefresh={fetchEquipment} />

        {/* The List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Equipment Inventory</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Serial</th>
                <th className="p-2">Team</th>
                <th className="p-2">Location</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2 text-gray-500">{item.serialNumber}</td>
                  <td className="p-2 text-blue-600">{item.maintenanceTeam?.name}</td>
                  <td className="p-2">{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;