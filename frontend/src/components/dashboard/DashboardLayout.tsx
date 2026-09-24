import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  ClipboardList, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, switchRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    ...(user?.role === 'TUTOR' ? [
      { name: 'My Tutor Profile', path: '/dashboard/profile', icon: <User className="w-4 h-4" /> },
      { name: 'My Applications', path: '/dashboard/applications', icon: <Briefcase className="w-4 h-4" /> },
      { name: 'Find Tuition Jobs', path: '/job-board', icon: <GraduationCap className="w-4 h-4" /> },
    ] : [
      { name: 'My Requirements', path: '/dashboard/requirements', icon: <ClipboardList className="w-4 h-4" /> },
      { name: 'Post New Tuition', path: '/appoint-a-tutor', icon: <Sparkles className="w-4 h-4" /> },
      { name: 'Browse Tutors', path: '/find-tutor', icon: <User className="w-4 h-4" /> },
    ]),
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-navy-950 text-white p-4 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">TutorHub</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-20 h-screen w-64 bg-navy-950 text-slate-300 flex flex-col justify-between transition-all duration-200 ${
          sidebarOpen ? 'left-0' : '-left-64 md:left-0'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-white text-lg tracking-tight font-heading leading-tight">
                  Tutor<span className="text-brand-400">Hub</span>
                </h1>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  {user?.role} Portal
                </p>
              </div>
            </Link>
          </div>

          {/* User Preview */}
          <div className="p-4 mx-3 my-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <img
              src={user?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
              alt={user?.first_name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.first_name} {user?.last_name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-brand-400 shrink-0" />
                <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wide">Verified</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Actions & Role Switcher */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Switch Role Demo:</p>
            <div className="grid grid-cols-3 gap-1">
              {(['TUTOR', 'PARENT', 'ADMIN'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`py-1 rounded text-[10px] font-bold ${
                    user?.role === r ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {r === 'PARENT' ? 'Parent' : r === 'TUTOR' ? 'Tutor' : 'Admin'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
};
