import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    ...(user?.role === 'TUTOR' ? [
      { name: 'My Tutor Profile', path: '/dashboard/profile', icon: <User className="w-4 h-4" /> },
      { name: 'My Applications', path: '/dashboard/applications', icon: <Briefcase className="w-4 h-4" /> },
      { name: 'Find Tuition Jobs', path: '/dashboard/jobs', icon: <GraduationCap className="w-4 h-4" /> },
    ] : [
      { name: 'My Requirements', path: '/dashboard/requirements', icon: <ClipboardList className="w-4 h-4" /> },
      { name: 'Post New Tuition', path: '/appoint-a-tutor', icon: <Sparkles className="w-4 h-4" /> },
      { name: 'Browse Tutors', path: '/find-tutor', icon: <User className="w-4 h-4" /> },
    ]),
    { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell className="w-4 h-4" /> },
  ];

  // Helper to determine page title
  const getPageTitle = () => {
    if (location.pathname === '/dashboard/profile') return 'Tutor Profile';
    if (location.pathname === '/dashboard/applications') return 'Applications';
    if (location.pathname === '/dashboard/jobs') return 'Find Tuition Jobs';
    if (location.pathname === '/dashboard/requirements') return 'My Requirements';
    if (location.pathname === '/dashboard/notifications') return 'Notifications';
    return 'Dashboard Overview';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-navy-950 text-slate-300 flex flex-col justify-between transition-all duration-200 shrink-0 ${
          sidebarOpen ? 'left-0 shadow-2xl' : '-left-64 md:left-0'
        }`}
      >
        <div>
          {/* Logo & Close Button for Mobile */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
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
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Preview Mini Card */}
          <div className="p-4 mx-3 my-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.first_name}
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-brand-500"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 font-black text-white text-sm shadow-xs">
                {user?.first_name?.[0] || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-brand-400 shrink-0" />
                <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wide">
                  {user?.is_verified ? 'Verified' : 'Active Account'}
                </span>
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
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Public Website
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Wrapper with Top Navigation Bar */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Global Dashboard Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3.5 shadow-xs flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="hidden sm:inline font-bold text-slate-400">TutorHub</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold text-[11px] border border-brand-200">
                {user?.role === 'TUTOR' ? 'Tutor Portal' : user?.role === 'ADMIN' ? 'Admin Portal' : 'Parent Portal'}
              </span>
              <span className="hidden md:inline text-slate-300">/</span>
              <span className="hidden md:inline font-black text-slate-800 font-heading text-sm">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Right: Quick Action Shortcuts & User Profile Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Context-Specific Quick Action Shortcuts */}
            {user?.role === 'TUTOR' && (
              <Link
                to="/dashboard/jobs"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 text-xs font-bold transition-all shadow-xs"
              >
                <GraduationCap className="w-3.5 h-3.5 text-brand-600" />
                <span>Find Tuition Jobs</span>
              </Link>
            )}

            {user?.role === 'PARENT' && (
              <Link
                to="/appoint-a-tutor"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 text-white hover:bg-brand-600 text-xs font-bold transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Post Requirement</span>
              </Link>
            )}

            {/* Notifications Button */}
            <Link
              to="/dashboard/notifications"
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
            </Link>

            {/* Back to Public Site Link */}
            <Link
              to="/"
              className="hidden lg:inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              title="Go to Home"
            >
              <span>Main Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* User Profile Chip */}
            <Link
              to={user?.role === 'TUTOR' ? '/dashboard/profile' : '/dashboard'}
              className="flex items-center gap-2.5 p-1 sm:px-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.first_name}
                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-brand-500"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-brand-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {user?.first_name?.[0] || 'U'}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  {user?.email}
                </p>
              </div>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
};
