import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProfileImageUpload } from '../common/ProfileImageUpload';

export const LearnerProfile: React.FC = () => {
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
      showToast('Profile information updated successfully.', 'success');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update account profile.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-navy-950 via-slate-900 to-navy-900 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-brand-400/20 shrink-0 overflow-hidden">
            {user?.profile_image ? (
              <img src={user.profile_image} alt={user.first_name} className="h-full w-full object-cover" />
            ) : (
              <span>{user?.first_name?.[0] || 'U'}</span>
            )}
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold uppercase tracking-wider">
              {user?.role === 'STUDENT' ? 'Student Account' : 'Guardian / Parent Account'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-white mt-1">
              {user?.full_name || `${firstName} ${lastName}`.trim() || user?.email}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Manage your personal contact details and active tuition requests.
            </p>
          </div>
        </div>

        <Link
          to="/appoint-a-tutor"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          Post Tuition
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Identity & Photo Upload Overview */}
        <div className="space-y-6">

          {/* Photo Uploader Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Profile Photo
            </h3>
            <div className="pt-2 flex justify-center sm:justify-start">
              <ProfileImageUpload user={user} size="md" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Account Information
            </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 font-medium block text-[11px]">Email Address</span>
              <strong className="text-slate-900 text-xs break-all">{user?.email}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 font-medium block text-[11px]">Account Type</span>
              <strong className="text-slate-900 text-xs">{user?.role}</strong>
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
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black font-heading text-slate-900">
                Personal Contact Information
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure your phone number is updated so tutors and coordinators can reach you.
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
                placeholder="e.g. Asif"
                required
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Rahman"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                helperText="Primary contact number for tuition coordination."
                required
              />
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Linked to your TutorHub sign in."
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Save Details
              </Button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
