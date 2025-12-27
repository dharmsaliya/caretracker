import { useEffect, useState } from 'react';
import api from './api';
import EquipmentForm from './components/EquipmentForm';
import KanbanBoard from './components/KanbanBoard';
import MaintenanceCalendar from './components/MaintenanceCalendar'; // <-- Import this

function App() {
  const [view, setView] = useState('board'); // 'board', 'list', 'calendar'

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
        {view === 'list' && <EquipmentForm />}
        {view === 'board' && <KanbanBoard />}
        {view === 'calendar' && <MaintenanceCalendar />}
      </div>
    </div>
  );
}

export default App;