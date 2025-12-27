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

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/requests');
      // Filter for PREVENTIVE and map to Calendar format
      const calendarEvents = res.data
        .filter(req => req.type === 'PREVENTIVE' && req.scheduledDate)
        .map(req => ({
          title: `${req.title} (${req.equipment?.name || 'Unknown'})`,
          start: new Date(req.scheduledDate),
          end: new Date(req.scheduledDate),
          allDay: true,
          resource: req
        }));
      setEvents(calendarEvents);
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };

  const handleSelectSlot = async ({ start }) => {
    const title = prompt("Enter Preventive Maintenance Title:");
    if (!title) return;

    // Hardcoding Equipment ID 1 for speed - In real app, use a modal
    try {
      await api.post('/requests', {
        title,
        description: "Scheduled via Calendar",
        type: "PREVENTIVE",
        priority: "MEDIUM",
        equipmentId: 1, // Defaulting to first equipment
        scheduledDate: start
      });
      alert("Scheduled!");
      fetchEvents(); // Refresh
    } catch (err) {
      alert("Error scheduling");
      console.error(err);
    }
  };

  return (
    <div className="h-[600px] bg-white p-4 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Preventive Maintenance Schedule</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelectSlot}
        eventPropGetter={() => ({
          style: { backgroundColor: '#3b82f6', color: 'white' }
        })}
      />
    </div>
  );
}