import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function MaintenanceCalendar() {
  const [events, setEvents] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({ title: '', equipmentId: '' });

  useEffect(() => {
    fetchEvents();
    fetchEquipment();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/requests');
      const calendarEvents = res.data
        .filter(req => req.type === 'PREVENTIVE' && req.scheduledDate)
        .map(req => ({
          title: `${req.title} - ${req.equipment?.name || 'Unknown'}`,
          start: new Date(req.scheduledDate),
          end: new Date(req.scheduledDate),
          allDay: true
        }));
      setEvents(calendarEvents);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEquipment = async () => {
    try {
      const res = await api.get('/equipment');
      setEquipmentList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedSlot(start);
    setShowModal(true); // Open the modal instead of prompt
  };

  const handleSave = async () => {
    if (!formData.title || !formData.equipmentId) return alert("Please fill all fields");

    try {
      await api.post('/requests', {
        title: formData.title,
        description: "Scheduled via Calendar",
        type: "PREVENTIVE",
        priority: "MEDIUM",
        equipmentId: parseInt(formData.equipmentId), // Ensure ID is an integer
        scheduledDate: selectedSlot
      });
      
      setShowModal(false);
      setFormData({ title: '', equipmentId: '' });
      fetchEvents(); // Refresh calendar
    } catch (err) {
      alert("Error scheduling");
      console.error(err);
    }
  };

  return (
    <div className="h-[600px] bg-white p-4 shadow rounded-lg relative">
      <h2 className="text-2xl font-bold mb-4">Preventive Schedule</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelectSlot}
      />

      {/* CUSTOM MODAL FOR SCHEDULING */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4">Schedule Maintenance</h3>
            <p className="text-gray-600 mb-4">Date: {selectedSlot?.toDateString()}</p>
            
            <input
              className="w-full border p-2 mb-3 rounded"
              placeholder="Task Title (e.g. Oil Change)"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
            
            <select
              className="w-full border p-2 mb-4 rounded"
              value={formData.equipmentId}
              onChange={e => setFormData({...formData, equipmentId: e.target.value})}
            >
              <option value="">Select Equipment...</option>
              {equipmentList.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
            
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}