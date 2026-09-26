import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { locationsApi, type LocationCity } from '../api/locations';
import { tutorsApi } from '../api/tutors';
import { authApi } from '../api/auth';
import { getApiErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  CheckCircle2,
  Save,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  MapPin,
  BookOpen,
  DollarSign,
  UserCheck,
  Plus,
  AlertCircle,
  Eye
} from 'lucide-react';

const POPULAR_SUBJECTS = [
  'Physics', 'Higher Math', 'Chemistry', 'Biology',
  'General Math', 'English', 'ICT', 'Accounting',
  'Economics', 'Pure Math (O/A Level)', 'Bangla', 'Spoken English',
  'Statistics', 'Finance', 'General Science'
];

const TARGET_CLASSES = [
  'Class 1 to 5', 'Class 6 to 8', 'Class 9', 'Class 10 (SSC)',
  'HSC (Science)', 'HSC (Commerce/Arts)', 'O Level', 'A Level', 'Admission Prep'
];

const CURRICULUMS = [
  'Bangla Medium', 'English Version', 'Edexcel (English Medium)', 'Cambridge (English Medium)'
];

const TUTORING_TYPES = [
  'Home Tutoring', 'Online Tutoring', 'Batch Tutoring', 'Crash Course'
];

const DHAKA_AREAS = [
  'Mirpur', 'Uttara', 'Dhanmondi', 'Gulshan', 'Banani',
  'Mohammadpur', 'Badda', 'Bashundhara R/A', 'Khilgaon',
  'Farmgate', 'Lalmatia', 'Malibagh', 'Rampura', 'Paltan'
];

