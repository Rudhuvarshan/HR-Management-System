import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
  LogOut,
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Target,
  Banknote,
  Receipt,
  Briefcase,
  Menu,
  X,
  Bell,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard',   icon: LayoutDashboard, path: '/' },
  { name: 'Employees',   icon: Users,            path: '/employees' },
  { name: 'Attendance',  icon: Clock,            path: '/attendance' },
  { name: 'Leave',       icon: CalendarDays,     path: '/leave' },
  { name: 'Performance', icon: Target,           path: '/performance' },
  { name: 'Payroll',     icon: Banknote,         path: '/payroll' },
  { name: 'Expenses',    icon: Receipt,          path: '/expenses' },
  { name: 'Recruitment', icon: Briefcase,        path: '/recruitment' },
];

const SidebarLink = ({ item, onClick }) => (
  <NavLink
    to={item.path}
    end={item.path === '/'}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
        isActive
          ? 'bg-white/15 text-white shadow-sm'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <item.icon size={18} className={`shrink-0 ${isActive ? 'text-emerald-300' : 'text-slate-400 group-hover:text-emerald-300'} transition-colors`} />
        <span>{item.name}</span>
        {isActive && <ChevronRight size={14} className="ml-auto text-emerald-300" />}
      </>
    )}
  </NavLink>
);

const AdminLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || 'U';

  const SidebarContent = ({ onLinkClick }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center">
            <Briefcase size={18} className="text-emerald-300" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">HRMS</h1>
            <p className="text-slate-400 text-xs">Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-4 mb-3">Main Menu</p>
        {menuItems.map(item => (
          <SidebarLink key={item.name} item={item} onClick={onLinkClick} />
        ))}
      </nav>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-slate-400 text-xs truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-300 hover:text-red-400 w-full px-4 py-2.5 rounded-xl hover:bg-red-500/10 transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-inter overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 hidden md:flex flex-col shrink-0 shadow-xl">
        <SidebarContent onLinkClick={undefined} />
      </aside>

      {/* ── Mobile Overlay Sidebar ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col shadow-2xl">
            <SidebarContent onLinkClick={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 h-16 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <Menu size={20} />
            </button>
            {/* Breadcrumb placeholder */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <span className="text-slate-600 font-medium">HRMS Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                {avatarLetter}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
