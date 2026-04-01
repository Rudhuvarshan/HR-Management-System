import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { Target, Star, Edit, X, Plus } from 'lucide-react';

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

const statusStyle = (s) =>
  s === 'Completed'   ? 'bg-emerald-100 text-emerald-700' :
  s === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-500';

const StarRating = ({ rating }) => (
  <span className="text-sm tracking-tight">
    {[1,2,3,4,5].map(n => (
      <span key={n} className={n <= rating ? 'text-amber-400' : 'text-slate-200'}>★</span>
    ))}
  </span>
);

const Performance = () => {
  const { user } = useContext(AuthContext);
  const config   = { headers: { Authorization: `Bearer ${user.token}` } };

  const [goals,      setGoals]      = useState([]);
  const [employees,  setEmployees]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const [showAssign, setShowAssign] = useState(false);
  const [showUpdate, setShowUpdate] = useState(null);
  const [showReview, setShowReview] = useState(null);

  const [assignForm, setAssignForm] = useState({ employeeId: '', title: '', description: '', dueDate: '' });
  const [updateForm, setUpdateForm] = useState({ status: 'In Progress', selfReview: '' });
  const [reviewForm, setReviewForm] = useState({ managerFeedback: '', rating: 3 });

  const isAdmin = user.role !== 'Employee';

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/performance' : '/performance/my';
      const { data } = await axios.get(`${API}${endpoint}`, config);
      setGoals(data);
    } catch { setError('Failed to load goals.'); }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    if (!isAdmin) return;
    try { const { data } = await axios.get(`${API}/users`, config); setEmployees(data); } catch { /* silent */ }
  };

  useEffect(() => { fetchGoals(); fetchEmployees(); }, [user]);

  const handleAssign = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await axios.post(`${API}/performance`, assignForm, config);
      setShowAssign(false);
      setAssignForm({ employeeId: '', title: '', description: '', dueDate: '' });
      fetchGoals();
    } catch (err) { alert(err.response?.data?.message || 'Failed to assign goal.'); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await axios.put(`${API}/performance/${showUpdate._id}`, updateForm, config);
      setShowUpdate(null); fetchGoals();
    } catch (err) { alert(err.response?.data?.message || 'Failed to update goal.'); }
    finally { setSubmitting(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await axios.put(`${API}/performance/${showReview._id}/review`, reviewForm, config);
      setShowReview(null); fetchGoals();
    } catch (err) { alert(err.response?.data?.message || 'Failed to submit review.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Performance &amp; Goals</h1>
          <p className="text-sm text-slate-500 mt-0.5">{goals.length} goal{goals.length !== 1 ? 's' : ''} tracked</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAssign(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-emerald-200 transition-all"
          >
            <Plus size={16} /> Assign Goal
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-52" />
          ))
        ) : goals.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Target size={40} className="mx-auto text-slate-200 mb-3" />
            <h3 className="font-semibold text-slate-600">No Goals Found</h3>
            <p className="text-slate-400 text-sm mt-1">No performance goals have been assigned yet.</p>
          </div>
        ) : goals.map((goal) => (
          <div key={goal._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
            {/* Top row */}
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Target size={18} className="text-emerald-600" />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle(goal.status)}`}>
                {goal.status}
              </span>
            </div>

            <h3 className="font-bold text-slate-800 mb-1 leading-snug">{goal.title}</h3>
            <p className="text-slate-400 text-sm mb-3 line-clamp-2 flex-1">{goal.description}</p>

            {isAdmin && (
              <p className="text-xs text-teal-600 font-semibold mb-2 flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xs shrink-0">
                  {goal.employeeId?.name?.charAt(0) || '?'}
                </span>
                {goal.employeeId?.name || 'Unknown'}
              </p>
            )}

            {goal.selfReview && (
              <p className="text-xs text-slate-400 italic bg-slate-50 px-3 py-2 rounded-lg mb-2">
                Self: "{goal.selfReview}"
              </p>
            )}
            {goal.managerFeedback && (
              <p className="text-xs text-violet-600 italic bg-violet-50 px-3 py-2 rounded-lg mb-2">
                Manager: "{goal.managerFeedback}"
              </p>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-2">
              <span className="text-xs text-slate-400">Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
              {goal.rating && <StarRating rating={goal.rating} />}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              {!isAdmin && goal.status !== 'Completed' && (
                <button
                  onClick={() => { setUpdateForm({ status: goal.status, selfReview: goal.selfReview || '' }); setShowUpdate(goal); }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl py-2 transition-colors"
                >
                  <Edit size={13} /> Update Progress
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => { setReviewForm({ managerFeedback: goal.managerFeedback || '', rating: goal.rating || 3 }); setShowReview(goal); }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl py-2 transition-colors"
                >
                  <Star size={13} /> Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assign Goal Modal */}
      {showAssign && (
        <Modal title="Assign New Goal" onClose={() => setShowAssign(false)}>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className={labelCls}>Assign To</label>
              <select className={inputCls} required value={assignForm.employeeId} onChange={e => setAssignForm({ ...assignForm, employeeId: e.target.value })}>
                <option value="">Select employee…</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Goal Title</label>
              <input className={inputCls} required placeholder="e.g. Improve customer satisfaction" value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows="3" required placeholder="Describe the goal…" value={assignForm.description} onChange={e => setAssignForm({ ...assignForm, description: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Due Date</label>
              <input type="date" className={inputCls} required value={assignForm.dueDate} onChange={e => setAssignForm({ ...assignForm, dueDate: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowAssign(false)} className={cancelBtn}>Cancel</button>
              <button type="submit" disabled={submitting} className={primaryBtn}>{submitting ? 'Assigning…' : 'Assign Goal'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Update Progress Modal */}
      {showUpdate && (
        <Modal title={`Update: ${showUpdate.title}`} onClose={() => setShowUpdate(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Not Started</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Self Review / Notes</label>
              <textarea className={inputCls} rows="3" placeholder="Describe your progress…" value={updateForm.selfReview} onChange={e => setUpdateForm({ ...updateForm, selfReview: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowUpdate(null)} className={cancelBtn}>Cancel</button>
              <button type="submit" disabled={submitting} className={primaryBtn}>{submitting ? 'Saving…' : 'Save Update'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manager Review Modal */}
      {showReview && (
        <Modal title={`Review: ${showReview.title}`} onClose={() => setShowReview(null)}>
          <form onSubmit={handleReview} className="space-y-4">
            <div>
              <label className={labelCls}>Manager Feedback</label>
              <textarea className={inputCls} rows="3" required placeholder="Provide your feedback…" value={reviewForm.managerFeedback} onChange={e => setReviewForm({ ...reviewForm, managerFeedback: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Rating (1–5)</label>
              <div className="flex gap-2 mt-1">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n} type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                      reviewForm.rating >= n
                        ? 'bg-amber-400 border-amber-400 text-white shadow-sm'
                        : 'border-slate-200 text-slate-300 hover:bg-amber-50 hover:border-amber-200'
                    }`}
                  >
                    {n}★
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowReview(null)} className={cancelBtn}>Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Performance;