export const DashboardProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tutorId, setTutorId] = useState('');
  const [error, setError] = useState('');

  // Custom additions input state
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [customAreaInput, setCustomAreaInput] = useState('');

  const [formData, setFormData] = useState({
    // User info
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    profile_photo_url: '',
    headline: '',
    
    // Academic info
    university: '',
    department: '',
    degree_title: 'B.Sc Engineering',
    passing_year: '2024',
    cgpa: '3.85 / 4.00',
    experience_years: 1,

    // Location & Rate
    city: 'Dhaka',
    area: '',
    expected_salary: 8000,
    is_available: true,
    nid_or_birth_cert: '',

    // Preferences & Scope (JSON arrays)
    subjects: [] as string[],
    classes: [] as string[],
    curriculums: [] as string[],
    preferred_locations: [] as string[],
    tutoring_types: ['Home Tutoring'] as string[],
    bio: '',
    
    // Status
    is_verified: false,
    profile_completion_score: 85
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
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            phone: user?.phone || '',
            email: user?.email || '',
            gender: tutorData.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
            profile_photo_url: tutorData.profile_photo || '',
            headline: (tutorData as any).headline || '',
            university: tutorData.university || '',
            department: tutorData.department || '',
            degree_title: tutorData.education_level || 'B.Sc Engineering',
            passing_year: String(tutorData.graduation_year || '2024'),
            cgpa: (tutorData as any).cgpa || '3.85 / 4.00',
            experience_years: tutorData.experience_years || 1,
            city: tutorData.city || 'Dhaka',
            area: tutorData.area || '',
            expected_salary: tutorData.expected_salary || 8000,
            is_available: tutorData.is_available ?? true,
            nid_or_birth_cert: (tutorData as any).nid_or_birth_cert || '',
            subjects: tutorData.subjects?.length ? tutorData.subjects : ['Physics', 'Higher Math'],
            classes: tutorData.preferred_classes?.length ? tutorData.preferred_classes : ['Class 9', 'Class 10 (SSC)'],
            curriculums: (tutorData as any).curriculums?.length ? (tutorData as any).curriculums : ['English Version'],
            preferred_locations: tutorData.preferred_locations?.length ? tutorData.preferred_locations : ['Mirpur', 'Dhanmondi'],
            tutoring_types: tutorData.preferred_tuition_type?.length ? tutorData.preferred_tuition_type : ['Home Tutoring'],
            bio: tutorData.bio || '',
            is_verified: Boolean(tutorData.is_verified),
            profile_completion_score: tutorData.profile_completion || 85
          });
        }
      } catch {
        setError('Unable to load your profile details.');
      } finally {
        setInitialLoading(false);
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

  // Toggle helper for multi-select arrays
  const toggleItemInList = (field: 'subjects' | 'classes' | 'curriculums' | 'tutoring_types' | 'preferred_locations', item: string) => {
    setFormData((prev) => {
      const list = prev[field];
      const exists = list.includes(item);
      return {
        ...prev,
        [field]: exists ? list.filter((i) => i !== item) : [...list, item]
      };
    });
  };

  // Add custom item helper
  const addCustomSubject = () => {
    if (!customSubjectInput.trim()) return;
    if (!formData.subjects.includes(customSubjectInput.trim())) {
      setFormData((prev) => ({ ...prev, subjects: [...prev.subjects, customSubjectInput.trim()] }));
    }
    setCustomSubjectInput('');
  };

  const addCustomArea = () => {
    if (!customAreaInput.trim()) return;
    if (!formData.preferred_locations.includes(customAreaInput.trim())) {
      setFormData((prev) => ({ ...prev, preferred_locations: [...prev.preferred_locations, customAreaInput.trim()] }));
    }
    setCustomAreaInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Update basic user account details
      const updatedUser = await authApi.updateCurrentUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      });

      // 2. Update all tutor profile details in database
      const updatedProfile = await tutorsApi.saveTutorOnboarding({
        gender: formData.gender,
        headline: formData.headline,
        university: formData.university,
        department: formData.department,
        degree_title: formData.degree_title,
        passing_year: formData.passing_year,
        cgpa: formData.cgpa,
        city: formData.city,
        area: formData.area,
        expected_salary: Number(formData.expected_salary),
        experience_years: Number(formData.experience_years),
        subjects: formData.subjects,
        preferred_classes: formData.classes,
        curriculums: formData.curriculums,
        preferred_locations: formData.preferred_locations,
        preferred_tuition_type: formData.tutoring_types,
        bio: formData.bio,
        nid_number: formData.nid_or_birth_cert,
        profile_photo: formData.profile_photo_url,
        is_available: formData.is_available
      });

      if (updatedProfile?.tutor_id) {
        setTutorId(updatedProfile.tutor_id);
      }

      setFormData((current) => ({
        ...current,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        phone: updatedUser.phone,
        profile_completion_score: updatedProfile.profile_completion || current.profile_completion_score
      }));

      showToast('Tutor profile successfully updated in database!', 'success');
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save your profile. Please review the fields and try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="rounded-3xl bg-white p-12 text-center text-sm font-medium text-slate-500 shadow-card border border-slate-200">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading your tutor profile...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              My Tutor Profile
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure your academic credentials, subject specialization, preferred locations, and remuneration.
            </p>
          </div>

          {tutorId && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-xl bg-navy-950 text-brand-400 font-mono text-xs font-bold shadow-xs">
                ID: {tutorId}
              </span>
              <a
                href={`/hub/tutor-details/${tutorId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 text-xs font-bold transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Public View</span>
              </a>
            </div>
          )}
        </div>

        {/* Success Alert */}
        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in duration-200 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Profile information and preferences updated successfully in database!</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-center gap-2" role="alert">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* Section 1: Profile Header & Availability */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <img
                  src={formData.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={formData.first_name}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-2 ring-brand-500 shadow-sm"
                />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900">
                    {formData.first_name} {formData.last_name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {formData.is_verified ? 'Verified Teacher' : 'Pending Verification'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {formData.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 self-stretch sm:self-auto justify-between sm:justify-start">
                <div>
                  <p className="text-xs font-bold text-slate-900">Accepting Tuitions</p>
                  <p className="text-[10px] text-slate-500">Visible to students</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.is_available ? 'bg-brand-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formData.is_available ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Profile Photo URL Input */}
            <div>
              <Input
                label="Profile Photo URL"
                value={formData.profile_photo_url}
                onChange={(e) => setFormData({ ...formData, profile_photo_url: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                helperText="Enter a direct image URL for your profile avatar."
              />
            </div>

            {/* Headline */}
            <div>
              <Input
                label="Professional Headline"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g. BUET EEE | 4+ Years Experienced Physics & Higher Math Specialist"
                helperText="A brief one-line statement highlighting your academic strengths."
              />
            </div>
          </div>

          {/* Section 2: Personal & Contact Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
            <h3 className="text-lg font-black text-slate-900 font-heading border-b border-slate-100 pb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-brand-600" />
              Personal & Contact Information
            </h3>

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
                label="Registered Email Address"
                type="email"
                value={formData.email}
                disabled
                helperText="Primary registered email (cannot be changed)."
              />
              <Input
                label="Mobile Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                helperText="Used for SMS alerts and direct parent communication."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'MALE' })}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      formData.gender === 'MALE'
                        ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'FEMALE' })}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      formData.gender === 'FEMALE'
                        ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <Input
                label="National ID (NID) / Birth Certificate"
                value={formData.nid_or_birth_cert}
                onChange={(e) => setFormData({ ...formData, nid_or_birth_cert: e.target.value })}
                placeholder="e.g. 1998XXXXXXXXXXXXX"
                helperText="Kept private. Used for tutor verification."
              />
            </div>
          </div>

          {/* Section 3: Educational Qualifications */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
            <h3 className="text-lg font-black text-slate-900 font-heading border-b border-slate-100 pb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              Educational Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="University / Institution"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                placeholder="e.g. BUET, Dhaka University, NSU"
                required
              />
              <Input
                label="Department / Major"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Computer Science & Engineering"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Degree Title"
                value={formData.degree_title}
                onChange={(e) => setFormData({ ...formData, degree_title: e.target.value })}
                placeholder="e.g. B.Sc in CSE"
              />
              <Input
                label="Graduation / Passing Year"
                value={formData.passing_year}
                onChange={(e) => setFormData({ ...formData, passing_year: e.target.value })}
                placeholder="2024"
              />
              <Input
                label="CGPA / Standing"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                placeholder="3.85 / 4.00"
              />
            </div>
          </div>

          {/* Section 4: Remuneration & Location */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
            <h3 className="text-lg font-black text-slate-900 font-heading border-b border-slate-100 pb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-brand-600" />
              Location & Expected Remuneration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="City / District"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                options={cities.map((c) => c.name)}
              />
              <Input
                label="Living Area / Neighborhood"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g. Mirpur 10"
              />
              <Input
                label="Expected Salary (৳ BDT / mo)"
                type="number"
                value={formData.expected_salary}
                onChange={(e) => setFormData({ ...formData, expected_salary: Number(e.target.value) })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Teaching Experience (Years)"
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                min={0}
              />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tutoring Mediums Offered
                </label>
                <div className="flex flex-wrap gap-2">
                  {TUTORING_TYPES.map((type) => {
                    const isSelected = formData.tutoring_types.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleItemInList('tutoring_types', type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Teaching Subjects & Classes (Missing Fields Added!) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
            <h3 className="text-lg font-black text-slate-900 font-heading border-b border-slate-100 pb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              Subjects & Class Specialization
            </h3>

            {/* Subjects Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Teaching Subjects ({formData.subjects.length} selected)
              </label>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {POPULAR_SUBJECTS.map((sub) => {
                  const isSelected = formData.subjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleItemInList('subjects', sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{sub}
                    </button>
                  );
                })}
              </div>

              {/* Custom Subject Addition Input */}
              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="Add another subject..."
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSubject();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={addCustomSubject}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>

            {/* Target Classes Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Targeted Classes / Grade Levels ({formData.classes.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {TARGET_CLASSES.map((cls) => {
                  const isSelected = formData.classes.includes(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => toggleItemInList('classes', cls)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{cls}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Targeted Curriculums */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Curriculums & Mediums
              </label>
              <div className="flex flex-wrap gap-2">
                {CURRICULUMS.map((curr) => {
                  const isSelected = formData.curriculums.includes(curr);
                  return (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => toggleItemInList('curriculums', curr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{curr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 6: Preferred Tuition Areas */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
            <h3 className="text-lg font-black text-slate-900 font-heading border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              Preferred Tuition Areas in {formData.city}
            </h3>
            <p className="text-xs text-slate-500">
              Select neighborhoods you are willing to commute to for home tuition.
            </p>

            <div className="flex flex-wrap gap-2">
              {DHAKA_AREAS.map((area) => {
                const isSelected = formData.preferred_locations.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleItemInList('preferred_locations', area)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📍 {area}
                  </button>
                );
              })}
            </div>

            {/* Custom Area Addition Input */}
            <div className="flex gap-2 max-w-sm pt-2">
              <input
                type="text"
                placeholder="Add custom neighborhood area..."
                value={customAreaInput}
                onChange={(e) => setCustomAreaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomArea();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="button"
                onClick={addCustomArea}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Section 7: Bio & Statement */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
            <h3 className="text-lg font-black text-slate-900 font-heading border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              Teaching Philosophy & Bio
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                About You / Teaching Statement
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Highlight your teaching approach, background, previous student success results, and personal strengths..."
                className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Detailed teaching bios help parents understand your communication skills and methodology.
              </p>
            </div>
          </div>

          {/* Save Action Footer */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-card sticky bottom-4 z-20">
            <div className="text-xs text-slate-500 hidden sm:block">
              All changes are directly synchronized with the TutorHub database.
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              leftIcon={<Save className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Save Profile Changes
            </Button>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
};
