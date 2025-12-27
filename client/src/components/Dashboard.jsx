import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import api from '../api';

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch stats from the backend
    api.get('/stats').then(res => setData(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-[500px]">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Team Workload Report</h2>
      
      {data.length === 0 ? (
        <p className="text-gray-500 italic">No data to display yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}