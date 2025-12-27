import { useState, useEffect } from 'react';
import api, { fetchEquipmentHistory } from '../api';

export default function EquipmentList() {
  const [equipment, setEquipment] = useState([]);
  const [selectedEq, setSelectedEq] = useState(null); // For Modal
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    const res = await api.get('/equipment');
    setEquipment(res.data);
  };

  const handleOpenHistory = async (eq) => {
    setSelectedEq(eq);
    const res = await fetchEquipmentHistory(eq.id);
    setHistory(res.data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Equipment Inventory</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map(eq => (
          <div key={eq.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{eq.name}</h3>
                <p className="text-sm text-gray-500">SN: {eq.serialNumber}</p>
                <p className="text-sm text-gray-500 mt-1">{eq.location} • {eq.department || 'General'}</p>
              </div>
              
              {/* SMART BUTTON */}
              <button 
                onClick={() => handleOpenHistory(eq)}
                className="flex flex-col items-center bg-white border border-gray-300 rounded shadow-sm px-3 py-1 hover:bg-gray-50"
              >
                <span className="text-xs text-gray-500 uppercase font-bold">Maintenance</span>
                <span className="text-xl font-bold text-blue-600">
                  {eq._count?.requests || 0}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* HISTORY MODAL */}
      {selectedEq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">History: {selectedEq.name}</h3>
              <button onClick={() => setSelectedEq(null)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No maintenance history found.</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-gray-500 border-b">
                    <tr>
                      <th className="py-2">Date</th>
                      <th className="py-2">Issue</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(req => (
                      <tr key={req.id} className="border-b last:border-0">
                        <td className="py-3">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 font-medium">{req.title}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            req.status === 'REPAIRED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3">{req.duration ? `${req.duration} hrs` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}