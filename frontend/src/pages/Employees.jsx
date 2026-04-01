import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, Users } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL;

/* ── Shared styles ── */
const inputCls  = 'w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all placeholder-slate-400';
const labelCls  = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1';
const primaryBtn = 'flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl py-2.5 text-sm font-semibold shadow-sm shadow-emerald-200 transition-all duration-200 disabled:opacity-60';
const cancelBtn  = 'flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors';

/* ── Modal ── */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-2xl">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

/* ── Role badge ── */
const RoleBadge = ({ role }) => {
  const map = {
    Admin:    'bg-red-100 text-red-700',
    HR:       'bg-violet-100 text-violet-700',
    Manager:  'bg-amber-100 text-amber-700',
    Employee: 'bg-emerald-100 text-emerald-700',
    agent:    'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[role] || 'bg-slate-100 text-slate-600'}`}>
      {role}
    </span>
  );
};

/* ── Main ── */
const Employees = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData,  setFormData]  = useState({ name: '', email: '', password: '', role: 'Employee', department: '' });

  const isAdminOrHR = user.role === 'Admin' || user.role === 'HR';
  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/users`, config);
      setEmployees(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (user.role !== 'Employee') fetchEmployees();
    else setLoading(false);
  }, [user]);

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({ name: '', email: '', password: '', role: 'Employee', department: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setFormData({ name: emp.name, email: emp.email, password: '', role: emp.role, department: emp.department || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingEmp) {
        await axios.put(`${API}/users/${editingEmp._id}`, formData, config);
        alert('Employee updated successfully');
      } else {
        await axios.post(`${API}/users`, formData, config);
        alert('Employee added successfully');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save employee.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;
    try {
      await axios.delete(`${API}/users/${id}`, config);
      alert('Employee deleted successfully');
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  if (user.role === 'Employee') {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-slate-400 text-sm">You don't have permission to view the employee directory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employee Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">{employees.length} team members</p>
        </div>
        {isAdminOrHR && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-emerald-200 transition-all duration-200"
          >
            <Plus size={18} />
            Add Employee
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading employees…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Department</th>
                  {isAdminOrHR && <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-700 text-sm">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{emp.email}</td>
                    <td className="px-6 py-4"><RoleBadge role={emp.role} /></td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{emp.department || <span className="text-slate-300">—</span>}</td>
                    {isAdminOrHR && (
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(emp._id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={isAdminOrHR ? 5 : 4} className="px-6 py-16 text-center">
                      <Users size={36} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-slate-400 text-sm">No employees found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editingEmp ? 'Edit Employee' : 'Add Employee'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input className={inputCls} required value={formData.name} placeholder="John Doe" onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} required value={formData.email} placeholder="john@company.com" onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            {!editingEmp && (
              <div>
                <label className={labelCls}>Password</label>
                <input type="password" minLength="6" className={inputCls} required={!editingEmp} value={formData.password} placeholder="Min. 6 characters" onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Role</label>
                <select className={inputCls} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">HR</option>
                  <option value="agent">Agent</option>
                  {user.role === 'Admin' && <option value="Admin">Admin</option>}
                </select>
              </div>
              <div>
                <label className={labelCls}>Department</label>
                <input className={inputCls} placeholder="e.g. Engineering" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className={cancelBtn}>Cancel</button>
              <button type="submit" disabled={submitting} className={primaryBtn}>
                {submitting ? 'Saving…' : 'Save Employee'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Employees;
