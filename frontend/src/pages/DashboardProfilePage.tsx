import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { locationsApi } from '../api/locations';
import type { LocationCity } from '../api/locations';
import { tutorsApi } from '../api/tutors';
import { authApi } from '../api/auth';
import { getApiErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, Save, ShieldCheck } from 'lucide-react';

export const DashboardProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tutorId, setTutorId] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    university: '',
    department: '',
    expected_salary: 0,
    city: '',
    area: '',
    bio: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.role !== 'TUTOR') return;
      try {
        const [citiesData, tutorData] = await Promise.all([
          locationsApi.getCities(),
          tutorsApi.getMyProfile()
        ]);
        setCities(citiesData);
        if (tutorData) {
          setTutorId(tutorData.tutor_id);
          setFormData({
            first_name: tutorData.name?.split(' ')[0] || user?.first_name || '',
            last_name: tutorData.name?.split(' ').slice(1).join(' ') || user?.last_name || '',
            phone: user?.phone || '',
            email: user?.email || '',
            university: tutorData.university || '',
            department: tutorData.department || '',
            expected_salary: tutorData.expected_salary ?? 0,
            city: tutorData.city || '',
            area: tutorData.area || '',
            bio: tutorData.bio || ''
          });
        }
      } catch {
        setSaved(false);
      }
    };
    loadProfile();
  }, [user]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'TUTOR') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updatedUser = await authApi.updateCurrentUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      });
      await tutorsApi.updateMyProfile({
        university: formData.university,
        department: formData.department,
        city: formData.city,
        area: formData.area,
        expected_salary: Number(formData.expected_salary),
        bio: formData.bio
      });
      setFormData((current) => ({ ...current, first_name: updatedUser.first_name, last_name: updatedUser.last_name, phone: updatedUser.phone }));
      showToast('Profile changes saved successfully.', 'success');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save your profile. Please review the fields and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-black text-slate-900 font-heading">
            Tutor Profile Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Update your academic profile information, contact numbers, and teaching preferences.
          </p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile information updated successfully in database!</span>
          </div>
        )}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700" role="alert">{error}</div>}

        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">

          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            {user.profile_image ? <img src={user.profile_image} alt={user.first_name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-500" /> : <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-xl font-bold text-white">{user.first_name?.[0] || '?'}</div>}
            <div>
              <h4 className="text-sm font-bold text-slate-900">{formData.first_name} {formData.last_name}</h4>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200 mt-1">
                <ShieldCheck className="w-3 h-3" />
                {tutorId ? `Tutor Profile (${tutorId})` : 'Tutor Profile'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              helperText="Shown on your public tutor profile."
              required
            />
            <Input
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              helperText="Shown on your public tutor profile."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              disabled
              helperText="Primary registered email."
            />
            <Input
              label="Contact Mobile"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              helperText="Used for verified contact and account recovery."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="University / Institution"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              helperText="Add the institution where you study or graduated."
              required
            />
            <Input
              label="Department / Major"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              helperText="For example: CSE, English, or Mathematics."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              helperText="Choose the city where you accept tuition requests."
              options={cities.map(c => c.name)}
            />
            <Input
              label="Area"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              helperText="Add nearby areas you can travel to."
            />
            <Input
              label="Expected Salary (৳ / mo)"
              type="number"
              value={formData.expected_salary}
              onChange={(e) => setFormData({ ...formData, expected_salary: Number(e.target.value) })}
              helperText="Your expected monthly tutoring rate in BDT."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              About / Teaching Statement
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <p className="mt-1 text-xs text-slate-500">Describe your teaching approach, experience, and strengths for guardians.</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
};
