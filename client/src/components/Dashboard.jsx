import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import api from '../api';

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/stats')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const totalRequests = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-8">

      {/* PAGE HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Overview of maintenance workload by team
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <p className="text-sm text-slate-500">Total Teams</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">
            {data.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <p className="text-sm text-slate-500">Total Requests</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {totalRequests}
          </p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <p className="text-sm text-slate-500">Average / Team</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {data.length ? Math.round(totalRequests / data.length) : 0}
          </p>
        </div>
      </div>

      {/* CHART CARD */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 h-[420px]">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-slate-800">
            Team Workload
          </h3>
          <p className="text-sm text-slate-500">
            Number of maintenance requests handled by each team
          </p>
        </div>

        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 italic">
            No data available yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                fill="#2563eb"
                barSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
