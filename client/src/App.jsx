import { useEffect, useState } from 'react';
import api from './api';
import EquipmentForm from './components/EquipmentForm';
import KanbanBoard from './components/KanbanBoard';
import MaintenanceCalendar from './components/MaintenanceCalendar';

function App() {
  const [view, setView] = useState('board'); // 'board', 'list', 'calendar'
  
  // --- STATE FOR EQUIPMENT LIST (PHASE 1) ---
  const [equipment, setEquipment] = useState([]);
  
  // --- STATE FOR HISTORY MODAL (PHASE 4) ---
  const [history, setHistory] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch Equipment List
  const fetchEquipment = () => {
    api.get('/equipment').then(res => setEquipment(res.data));
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Handle opening the History Modal
  const handleShowHistory = async (id, name) => {
    try {
      // Note: The backend must support the _count property for the badge to work
      const res = await api.get(`/equipment/${id}/requests`);
      setHistory(res.data);
      setSelectedMachine(name);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white shadow p-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-900">GearGuard</h1>
        <div className="space-x-4">
          <button onClick={() => setView('list')} className="text-blue-600 hover:underline">Equipment</button>
          <button onClick={() => setView('board')} className="text-blue-600 hover:underline">Kanban Board</button>
          <button onClick={() => setView('calendar')} className="text-blue-600 hover:underline">Calendar</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* VIEW 1: EQUIPMENT LIST & FORM */}
        {view === 'list' && (
          <>
            <EquipmentForm onRefresh={fetchEquipment} />
            
            {/* The Table with Smart Buttons */}
            <div className="bg-white shadow rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Equipment Inventory</h2>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3">Name</th>
                    <th className="p-3">Serial</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Team</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3 text-gray-500">{item.serialNumber}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.status === 'UNUSABLE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-blue-600">{item.maintenanceTeam?.name}</td>
                      <td className="p-3">
                        {/* SMART BUTTON */}
                        <button
                          onClick={() => handleShowHistory(item.id, item.name)}
                          className="flex items-center gap-2 border border-blue-200 bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100 transition"
                        >
                          <span>History</span>
                          <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {item._count?.requests || 0}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* VIEW 2: KANBAN BOARD */}
        {view === 'board' && <KanbanBoard />}

        {/* VIEW 3: CALENDAR */}
        {view === 'calendar' && <MaintenanceCalendar />}
      </div>

      {/* --- HISTORY MODAL (ALWAYS RENDERED BUT HIDDEN) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">History: {selectedMachine}</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-red-500 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 italic text-center p-4">No maintenance history found.</p>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Title</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(req => (
                      <tr key={req.id} className="border-b">
                        <td className="p-2 text-sm text-gray-600">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-2 font-medium">{req.title}</td>
                        <td className="p-2">
                          <span className={`text-xs px-2 py-1 rounded border ${
                            req.status === 'REPAIRED' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
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

export default App;