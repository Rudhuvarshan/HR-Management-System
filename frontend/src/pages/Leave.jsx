import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { CalendarDays, CheckCircle, XCircle, X, Plus } from 'lucide-react';

const inputCls  = 'w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all placeholder-slate-400';
const labelCls  = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1';
const primaryBtn = 'flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl py-2.5 text-sm font-semibold shadow-sm shadow-emerald-200 transition-all duration-200';
const cancelBtn  = 'flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-red-100 text-red-700',
    Pending:  'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
};

const Leave = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const endpoint = user.role !== 'Employee' ? '/leave' : '/leave/my';
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, config);
        setLeaves(data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchLeaves();
  }, [user]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/leave`, formData, config);
      alert('Leave Applied Successfully');
      setShowApplyModal(false);
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to apply leave');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/leave/${id}/status`, { status }, config);
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update leave');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leave Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{leaves.length} leave request{leaves.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-emerald-200 transition-all duration-200"
        >
          <Plus size={16} /> Apply Leave
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading leave requests…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Employee</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Dates</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Reason</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                  {user.role !== 'Employee' && <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{leave.employeeId?.name || 'Self'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm max-w-[200px] truncate">{leave.reason}</td>
                    <td className="px-6 py-4"><StatusBadge status={leave.status} /></td>
                    {user.role !== 'Employee' && (
                      <td className="px-6 py-4">
                        {leave.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                              className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={user.role !== 'Employee' ? 6 : 5} className="px-6 py-16 text-center">
                      <CalendarDays size={36} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-slate-400 text-sm">No leave requests found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <Modal title="Apply for Leave" onClose={() => setShowApplyModal(false)}>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className={labelCls}>Leave Type</label>
              <select className={inputCls} value={formData.leaveType} onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}>
                <option>Casual</option>
                <option>Sick</option>
                <option>Paid</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Start Date</label>
                <input type="date" required className={inputCls} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>End Date</label>
                <input type="date" required className={inputCls} value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Reason</label>
              <textarea required className={inputCls} rows="3" placeholder="Briefly describe your reason…" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowApplyModal(false)} className={cancelBtn}>Cancel</button>
              <button type="submit" className={primaryBtn}>Submit Request</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Leave;
