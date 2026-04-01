import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { Receipt, CheckCircle, XCircle, X, Plus, Paperclip } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL;

const inputCls   = 'w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all placeholder-slate-400';
const labelCls   = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1';
const primaryBtn = 'flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 disabled:opacity-60';
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
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-500'}`}>{status}</span>;
};

const Expenses = () => {
  const { user }  = useContext(AuthContext);
  const config    = { headers: { Authorization: `Bearer ${user.token}` } };

  const [expenses,   setExpenses]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Travel', receipt: null });

  const isAdmin = user.role !== 'Employee';

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/expenses' : '/expenses/my';
      const { data } = await axios.get(`${API}${endpoint}`, config);
      setExpenses(data);
    } catch { setError('Failed to load expense claims.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExpenses(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('amount', form.amount);
      formData.append('category', form.category);
      if (form.receipt) formData.append('receipt', form.receipt);
      await axios.post(`${API}/expenses`, formData, {
        headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
      });
      setShowSubmit(false);
      setForm({ title: '', amount: '', category: 'Travel', receipt: null });
      fetchExpenses();
    } catch (err) { alert(err.response?.data?.message || 'Failed to submit claim.'); }
    finally { setSubmitting(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await axios.put(`${API}/expenses/${id}/status`, { status }, config); fetchExpenses(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to update status.'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expense Claims</h1>
          <p className="text-sm text-slate-500 mt-0.5">{expenses.length} claim{expenses.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowSubmit(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-emerald-200 transition-all"
        >
          <Plus size={16} /> Submit Claim
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading expense claims…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Employee</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Title / Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{expense.employeeId?.name || 'Self'}</td>
                    <td className="px-6 py-4">
                      <span className="block text-sm font-semibold text-slate-700">{expense.title}</span>
                      <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{expense.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">${expense.amount}</td>
                    <td className="px-6 py-4"><StatusBadge status={expense.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {expense.receiptUrl && (
                          <a
                            href={expense.receiptUrl}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Paperclip size={12} /> Receipt
                          </a>
                        )}
                        {isAdmin && expense.status === 'Pending' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleStatusUpdate(expense._id, 'Approved')}
                              className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={17} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(expense._id, 'Rejected')}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={17} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <Receipt size={36} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-slate-400 text-sm">No expense claims found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Claim Modal */}
      {showSubmit && (
        <Modal title="Submit Expense Claim" onClose={() => setShowSubmit(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Title / Reason</label>
              <input className={inputCls} required placeholder="e.g. Client Dinner" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Amount ($)</label>
                <input type="number" step="0.01" className={inputCls} required placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select className={inputCls} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option>Travel</option>
                  <option>Meals</option>
                  <option>Supplies</option>
                  <option>Software</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Receipt (Optional)</label>
              <input type="file" className={`${inputCls} px-2`} accept="image/*,.pdf" onChange={e => setForm({ ...form, receipt: e.target.files[0] })} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowSubmit(false)} className={cancelBtn}>Cancel</button>
              <button type="submit" disabled={submitting} className={primaryBtn}>{submitting ? 'Submitting…' : 'Submit Claim'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Expenses;
