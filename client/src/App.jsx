import { useEffect, useState } from 'react';
import api from './api';
import EquipmentForm from './components/EquipmentForm';
import KanbanBoard from './components/KanbanBoard'; // <-- Import this

function App() {
  const [view, setView] = useState('board'); // 'board' or 'list'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white shadow p-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-900">GearGuard</h1>
        <div className="space-x-4">
          <button onClick={() => setView('list')} className="text-blue-600 hover:underline">Equipment</button>
          <button onClick={() => setView('board')} className="text-blue-600 hover:underline">Kanban Board</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        {/* Helper to create a test ticket quickly */}
        <button
          onClick={async () => {
            // CAUTION: Ensure Equipment ID 1 exists in your database!
            await api.post('/requests', {
              title: "Engine Overheat",
              equipmentId: 1,
              priority: "HIGH",
              type: "CORRECTIVE"
            });
            window.location.reload();
          }}
          className="mb-4 text-sm text-gray-500 underline"
        >
          + Add Test Ticket (Debug)
        </button>

        {view === 'list' ? (
           <EquipmentForm /> /* You might want to include the list table here too from Phase 1 */
        ) : (
          <KanbanBoard />
        )}
      </div>
    </div>
  );
}

export default App;