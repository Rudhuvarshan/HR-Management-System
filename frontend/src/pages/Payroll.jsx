import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { Banknote, FileText, CheckCircle, X, Plus, Printer } from 'lucide-react';

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

const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
    status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
  }`}>{status}</span>
);

const Payroll = () => {
  const { user }   = useContext(AuthContext);
  const config     = { headers: { Authorization: `Bearer ${user.token}` } };

  const [payrolls,  setPayrolls]  = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [submitting,setSubmitting]= useState(false);
  const [error,     setError]     = useState('');
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [form, setForm] = useState({
    employeeId: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    baseSalary: '', allowances: '', deductions: ''
  });

  const isAdmin = user.role !== 'Employee';

  const fetchData = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/payroll' : '/payroll/my';
      const { data } = await axios.get(`${API}${endpoint}`, config);
      setPayrolls(data);
    } catch { setError('Failed to load payroll records.'); }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    if (!isAdmin) return;
    try { const { data } = await axios.get(`${API}/users`, config); setEmployees(data); } catch { /* silent */ }
  };

  useEffect(() => { fetchData(); fetchEmployees(); }, [user]);

  const handleGenerate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await axios.post(`${API}/payroll`, {
        ...form,
        baseSalary: Number(form.baseSalary),
        allowances: Number(form.allowances) || 0,
        deductions: Number(form.deductions) || 0
      }, config);
      setShowGenerate(false);
      setForm({ ...form, employeeId: '', baseSalary: '', allowances: '', deductions: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to generate payroll.'); }
    finally { setSubmitting(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await axios.put(`${API}/payroll/${id}/status`, { status }, config); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to update status.'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payroll Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{payrolls.length} payroll record{payrolls.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowGenerate(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-emerald-200 transition-all duration-200"
          >
            <Plus size={16} /> Generate Payroll
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading payroll records…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Employee</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Period</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Net Salary</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payrolls.map((pay) => (
                  <tr key={pay._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{pay.employeeId?.name || 'Self'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{pay.month} {pay.year}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">${pay.netSalary.toLocaleString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={pay.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPayslip(pay)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <FileText size={13} /> Payslip
                        </button>
                        {isAdmin && pay.status === 'Pending' && (
                          <button
                            onClick={() => handleStatusUpdate(pay._id, 'Paid')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle size={13} /> Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {payrolls.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <Banknote size={36} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-slate-400 text-sm">No payroll records found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerate && (
        <Modal title="Generate Payroll" onClose={() => setShowGenerate(false)}>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className={labelCls}>Employee</label>
              <select className={inputCls} required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
                <option value="">Select employee…</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Month</label>
                <select className={inputCls} value={form.month} onChange={e => setForm({ ...form, month: e.target.value })}>
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Year</label>
                <input type="number" className={inputCls} min="2000" max="2100" required value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Base Salary ($)</label>
              <input type="number" className={inputCls} required placeholder="0.00" value={form.baseSalary} onChange={e => setForm({ ...form, baseSalary: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Allowances ($)</label>
                <input type="number" className={inputCls} placeholder="0.00" value={form.allowances} onChange={e => setForm({ ...form, allowances: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Deductions ($)</label>
                <input type="number" className={inputCls} placeholder="0.00" value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowGenerate(false)} className={cancelBtn}>Cancel</button>
              <button type="submit" disabled={submitting} className={primaryBtn}>{submitting ? 'Generating…' : 'Generate'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Payslip Modal */}
      {selectedPayslip && (
        <Modal title="Payslip" onClose={() => setSelectedPayslip(null)}>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 rounded-xl">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Employee</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPayslip.employeeId?.name || 'Self'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Period</p>
                <p className="font-semibold text-slate-700 mt-0.5">{selectedPayslip.month} {selectedPayslip.year}</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              {[
                { label: 'Base Salary',  value: `$${selectedPayslip.baseSalary?.toLocaleString() || 0}`,  color: 'text-slate-700' },
                { label: '+ Allowances', value: `$${selectedPayslip.allowances?.toLocaleString() || 0}`,  color: 'text-emerald-600' },
                { label: '− Deductions', value: `$${selectedPayslip.deductions?.toLocaleString() || 0}`,  color: 'text-red-500' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span className={`text-sm font-semibold ${row.color}`}>{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-slate-800">Net Salary</span>
                <span className="text-xl font-bold text-emerald-600">${selectedPayslip.netSalary?.toLocaleString() || 0}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => setSelectedPayslip(null)} className={cancelBtn}>Close</button>
              <button onClick={() => window.print()} className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">
                <Printer size={15} /> Print / PDF
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Payroll;
