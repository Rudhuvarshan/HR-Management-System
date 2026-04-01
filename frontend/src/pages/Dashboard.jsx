import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { Users, Clock, CalendarCheck, Briefcase, TrendingUp, ArrowRight } from 'lucide-react';
import axios from 'axios';

const StatCard = ({ title, value, icon: Icon, gradient, iconBg, loading }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 hover:shadow-md transition-shadow duration-300">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon size={24} className={gradient} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
      {loading ? (
        <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
      ) : (
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      )}
    </div>
  </div>
);

const QuickActionBtn = ({ label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`${color} p-4 rounded-xl font-medium text-sm flex items-center justify-between group hover:shadow-md transition-all duration-200`}
  >
    {label}
    <ArrowRight size={16} className="opacity-60 group-hover:translate-x-1 transition-transform" />
  </button>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ employees: 0, presentToday: 0, pendingLeaves: 0, openJobs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const empRes  = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`, config);
        const leaveRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/leave`, config);
        const jobsRes  = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/recruitment/jobs`);
        const pendingLeavesCount = leaveRes.data.filter(l => l.status === 'Pending').length;
        setStats({
          employees: empRes.data.length,
          presentToday: Math.floor(empRes.data.length * 0.9),
          pendingLeaves: pendingLeavesCount,
          openJobs: jobsRes.data.length
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user.role === 'Admin' || user.role === 'HR' || user.role === 'Manager') {
      fetchDashboardStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const statCards = [
    { title: 'Total Employees',  value: stats.employees,     icon: Users,         iconBg: 'bg-emerald-50', gradient: 'text-emerald-600' },
    { title: 'Present Today',    value: stats.presentToday,  icon: Clock,         iconBg: 'bg-teal-50',    gradient: 'text-teal-600' },
    { title: 'Pending Leaves',   value: stats.pendingLeaves, icon: CalendarCheck, iconBg: 'bg-amber-50',   gradient: 'text-amber-600' },
    { title: 'Open Jobs',        value: stats.openJobs,      icon: Briefcase,     iconBg: 'bg-violet-50',  gradient: 'text-violet-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Good morning, <span className="text-emerald-600">{user.name}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl font-medium">
          <TrendingUp size={14} />
          System Active
        </div>
      </div>

      {/* Admin / HR / Manager Stats */}
      {user.role !== 'Employee' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {statCards.map(card => (
            <StatCard key={card.title} {...card} loading={loading} />
          ))}
        </div>
      )}

      {/* Employee Quick Actions */}
      {user.role === 'Employee' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-2xl">
          <h2 className="text-base font-semibold text-slate-700 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionBtn label="Clock In"       color="bg-emerald-50 text-emerald-800 border border-emerald-100" />
            <QuickActionBtn label="Apply Leave"    color="bg-amber-50 text-amber-800 border border-amber-100" />
            <QuickActionBtn label="View Payslip"   color="bg-violet-50 text-violet-800 border border-violet-100" />
            <QuickActionBtn label="Submit Expense" color="bg-teal-50 text-teal-800 border border-teal-100" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
