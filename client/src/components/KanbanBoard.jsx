import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api, { fetchRequests, assignRequest } from '../api';

const columns = {
  NEW: { id: 'NEW', title: 'To Do', color: 'bg-gray-50 border-gray-200', badge: 'bg-gray-200 text-gray-700' },
  IN_PROGRESS: { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50/50 border-blue-100', badge: 'bg-blue-100 text-blue-700' },
  REPAIRED: { id: 'REPAIRED', title: 'Completed', color: 'bg-emerald-50/50 border-emerald-100', badge: 'bg-emerald-100 text-emerald-700' },
  SCRAP: { id: 'SCRAP', title: 'Scrap', color: 'bg-rose-50/50 border-rose-100', badge: 'bg-rose-100 text-rose-700' }
};

export default function KanbanBoard() {
  const [requests, setRequests] = useState([]);
  
  // --- NEW: Filter & Assignment State ---
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  // MOCK USER for "Assign to Me"
  const [currentUser, setCurrentUser] = useState({ id: 1, name: "Test Tech" }); 

  // --- EXISTING: Report Breakdown State ---
  const [showModal, setShowModal] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]);
  const [breakdownData, setBreakdownData] = useState({
    title: '',
    equipmentId: '',
    priority: 'MEDIUM'
  });

  // 1. Fetch Data
  useEffect(() => {
    loadData();
    fetchTeams();
    fetchEquipment();
  }, [selectedTeam]);

  const loadData = async () => {
    try {
      const res = await fetchRequests(selectedTeam);
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to fetch teams");
    }
  };

  const fetchEquipment = async () => {
    try {
      const res = await api.get('/equipment');
      setEquipmentList(res.data);
    } catch (err) {
      console.error("Failed to fetch equipment", err);
    }
  };

  // 2. Handle Drag & Drop
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    let duration = null;

    if (newStatus === 'REPAIRED') {
      const input = window.prompt("How many hours did this repair take?");
      if (input === null) return;
      duration = parseFloat(input) || 0;
    }

    const updatedRequests = requests.map(req => 
      req.id === parseInt(draggableId) ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);

    try {
      const payload = { status: newStatus };
      if (duration !== null) payload.duration = duration;
      await api.patch(`/requests/${draggableId}/status`, payload);
    } catch (err) {
      console.error("Failed to update status", err);
      loadData();
    }
  };

  // 3. Handle Breakdown Submit
  const handleBreakdownSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', {
        ...breakdownData,
        type: 'CORRECTIVE'
      });
      alert('Breakdown Reported!');
      setShowModal(false);
      setBreakdownData({ title: '', equipmentId: '', priority: 'MEDIUM' });
      loadData();
    } catch (err) {
      alert('Error reporting breakdown');
    }
  };

  // 4. Handle Assign To Me
  const handleAssignToMe = async (requestId) => {
    try {
      await assignRequest(requestId, currentUser.id);
      loadData(); 
    } catch (err) {
      alert("Failed to assign ticket");
    }
  };

  const getRequestsByStatus = (status) => requests.filter(r => r.status === status);

  // Helper for priority colors
  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-50 text-red-600 border-red-100';
      case 'MEDIUM': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm z-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Maintenance Board</h2>
          <p className="text-sm text-gray-500">Manage repair tickets and workflows</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Custom Select Wrapper */}
          <div className="relative group">
            <select 
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium text-sm hover:bg-gray-100"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="">All Teams View</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {/* Custom Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
               <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-rose-500/30 font-semibold flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Report Breakdown</span>
          </button>
        </div>
      </div>
      
      {/* BOARD CANVAS */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full min-w-max">
            {Object.values(columns).map(col => {
               const colRequests = getRequestsByStatus(col.id);
               return (
                <Droppable key={col.id} droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        w-80 flex flex-col rounded-2xl border transition-colors duration-200
                        ${col.color}
                        ${snapshot.isDraggingOver ? 'ring-2 ring-indigo-400 ring-opacity-50 bg-white' : ''}
                      `}
                    >
                      {/* COLUMN HEADER */}
                      <div className="p-4 flex items-center justify-between border-b border-gray-100/50">
                        <h3 className="font-bold text-gray-700 tracking-wide text-sm uppercase">{col.title}</h3>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${col.badge}`}>
                          {colRequests.length}
                        </span>
                      </div>
                      
                      {/* CARD LIST */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {colRequests.map((req, index) => {
                          const isOverdue = req.scheduledDate && new Date(req.scheduledDate) < new Date() && req.status !== 'REPAIRED';

                          return (
                            <Draggable key={req.id} draggableId={String(req.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`
                                    bg-white p-4 rounded-xl border border-gray-100 shadow-sm group
                                    hover:shadow-md transition-all duration-200 relative
                                    ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 z-50' : ''}
                                    ${isOverdue ? 'ring-1 ring-red-200 bg-red-50/10' : ''}
                                  `}
                                >
                                  {/* Overdue Indicator */}
                                  {isOverdue && (
                                    <div className="absolute top-3 right-3 flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </div>
                                  )}

                                  {/* Card Header */}
                                  <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getPriorityBadge(req.priority)}`}>
                                      {req.priority}
                                    </span>
                                  </div>

                                  <h4 className="font-semibold text-gray-800 text-sm leading-snug mb-1">{req.title}</h4>
                                  <div className="flex items-center text-xs text-gray-500 mb-4">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                                    {req.equipment ? req.equipment.name : 'Unknown Equipment'}
                                  </div>
                                  
                                  {/* Footer / Assignment */}
                                  <div className="flex justify-between items-center border-t border-gray-50 pt-3 mt-1">
                                    <span className="text-xs text-gray-400 font-mono">#{req.id}</span>
                                    
                                    {req.assignedTo ? (
                                      <div className="flex items-center gap-2 group/avatar cursor-help" title={`Assigned to ${req.assignedTo.name}`}>
                                        <span className="text-xs text-gray-500 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                            {req.assignedTo.name.split(' ')[0]}
                                        </span>
                                        {req.assignedTo.avatarUrl ? (
                                          <img src={req.assignedTo.avatarUrl} alt="" className="w-6 h-6 rounded-full border border-gray-200" />
                                        ) : (
                                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                                            {req.assignedTo.name.charAt(0)}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => handleAssignToMe(req.id)}
                                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-md font-medium transition-colors"
                                      >
                                        Assign Me
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* MODAL - GLASSMORPHISM STYLE */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/30 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden transform transition-all scale-100">
            <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-3">
               <div className="bg-red-100 p-2 rounded-full text-red-600">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <div>
                  <h3 className="text-lg font-bold text-gray-900">Report Breakdown</h3>
                  <p className="text-xs text-red-600 font-medium">Create a high priority ticket</p>
               </div>
            </div>
            
            <form onSubmit={handleBreakdownSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Issue Title</label>
                <input 
                  placeholder="e.g. Conveyor Belt Jammed" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                  value={breakdownData.title}
                  onChange={e => setBreakdownData({...breakdownData, title: e.target.value})}
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Affected Equipment</label>
                <div className="relative">
                    <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                    value={breakdownData.equipmentId}
                    onChange={e => setBreakdownData({...breakdownData, equipmentId: e.target.value})}
                    required
                    >
                    <option value="">Select Equipment...</option>
                    {equipmentList.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.serialNumber})</option>
                    ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Severity</label>
                <div className="grid grid-cols-3 gap-2">
                    {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setBreakdownData({...breakdownData, priority: p})}
                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                                breakdownData.priority === p 
                                ? 'bg-gray-800 text-white border-gray-800' 
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-500/30 transition-all transform active:scale-95">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}