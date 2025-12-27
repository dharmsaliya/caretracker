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
          allDay: true,
          resource: req
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
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.equipmentId) return alert("Please fill all fields");

    try {
      await api.post('/requests', {
        title: formData.title,
        description: "Scheduled via Calendar",
        type: "PREVENTIVE",
        priority: "MEDIUM",
        equipmentId: parseInt(formData.equipmentId),
        scheduledDate: selectedSlot
      });
      
      setShowModal(false);
      setFormData({ title: '', equipmentId: '' });
      fetchEvents();
    } catch (err) {
      alert("Error scheduling");
      console.error(err);
    }
  };

  // --- UI: Custom Event Style ---
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: '#4f46e5',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '0.85rem',
        fontWeight: '500'
      }
    };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* CSS Overrides including Agenda Styling */}
      <style>{`
        .rbc-calendar { font-family: inherit; }
        /* Toolbar Buttons */
        .rbc-toolbar button { color: #374151; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 1rem; font-weight: 500; transition: all 0.2s; }
        .rbc-toolbar button:hover { background-color: #f9fafb; border-color: #d1d5db; }
        .rbc-toolbar button.rbc-active { background-color: #4f46e5; color: white; border-color: #4f46e5; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3); }
        .rbc-toolbar-label { font-size: 1.25rem; font-weight: 700; color: #111827; }
        
        /* General Views */
        .rbc-header { padding: 12px 0; font-weight: 600; color: #6b7280; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #f3f4f6; }
        .rbc-month-view { border: 1px solid #e5e7eb; border-radius: 1rem; background: white; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f3f4f6; }
        .rbc-off-range-bg { background-color: #f9fafb; }
        .rbc-date-cell { padding: 8px; font-weight: 600; color: #374151; font-size: 0.9rem; }
        .rbc-today { background-color: #eff6ff; }

        /* AGENDA VIEW SPECIFIC STYLES */
        .rbc-agenda-view table.rbc-agenda-table { border: 0; }
        .rbc-agenda-view table.rbc-agenda-table thead > tr > th { border-bottom: 2px solid #e5e7eb; padding: 12px; }
        .rbc-agenda-view table.rbc-agenda-table tbody > tr > td { padding: 16px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; cursor: pointer; }
        .rbc-agenda-view table.rbc-agenda-table tbody > tr:hover { background-color: #f8fafc; }
        
        /* Agenda Date Column */
        .rbc-agenda-date-cell { font-weight: 700; color: #fff; }
        
        /* Agenda Time Column */
        .rbc-agenda-time-cell { text-transform: uppercase; font-size: 0.75rem; font-weight: 800; color: #fff; letter-spacing: 0.05em; }
        
        /* Agenda Event Title */
        .rbc-agenda-event-cell { color: #fff; font-weight: 600; font-size: 0.95rem; }
      `}</style>

      {/* Header Card */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Preventive Schedule</h2>
          <p className="text-gray-500 mt-1">Plan and manage upcoming equipment maintenance.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></span>
          Preventive Task
        </div>
      </div>

      {/* Calendar Container */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 h-[750px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          selectable
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          // ADDED 'agenda' HERE
          views={['month', 'week', 'day', 'agenda']} 
        />
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-gray-100">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Schedule Maintenance</h3>
                <p className="text-xs text-indigo-600 font-medium">
                  {selectedSlot && format(selectedSlot, 'MMMM do, yyyy')}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Task Title</label>
                <input
                  className="w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder-gray-400"
                  placeholder="e.g. Hydraulic Pump Check"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Equipment</label>
                <div className="relative">
                  <select
                    className="w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none cursor-pointer"
                    value={formData.equipmentId}
                    onChange={e => setFormData({...formData, equipmentId: e.target.value})}
                  >
                    <option value="">Select Equipment...</option>
                    {equipmentList.map(eq => (
                      <option key={eq.id} value={eq.id}>{eq.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}