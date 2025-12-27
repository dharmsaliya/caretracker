import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../api';

const columns = {
  NEW: { id: 'NEW', title: 'To Do', color: 'bg-gray-100' },
  IN_PROGRESS: { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50' },
  REPAIRED: { id: 'REPAIRED', title: 'Done', color: 'bg-green-50' },
  SCRAP: { id: 'SCRAP', title: 'Scrap', color: 'bg-red-50' }
};

export default function KanbanBoard() {
  const [requests, setRequests] = useState([]);
  
  // Modal State for "Report Breakdown"
  const [showModal, setShowModal] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]);
  const [breakdownData, setBreakdownData] = useState({
    title: '',
    equipmentId: '',
    priority: 'MEDIUM'
  });

  // 1. Fetch Data on Load
  useEffect(() => {
    fetchRequests();
    fetchEquipment();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
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

  // 2. Handle the Drag Event
  const onDragEnd = async (result) => {
    if (!result.destination) return; 
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId; 
    let duration = null;

    // Prompt for hours if moving to REPAIRED
    if (newStatus === 'REPAIRED') {
      const input = window.prompt("How many hours did this repair take?");
      if (input === null) return; 
      duration = parseFloat(input) || 0;
    }

    // Optimistic Update
    const updatedRequests = requests.map(req => 
      req.id === parseInt(draggableId) ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);

    // Call API
    try {
      const payload = { status: newStatus };
      if (duration !== null) payload.duration = duration;
      await api.patch(`/requests/${draggableId}/status`, payload);
    } catch (err) {
      console.error("Failed to update status", err);
      fetchRequests();
    }
  };

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
      fetchRequests();
    } catch (err) {
      alert('Error reporting breakdown');
    }
  };

  const getRequestsByStatus = (status) => requests.filter(r => r.status === status);

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Maintenance Board</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow font-bold flex items-center gap-2"
        >
          <span>🚨 Report Breakdown</span>
        </button>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {Object.values(columns).map(col => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-w-[300px] p-4 rounded-xl shadow-sm ${col.color} flex flex-col`}
                >
                  <h3 className="font-bold text-gray-700 mb-4 flex justify-between">
                    {col.title}
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs shadow-sm">
                      {getRequestsByStatus(col.id).length}
                    </span>
                  </h3>
                  
                  <div className="flex-1 space-y-3">
                    {getRequestsByStatus(col.id).map((req, index) => (
                      <Draggable key={req.id} draggableId={String(req.id)} index={index}>
                        {(provided) => {
                          // --- NEW LOGIC: Check if Overdue ---
                          const isOverdue = req.scheduledDate && 
                                            new Date(req.scheduledDate) < new Date() && 
                                            req.status !== 'REPAIRED';

                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-grab relative overflow-hidden
                                ${isOverdue ? 'border-red-500 border-l-4' : 'border-gray-200'}
                              `}
                            >
                              {/* OVERDUE BADGE */}
                              {isOverdue && (
                                <div className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 mb-2 inline-block rounded">
                                  ! Overdue
                                </div>
                              )}

                              <h4 className="font-semibold text-gray-800">{req.title}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {req.equipment ? req.equipment.name : 'Unknown Equipment'}
                              </p>
                              
                              <div className="flex justify-between items-center mt-3">
                                <span className={`text-xs px-2 py-1 rounded font-medium 
                                  ${req.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 
                                    req.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 
                                    'bg-green-100 text-green-700'}`}>
                                  {req.priority}
                                </span>

                                {/* --- NEW: AVATAR DISPLAY --- */}
                                {req.assignedTo && (
                                  <div className="flex items-center gap-2" title={req.assignedTo.name}>
                                    {req.assignedTo.avatarUrl ? (
                                      <img 
                                        src={req.assignedTo.avatarUrl} 
                                        alt={req.assignedTo.name} 
                                        className="w-8 h-8 rounded-full border border-gray-300" 
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                                        {req.assignedTo.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Breakdown Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-red-700">Report Breakdown</h3>
            <form onSubmit={handleBreakdownSubmit} className="space-y-4">
              <input 
                placeholder="Title (e.g. Screen Broken)" 
                className="w-full p-2 border rounded"
                value={breakdownData.title}
                onChange={e => setBreakdownData({...breakdownData, title: e.target.value})}
                required 
              />
              <select 
                className="w-full p-2 border rounded"
                value={breakdownData.equipmentId}
                onChange={e => setBreakdownData({...breakdownData, equipmentId: e.target.value})}
                required
              >
                <option value="">Select Equipment...</option>
                {equipmentList.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name} ({eq.serialNumber})</option>
                ))}
              </select>
              <select 
                className="w-full p-2 border rounded"
                value={breakdownData.priority}
                onChange={e => setBreakdownData({...breakdownData, priority: e.target.value})}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}