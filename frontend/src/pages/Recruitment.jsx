import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { Briefcase, UserPlus, X, FileText, Check, XCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL;

const inputCls   = 'w-full mt-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all placeholder-slate-400';
const labelCls   = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1';
const primaryBtn = 'flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 disabled:opacity-60';
const cancelBtn  = 'flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const AppStatusBadge = ({ status }) => {
  const map = {
    Applied:      'bg-teal-100 text-teal-700',
    Reviewed:     'bg-amber-100 text-amber-700',
    Interviewing: 'bg-violet-100 text-violet-700',
    Hired:        'bg-emerald-100 text-emerald-700',
    Rejected:     'bg-red-100 text-red-700',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-500'}`}>{status}</span>;
};

const Recruitment = () => {
  const { user } = useContext(AuthContext);
  const config   = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

  const [jobs,         setJobs]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');
  const [showPostJob,  setShowPostJob]  = useState(false);
  const [showApplyJob, setShowApplyJob] = useState(null);
  const [showApps,     setShowApps]     = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading,  setAppsLoading]  = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', department: 'Engineering', description: '', requirements: '' });
  const [appForm, setAppForm] = useState({ applicantName: user?.name || '', email: user?.email || '', coverLetter: '', resume: null });

  const isAdmin = user && user.role !== 'Employee';

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/recruitment/jobs`);
      setJobs(data);
    } catch { setError('Failed to load job postings.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handlePostJob = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await axios.post(`${API}/recruitment/jobs`, {
        ...jobForm,
        requirements: jobForm.requirements.split(',').map(r => r.trim())
      }, config);
      setShowPostJob(false);
      setJobForm({ title: '', department: 'Engineering', description: '', requirements: '' });
      fetchJobs();
    } catch (err) { alert(err.response?.data?.message || 'Failed to post job.'); }
    finally { setSubmitting(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!appForm.resume) return alert('Resume is required.');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('jobId', showApplyJob._id);
      formData.append('applicantName', appForm.applicantName);
      formData.append('email', appForm.email);
      formData.append('coverLetter', appForm.coverLetter);
      formData.append('resume', appForm.resume);
      await axios.post(`${API}/recruitment/applications`, formData, {
        headers: { ...(user ? config.headers : {}), 'Content-Type': 'multipart/form-data' }
      });
      setShowApplyJob(null);
      setAppForm({ ...appForm, coverLetter: '', resume: null });
      alert('Application submitted successfully!');
    } catch (err) { alert(err.response?.data?.message || 'Failed to submit application.'); }
    finally { setSubmitting(false); }
  };

  const loadApplications = async (job) => {
    setShowApps(job); setAppsLoading(true);
    try {
      const { data } = await axios.get(`${API}/recruitment/jobs/${job._id}/applications`, config);
      setApplications(data);
    } catch { alert('Failed to load applications.'); }
    finally { setAppsLoading(false); }
  };

  const handleAppStatus = async (appId, status) => {
    try { await axios.put(`${API}/recruitment/applications/${appId}/status`, { status }, config); loadApplications(showApps); }
    catch (err) { alert(err.response?.data?.message || 'Failed to update status.'); }
  };

  const handleCloseJob = async (id) => {
    if (!window.confirm('Are you sure you want to close this job?')) return;
    try { await axios.put(`${API}/recruitment/jobs/${id}/close`, {}, config); fetchJobs(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to close job.'); }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job and all applications?')) return;
    try { await axios.delete(`${API}/recruitment/jobs/${id}`, config); fetchJobs(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete job.'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Recruitment Portal</h1>
          <p className="text-sm text-slate-500 mt-0.5">{jobs.length} open position{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowPostJob(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-emerald-200 transition-all"
          >
            <UserPlus size={16} /> Post New Job
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse h-56" />
          ))
        ) : jobs.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Briefcase size={40} className="mx-auto text-slate-200 mb-3" />
            <h3 className="font-semibold text-slate-600">No Open Positions</h3>
            <p className="text-slate-400 text-sm mt-1">There are no active job postings available.</p>
          </div>
        ) : jobs.map((job) => (
          <div key={job._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm shadow-emerald-200">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">OPEN</span>
            </div>

            <h3 className="font-bold text-lg text-slate-800 mb-1 leading-snug">{job.title}</h3>
            <p className="text-teal-600 text-xs font-bold mb-3 uppercase tracking-wider">{job.department}</p>
            <p className="text-slate-400 text-sm mb-5 line-clamp-3 leading-relaxed flex-1">{job.description}</p>

            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-400">
                {new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {isAdmin ? (
                <div className="flex gap-1.5">
                  <button onClick={() => loadApplications(job)} className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap">Apps</button>
                  <button onClick={() => handleCloseJob(job._id)} className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-colors">Close</button>
                  <button onClick={() => handleDeleteJob(job._id)} className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors">Delete</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyJob(job)}
                  className="inline-flex items-center gap-1.5 text-white font-semibold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-4 py-2 rounded-xl shadow-sm shadow-emerald-200 transition-all"
                >
                  <Check size={13} /> Apply Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Post Job Modal */}
      {showPostJob && (
        <Modal title="Post New Job" onClose={() => setShowPostJob(false)}>
          <form onSubmit={handlePostJob} className="space-y-4">
            <div>
              <label className={labelCls}>Job Title</label>
              <input className={inputCls} required placeholder="e.g. Senior Frontend Developer" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Department</label>
              <select className={inputCls} value={jobForm.department} onChange={e => setJobForm({ ...jobForm, department: e.target.value })}>
                {['Engineering','Design','HR','Marketing','Sales','Support'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows="4" required placeholder="Describe the role…" value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Requirements (comma-separated)</label>
              <input className={inputCls} required placeholder="e.g. React, Node.js, 3+ years" value={jobForm.requirements} onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowPostJob(false)} className={cancelBtn}>Cancel</button>
              <button type="submit" disabled={submitting} className={primaryBtn}>{submitting ? 'Posting…' : 'Post Job'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Apply Job Modal */}
      {showApplyJob && (
        <Modal title={`Apply: ${showApplyJob.title}`} onClose={() => setShowApplyJob(null)}>
          <form onSubmit={handleApply} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Your Name</label>
                <input className={inputCls} required value={appForm.applicantName} onChange={e => setAppForm({ ...appForm, applicantName: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Your Email</label>
                <input type="email" className={inputCls} required value={appForm.email} onChange={e => setAppForm({ ...appForm, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Cover Letter / Message</label>
              <textarea className={inputCls} rows="4" placeholder="Tell us why you are a great fit…" value={appForm.coverLetter} onChange={e => setAppForm({ ...appForm, coverLetter: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Resume (PDF/Doc)</label>
              <input type="file" required className={`${inputCls} px-2`} accept=".pdf,.doc,.docx" onChange={e => setAppForm({ ...appForm, resume: e.target.files[0] })} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowApplyJob(null)} className={cancelBtn}>Cancel</button>
              <button type="submit" disabled={submitting} className={primaryBtn}>{submitting ? 'Submitting…' : 'Submit Application'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Applications Modal */}
      {showApps && (
        <Modal title={`Applicants — ${showApps.title}`} onClose={() => setShowApps(null)}>
          {appsLoading ? (
            <div className="py-12 text-center">
              <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading applications…</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center">
              <UserPlus size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm">No applications received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app._id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 hover:bg-white transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{app.applicantName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{app.email}</p>
                    </div>
                    <AppStatusBadge status={app.status} />
                  </div>
                  {app.coverLetter && (
                    <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-500 italic">
                      "{app.coverLetter}"
                    </div>
                  )}
                  <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-200 pt-3">
                    <a
                      href={app.resumeUrl?.startsWith('http') ? app.resumeUrl : `${API.replace('/api', '')}/${app.resumeUrl?.replace(/\\/g, '/')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <FileText size={13} /> View Resume
                    </a>
                    <select
                      className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 text-slate-700"
                      value={app.status}
                      onChange={(e) => handleAppStatus(app._id, e.target.value)}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Recruitment;
