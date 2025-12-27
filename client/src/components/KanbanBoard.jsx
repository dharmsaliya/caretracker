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
  
  // NEW: State for "Report Breakdown" Modal
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
    fetchEquipment(); // Fetch equipment for the dropdown in the modal
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
    if (!result.destination) return; // Dropped outside
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId; // e.g., "IN_PROGRESS"
    let duration = null;

    // --- REQUIREMENT: Prompt for hours if moving to REPAIRED ---
    if (newStatus === 'REPAIRED') {
      const input = window.prompt("How many hours did this repair take?");
      if (input === null) return; // User cancelled the prompt, cancel the drag
      duration = parseFloat(input) || 0;
    }

    // Optimistic Update (Update UI immediately)
    const updatedRequests = requests.map(req => 
      req.id === parseInt(draggableId) ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);

    // Call API to save change
    try {
      const payload = { status: newStatus };
      if (duration !== null) payload.duration = duration;

      await api.patch(`/requests/${draggableId}/status`, payload);
    } catch (err) {
      console.error("Failed to update status", err);
      fetchRequests(); // Revert on error
    }
  };

  // 3. Handle New Breakdown Report Submit
  const handleBreakdownSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', {
        ...breakdownData,
        type: 'CORRECTIVE' // Hardcoded as per instructions
      });
      alert('Breakdown Reported!');
      setShowModal(false);
      setBreakdownData({ title: '', equipmentId: '', priority: 'MEDIUM' });
      fetchRequests(); // Refresh board
    } catch (err) {
      console.error("Failed to report breakdown", err);
      alert('Error reporting breakdown');
    }
  };

  // Helper to filter tickets for a specific column
  const getRequestsByStatus = (status) => requests.filter(r => r.status === status);

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Maintenance Board</h2>
        
        {/* NEW: Report Breakdown Button */}
        <button 
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow font-bold flex items-center gap-2"
        >
          <span>🚨 Report Breakdown</span>
        </button>
      </div>
      
      {/* The Drag & Drop Context Area */}
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
                  
                  {/* The Cards in this Column */}
                  <div className="flex-1 space-y-3">
                    {getRequestsByStatus(col.id).map((req, index) => (
                      <Draggable key={req.id} draggableId={String(req.id)} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab"
                          >
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
                            </div>
                          </div>
                        )}
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

      {/* NEW: Breakdown Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-red-700">Report Breakdown</h3>
            <form onSubmit={handleBreakdownSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Screen Broken"
                  className="w-full p-2 border rounded mt-1"
                  value={breakdownData.title}
                  onChange={e => setBreakdownData({...breakdownData, title: e.target.value})}
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700">Equipment</label>
                <select 
                  className="w-full p-2 border rounded mt-1"
                  value={breakdownData.equipmentId}
                  onChange={e => setBreakdownData({...breakdownData, equipmentId: e.target.value})}
                  required
                >
                  <option value="">Select Equipment...</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.serialNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Priority</label>
                <select 
                  className="w-full p-2 border rounded mt-1"
                  value={breakdownData.priority}
                  onChange={e => setBreakdownData({...breakdownData, priority: e.target.value})}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}