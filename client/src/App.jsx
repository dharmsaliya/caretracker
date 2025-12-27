import { useEffect, useState } from 'react';
import api from './api';
import EquipmentForm from './components/EquipmentForm';
import KanbanBoard from './components/KanbanBoard';
import MaintenanceCalendar from './components/MaintenanceCalendar';
import Dashboard from './components/Dashboard';

function App() {
  const [view, setView] = useState('board'); // 'board', 'list', 'calendar', 'dashboard'
  
  // --- STATE FOR EQUIPMENT LIST ---
  const [equipment, setEquipment] = useState([]);
  
  // --- STATE FOR HISTORY MODAL ---
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
      const res = await api.get(`/equipment/${id}/requests`);
      setHistory(res.data);
      setSelectedMachine(name);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  // Helper for Nav Items
  const NavItem = ({ id, label, icon }) => (
    <button 
      onClick={() => setView(id)} 
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${view === id 
          ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
      `}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-2 rounded-lg shadow-md shadow-indigo-200">
                
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-800">GearGuard</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              <NavItem 
                id="dashboard" 
                label="Overview" 
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} 
              />
              <NavItem 
                id="board" 
                label="Kanban Board" 
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>} 
              />
              <NavItem 
                id="list" 
                label="Assets" 
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} 
              />
              <NavItem 
                id="calendar" 
                label="Schedule" 
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} 
              />
            </div>
            
            {/* User Profile (Mock) */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
               
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: EQUIPMENT LIST */}
        {view === 'list' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Section */}
            <EquipmentForm onRefresh={fetchEquipment} />
            
            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-800">Inventory Assets</h2>
                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                  {equipment.length} Total Items
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Serial Number</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Maintenance Team</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {equipment.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-400">ID: #{item.id}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">
                          {item.serialNumber}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            item.status === 'UNUSABLE' 
                              ? 'bg-red-50 text-red-700 border-red-100' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'UNUSABLE' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                               {item.maintenanceTeam?.name?.charAt(0) || '?'}
                             </div>
                             <span className="text-sm text-gray-700">{item.maintenanceTeam?.name || 'Unassigned'}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleShowHistory(item.id, item.name)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm text-sm font-medium group"
                          >
                            <span>History</span>
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md group-hover:bg-indigo-200 group-hover:text-indigo-700 transition-colors">
                              {item._count?.requests || 0}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {equipment.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                          No equipment found in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: KANBAN BOARD */}
        {view === 'board' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <KanbanBoard />
          </div>
        )}

        {/* VIEW 3: CALENDAR */}
        {view === 'calendar' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <MaintenanceCalendar />
          </div>
        )}

        {/* VIEW 4: DASHBOARD */}
        {view === 'dashboard' && (
           <div className="animate-in fade-in zoom-in-95 duration-300">
             <Dashboard />
           </div>
        )}
      </main>

      {/* --- HISTORY MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all scale-100">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Maintenance History</h3>
                <p className="text-sm text-gray-500">Asset: <span className="font-semibold text-indigo-600">{selectedMachine}</span></p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[500px] overflow-y-auto p-0">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                   <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                   <p>No maintenance records found.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider sticky top-0 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Issue Title</th>
                      <th className="px-6 py-3">Resolution Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{req.title}</div>
                          {req.description && <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{req.description}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            req.status === 'REPAIRED' 
                              ? 'bg-green-100 text-green-800' 
                              : req.status === 'SCRAP'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
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