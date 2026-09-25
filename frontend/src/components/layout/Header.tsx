import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Phone,
  Mail,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Search,
  PlusCircle,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Tutor', path: '/find-tutor' },
    { name: 'Job Board', path: '/job-board' },
    { name: 'Become A Tutor', path: '/become-a-tutor' },
    { name: 'Affiliate', path: '/affiliate-program' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.05)]">
      {/* Top Banner Bar */}
      <div className="hidden md:block border-b border-slate-800/80 bg-[#08131f] text-slate-300 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-6">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-brand-400" />
              <span>Helpline: <strong className="text-white">+880 1894-800900</strong> (9 AM - 10 PM)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-brand-400" />
              <span>support@tutorhub.com.bd</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-1 rounded border border-brand-700/60 bg-brand-950/80 px-2 py-0.5 font-medium text-brand-300">
              <ShieldCheck className="w-3 h-3" />
              100% Verified Tutors & Security Guaranteed
            </span>

          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl  shadow-lg shadow-[#00261A]/20 transition-transform duration-200 group-hover:scale-105">
              <img
                src="/favicon.svg"
                alt="TutorHub logo"
                className="h-11 w-11 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-2xl font-black tracking-tight text-slate-900">
                Tutor<span className="text-brand-500">Hub</span>
              </span>
              <span className="-mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Tuition Terminal BD
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center space-x-1 lg:flex xl:space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-brand-600'} `
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action CTAs & Auth */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              to="/appoint-a-tutor"
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-brand-500 bg-white px-4 py-2.5 text-sm font-bold text-brand-700 shadow-sm transition-all hover:bg-brand-50 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-brand-600" />
              Request a Tutor
            </Link>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  {user.profile_image ? <img src={user.profile_image} alt={user.first_name} className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-500/30" /> : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">{user.first_name?.[0] || '?'}</div>}
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {user.first_name}
                    </p>
                    <span className="text-[10px] font-semibold text-brand-600 uppercase">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
                      <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </Link>

                    {user.role === 'TUTOR' && (
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Tutor Profile
                      </Link>
                    )}

                    <Link
                      to="/dashboard/applications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      {user.role === 'TUTOR' ? 'My Applications' : 'My Requirements'}
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-brand-500/20 transition-all hover:bg-brand-600 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <Link
              to="/appoint-a-tutor"
              className="p-2 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold"
            >
              Post Requirement
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <Link
              to="/find-tutor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-xs font-bold text-slate-800"
            >
              <Search className="w-4 h-4 text-brand-500" />
              Find Tutor
            </Link>
            <Link
              to="/job-board"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-xs font-bold text-slate-800"
            >
              <Briefcase className="w-4 h-4 text-brand-500" />
              Tuition Jobs
            </Link>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-brand-50 hover:text-brand-600"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    {user.profile_image ? <img src={user.profile_image} alt={user.first_name} className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-bold text-white">{user.first_name?.[0] || '?'}</div>}
                    <div>
                      <p className="font-bold text-sm text-slate-900">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-brand-600 font-semibold">{user.role}</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-bold"
                  >
                    Dashboard
                  </Link>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 text-red-600 font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-lg border border-slate-300 font-bold text-sm text-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-lg bg-brand-500 text-white font-bold text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
