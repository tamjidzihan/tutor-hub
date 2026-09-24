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
import { CheckCircle2, Save, ShieldCheck } from 'lucide-react';

export const DashboardProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tutorId, setTutorId] = useState('');

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    university: '',
    department: '',
    expected_salary: 8000,
    city: 'Dhaka',
    area: '',
    bio: ''
  });

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const loadProfile = async () => {
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
            expected_salary: tutorData.expected_salary || 8000,
            city: tutorData.city || 'Dhaka',
            area: tutorData.area || 'Mirpur',
            bio: tutorData.bio || ''
          });
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tutorsApi.updateMyProfile({
        university: formData.university,
        department: formData.department,
        city: formData.city,
        area: formData.area,
        expected_salary: Number(formData.expected_salary),
        bio: formData.bio
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
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

        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
          
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <img
              src={user?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={user?.first_name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500"
            />
            <div>
              <h4 className="text-sm font-bold text-slate-900">{formData.first_name} {formData.last_name}</h4>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200 mt-1">
                <ShieldCheck className="w-3 h-3" />
                Verified Tutor Profile ({tutorId || 'TT-T-019842'})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
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
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="University / Institution"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              required
            />
            <Input
              label="Department / Major"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              options={cities.map(c => c.name)}
            />
            <Input
              label="Area"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            />
            <Input
              label="Expected Salary (৳ / mo)"
              type="number"
              value={formData.expected_salary}
              onChange={(e) => setFormData({ ...formData, expected_salary: Number(e.target.value) })}
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
