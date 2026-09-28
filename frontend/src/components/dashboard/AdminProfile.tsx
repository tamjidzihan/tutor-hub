import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import {
  ShieldCheck,
  UserCheck,
  Calendar,
  Activity,
  CheckCircle2,
  AlertCircle,
  Key,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProfileImageUpload } from '../common/ProfileImageUpload';

export const AdminProfile: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSavedSuccess(false);

    try {
      await authApi.updateCurrentUser({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      });
      showToast('Admin profile details updated successfully.', 'success');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update administrator profile.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-navy-950 via-slate-900 to-navy-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-brand-400/20 shrink-0 overflow-hidden">
            {user?.profile_image ? (
              <img src={user.profile_image} alt={user.first_name} className="h-full w-full object-cover" />
            ) : (
              <span>{user?.first_name?.[0] || 'A'}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
                System Administrator
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                Superuser Access
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
              {user?.full_name || `${firstName} ${lastName}`.trim() || user?.email}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Full platform governance, resource inspection, and moderation authority.
            </p>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0 self-start md:self-auto"
        >
          <Activity className="w-4 h-4" />
          Governance Console
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Admin Identity & Avatar Upload Card */}
        <div className="space-y-6">

          {/* Profile Photo Uploader Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Administrator Photo
            </h3>
            <div className="pt-2 flex justify-center sm:justify-start">
              <ProfileImageUpload user={user} size="md" />
            </div>
          </div>

          {/* Identity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Administrative Identity
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-medium block text-[11px]">Registered Email</span>
                <strong className="text-slate-900 text-xs break-all">{user?.email}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-medium block text-[11px]">Administrator UUID</span>
                <strong className="font-mono text-[11px] text-slate-700 break-all">{user?.id || 'System Generated'}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-medium block text-[11px]">System Role Authority</span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-900 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Administrator ({user?.role})
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-medium block text-[11px]">Member Since</span>
                <span className="inline-flex items-center gap-1 text-slate-700 mt-0.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {user?.date_joined ? new Date(user.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* System Security & Access Info */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-600" />
              Authentication & Security
            </h3>
            
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span>Session Type</span>
                <strong className="text-slate-900">JWT Bearer Token</strong>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span>Staff Permission</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">Granted</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span>Superuser Status</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">Active</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span>API Endpoint Access</span>
                <strong className="text-slate-900">/api/v1/dashboard/admin/</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Profile Edit Form & Quick Management Controls */}
        <div className="lg:col-span-2 space-y-6">

          {/* Edit Profile Form */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black font-heading text-slate-900">
                  Administrator Personal Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your display name and contact credentials for internal platform logs.
                </p>
              </div>
              {savedSuccess && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Admin"
                  required
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Manager"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  helperText="Primary contact number for administrator communications."
                />
                <Input
                  label="Administrator Email"
                  value={user?.email || ''}
                  disabled
                  helperText="Login email address (managed securely by backend)."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Save Profile Details
                </Button>
              </div>
            </form>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Governance Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/dashboard"
                className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-brand-400 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    User Management
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Review and delete user accounts</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
              </Link>

              <Link
                to="/dashboard"
                className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-brand-400 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    Tutor Verification
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Approve or reject tutor documents</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
              </Link>

              <Link
                to="/dashboard"
                className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-brand-400 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    Tuition Jobs Moderation
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Moderate active job postings</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
              </Link>

              <Link
                to="/dashboard"
                className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-brand-400 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    Tuition Requirements
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Track parent tutor requests</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
