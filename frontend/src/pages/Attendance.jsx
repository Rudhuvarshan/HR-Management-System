import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { Clock, LogIn, LogOut, CalendarDays } from 'lucide-react';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/attendance/history/${user._id}`,
          config
        );
        setHistory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const handleClockIn = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/attendance/clockin`, { location: { lat: 0, lng: 0 } }, config);
      alert('Clocked In successfully');
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/attendance/clockout`, {}, config);
      alert('Clocked Out successfully');
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to clock out');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Attendance Tracker</h1>
        <p className="text-sm text-slate-500 mt-0.5">Track your daily attendance</p>
      </div>

      {/* Clock In/Out Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Clock size={22} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Today's Attendance</h3>
              <p className="text-slate-500 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClockIn}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-emerald-200 transition-all duration-200"
            >
              <LogIn size={16} /> Clock In
            </button>
            <button
              onClick={handleClockOut}
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-red-200 transition-all duration-200"
            >
              <LogOut size={16} /> Clock Out
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <CalendarDays size={16} className="text-emerald-500" /> Attendance History
        </h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-3xl">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading history…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Clock In</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Clock Out</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        {record.clockIn ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                            <LogIn size={11} />{new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        {record.clockOut ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-600 px-2.5 py-1 rounded-lg">
                            <LogOut size={11} />{new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        {record.workHours ? (
                          <span className="text-sm font-semibold text-slate-700">{record.workHours.toFixed(2)}h</span>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center">
                        <Clock size={36} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 text-sm">No attendance records found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
