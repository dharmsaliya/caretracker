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

  // 1. Fetch Data on Load
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  // 2. Handle the Drag Event
  const onDragEnd = async (result) => {
    if (!result.destination) return; // Dropped outside
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId; // e.g., "IN_PROGRESS"

    // Optimistic Update (Update UI immediately before API finishes)
    const updatedRequests = requests.map(req => 
      req.id === parseInt(draggableId) ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);

    // Call API to save change
    try {
      await api.patch(`/requests/${draggableId}/status`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      fetchRequests(); // Revert on error
    }
  };

  // Helper to filter tickets for a specific column
  const getRequestsByStatus = (status) => requests.filter(r => r.status === status);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Maintenance Board</h2>
      
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
    </div>
  );
}