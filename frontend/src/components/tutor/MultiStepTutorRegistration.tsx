import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Upload,
  DollarSign,
  UserCheck,
  GraduationCap,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { locationsApi, type LocationCity } from '../../api/locations';
import { tutorsApi } from '../../api/tutors';
import { authApi } from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const MultiStepTutorRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [cities, setCities] = useState<LocationCity[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [registeredTutorId, setRegisteredTutorId] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Account Information (Used when guest / unauthenticated)
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    // Personal Information
    gender: 'MALE' as 'MALE' | 'FEMALE',
    date_of_birth: '',
    present_address: '',
    city: 'Dhaka',
    area: '',
    // Education
    university: '',
    department: '',
    degree: 'B.Sc Engineering',
    graduation_year: new Date().getFullYear(),
    // Subjects & Classes
    subjects: [] as string[],
    preferred_classes: [] as string[],
    preferred_tuition_type: ['Home Tutoring'] as ('Home Tutoring' | 'Online' | 'Batch' | 'Crash Course')[],
    // Locations
    preferred_locations: [] as string[],
    // Experience & Salary
    experience_years: 1,
    expected_salary: 8000,
    bio: '',
    // Photos & ID
    profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    nid_number: ''
  });

  // Fetch cities on load
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await locationsApi.getCities();
        setCities(data);
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    };
    fetchCities();
  }, []);

  // Pre-fill user & profile data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        first_name: user.first_name || prev.first_name,
        last_name: user.last_name || prev.last_name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));

      // Fetch existing profile if available
      const loadExistingTutorProfile = async () => {
        try {
          const profile = await tutorsApi.getMyProfile();
          if (profile) {
            setFormData((prev) => ({
              ...prev,
              gender: profile.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
              university: profile.university || prev.university,
              department: profile.department || prev.department,
              degree: profile.education_level || prev.degree,
              graduation_year: profile.graduation_year || prev.graduation_year,
              city: profile.city || prev.city,
              area: profile.area || prev.area,
              expected_salary: profile.expected_salary || prev.expected_salary,
              experience_years: profile.experience_years || prev.experience_years,
              subjects: profile.subjects?.length ? profile.subjects : prev.subjects,
              preferred_classes: profile.preferred_classes?.length ? profile.preferred_classes : prev.preferred_classes,
              preferred_locations: profile.preferred_locations?.length ? profile.preferred_locations : prev.preferred_locations,
              preferred_tuition_type: (profile.preferred_tuition_type?.length ? profile.preferred_tuition_type : prev.preferred_tuition_type) as any,
              bio: profile.bio || prev.bio,
              profile_photo: profile.profile_photo || prev.profile_photo,
            }));
            if (profile.tutor_id) {
              setRegisteredTutorId(profile.tutor_id);
            }
          }
        } catch {
          // If profile fetch fails or empty, ignore
        }
      };
      loadExistingTutorProfile();
    }
  }, [isAuthenticated, user]);

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Steps configuration depending on auth status:
  // If logged in: 7 steps (Skip account creation step since account already exists)
  // If guest: 8 steps (Include step 1 Account Information)
  const stepsList = isAuthenticated
    ? [
        { num: 1, key: 'personal', label: 'Personal' },
        { num: 2, key: 'education', label: 'Education' },
        { num: 3, key: 'subjects', label: 'Subjects' },
        { num: 4, key: 'locations', label: 'Locations' },
        { num: 5, key: 'salary', label: 'Salary' },
        { num: 6, key: 'verification', label: 'Verification' },
        { num: 7, key: 'review', label: 'Review' },
      ]
    : [
        { num: 1, key: 'account', label: 'Account' },
        { num: 2, key: 'personal', label: 'Personal' },
        { num: 3, key: 'education', label: 'Education' },
        { num: 4, key: 'subjects', label: 'Subjects' },
        { num: 5, key: 'locations', label: 'Locations' },
        { num: 6, key: 'salary', label: 'Salary' },
        { num: 7, key: 'verification', label: 'Verification' },
        { num: 8, key: 'review', label: 'Review' },
      ];

  const totalSteps = stepsList.length;
  const currentStepInfo = stepsList[currentStep - 1] || stepsList[0];

  const validateCurrentStep = (): boolean => {
    setError('');
    const stepKey = currentStepInfo.key;

    if (stepKey === 'account') {
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        setError('Please enter both your first name and last name.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setError('Please enter a valid email address.');
        return false;
      }
      if (!formData.phone.trim()) {
        setError('Please enter your mobile phone number.');
        return false;
      }
      if (!formData.password || formData.password.length < 8) {
        setError('Please enter a secure password (at least 8 characters).');
        return false;
      }
    }

    if (stepKey === 'personal') {
      if (!formData.city) {
        setError('Please select your city / district.');
        return false;
      }
      if (!formData.area.trim()) {
        setError('Please enter your living area / neighborhood.');
        return false;
      }
    }

    if (stepKey === 'education') {
      if (!formData.university.trim()) {
        setError('Please provide your university or institution name.');
        return false;
      }
      if (!formData.department.trim()) {
        setError('Please provide your department or major.');
        return false;
      }
    }

    if (stepKey === 'subjects') {
      if (formData.subjects.length === 0) {
        setError('Please select at least one preferred teaching subject.');
        return false;
      }
    }

    if (stepKey === 'locations') {
      if (formData.preferred_locations.length === 0) {
        setError('Please select at least one preferred tuition area.');
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setError('');
    try {
      if (isAuthenticated) {
        // Authenticated flow: update user profile & save tutor onboarding details
        if (formData.first_name || formData.last_name || formData.phone) {
          try {
            await authApi.updateCurrentUser({
              first_name: formData.first_name || user?.first_name || '',
              last_name: formData.last_name || user?.last_name || '',
              phone: formData.phone || user?.phone || '',
            });
          } catch (updateErr) {
            console.warn('Could not update user details:', updateErr);
          }
        }

        const tutor = await tutorsApi.saveTutorOnboarding(formData);
        if (tutor?.tutor_id) {
          setRegisteredTutorId(tutor.tutor_id);
        }
        showToast('Your tutor profile has been successfully activated!', 'success');
        setIsCompleted(true);
      } else {
        // Unauthenticated guest flow: Register account & save tutor onboarding
        const tutor = await tutorsApi.registerTutor(formData);
        if (tutor?.tutor_id) {
          setRegisteredTutorId(tutor.tutor_id);
        }
        showToast('Your TutorHub account and tutor profile have been created!', 'success');
        setIsCompleted(true);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please review your details and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-8 sm:p-12 text-center max-w-xl mx-auto my-12 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Profile Activated
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
          Congratulations! Your Tutor Profile is Live.
        </h2>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          {registeredTutorId ? (
            <>
              Your profile ID is <strong>{registeredTutorId}</strong>. You are now ready to apply for live tuition jobs and receive parent inquiries.
            </>
          ) : (
            'Your tutor profile has been successfully saved. You can now browse tuition jobs and apply to matching requests.'
          )}
        </p>
        <div className="pt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Go to Tutor Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/job-board')}
          >
            Browse Tuition Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 max-w-3xl mx-auto my-8">
      
      {/* Authenticated Account Badge */}
      {isAuthenticated && user && (
        <div className="mb-6 p-4 rounded-2xl bg-brand-50/70 border border-brand-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-black text-base shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">
                  Logged In Account
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-200 text-brand-900 font-bold">
                  {user.role}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {user.full_name || `${user.first_name || formData.first_name} ${user.last_name || formData.last_name}`.trim() || user.email}
                <span className="font-normal text-slate-500 text-xs ml-1.5">({user.email})</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-brand-700 font-medium sm:text-right">
            Account verified · Step into tutor profile setup
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-center gap-3" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Stepper Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            Step {currentStep} of {totalSteps}: {currentStepInfo.label}
          </span>
          <span className="text-xs font-bold text-slate-500">
            {Math.round((currentStep / totalSteps) * 100)}% Completed
          </span>
        </div>

        {/* Progress Line */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step circles for desktop */}
        <div className="hidden sm:flex justify-between mt-4">
          {stepsList.map((s) => (
            <div
              key={s.num}
              className={`flex flex-col items-center ${
                currentStep >= s.num ? 'text-brand-600' : 'text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === s.num
                    ? 'bg-brand-500 text-white ring-4 ring-brand-100 shadow-xs'
                    : currentStep > s.num
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep > s.num ? '✓' : s.num}
              </div>
              <span className="text-[10px] font-semibold mt-1">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Step Content */}
      <div className="min-h-[340px]">

        {/* STEP: Account Info (Only when not logged in) */}
        {!isAuthenticated && currentStepInfo.key === 'account' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 font-heading">
                1. Account Credentials
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Create your login credentials for TutorHub to manage your applications and profile.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                helperText="Your given name as it should appear on your profile."
                placeholder="e.g. Tanvir"
                required
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                helperText="Your family name."
                placeholder="e.g. Ahmed"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                helperText="Used for login and notifications."
                placeholder="you@example.com"
                required
              />
              <Input
                label="Mobile Phone Number"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="01XXXXXXXXX"
                helperText="Use a reachable mobile number."
                required
              />
            </div>

            <Input
              label="Account Password"
              type="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              helperText="Minimum 8 characters with letters and numbers."
              placeholder="••••••••"
              required
            />
          </div>
        )}

        {/* STEP: Personal Details */}
        {currentStepInfo.key === 'personal' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 font-heading">
                {isAuthenticated ? '1.' : '2.'} Personal Information & Residence
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Help us connect you with students in your immediate location.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('gender', 'MALE')}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      formData.gender === 'MALE'
                        ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('gender', 'FEMALE')}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
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
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => updateField('date_of_birth', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="City / District"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                options={cities.map((c) => c.name)}
              />
              <Input
                label="Area / Neighborhood"
                value={formData.area}
                onChange={(e) => updateField('area', e.target.value)}
                placeholder="e.g. Mirpur, Dhanmondi, Uttara"
                helperText="Where you currently live in this city."
                required
              />
            </div>

            <Input
              label="Present Full Address"
              value={formData.present_address}
              onChange={(e) => updateField('present_address', e.target.value)}
              placeholder="e.g. House 12, Road 4, Sector 7"
              helperText="Used for address validation and tutor verification."
            />
          </div>
        )}

        {/* STEP: Education */}
        {currentStepInfo.key === 'education' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 font-heading">
                {isAuthenticated ? '2.' : '3.'} Educational Qualifications
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Students and parents prefer tutors from well-reputed academic institutions.
              </p>
            </div>

            <Input
              label="University / Institution"
              value={formData.university}
              onChange={(e) => updateField('university', e.target.value)}
              placeholder="e.g. BUET, Dhaka University, DMC, NSU, BRAC"
              helperText="Your current or graduated higher educational institution."
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Department / Major"
                value={formData.department}
                onChange={(e) => updateField('department', e.target.value)}
                placeholder="e.g. EEE, CSE, English, BBA, MBBS"
                helperText="Your field of study or faculty."
                required
              />
              <Input
                label="Degree Name"
                value={formData.degree}
                onChange={(e) => updateField('degree', e.target.value)}
                placeholder="e.g. B.Sc. in CSE, BBA, MBBS"
                helperText="Degree or educational standing."
                required
              />
            </div>

            <Input
              label="Graduation / Passing Year"
              type="number"
              value={formData.graduation_year}
              onChange={(e) => updateField('graduation_year', Number(e.target.value))}
              placeholder="2024"
              helperText="Year you graduated or expected graduation year."
            />
          </div>
        )}

        {/* STEP: Subjects */}
        {currentStepInfo.key === 'subjects' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 font-heading">
                {isAuthenticated ? '3.' : '4.'} Subjects & Teaching Mediums
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select the subjects and student grade levels you are confident teaching.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Preferred Teaching Subjects (Select All Applicable) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Physics', 'Higher Math', 'Chemistry', 'Biology',
                  'General Math', 'English', 'ICT', 'Accounting',
                  'Economics', 'Pure Math (O/A Level)', 'Bangla', 'Spoken English'
                ].map((sub) => {
                  const isSelected = formData.subjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          updateField('subjects', formData.subjects.filter((s) => s !== sub));
                        } else {
                          updateField('subjects', [...formData.subjects, sub]);
                        }
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
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
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Preferred Classes / Grades
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  'Class 1 to 5', 'Class 6 to 8', 'Class 9', 'Class 10 (SSC)',
                  'HSC (Science)', 'HSC (Commerce/Arts)', 'O Level', 'A Level', 'Admission Prep'
                ].map((cls) => {
                  const isSelected = formData.preferred_classes.includes(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          updateField('preferred_classes', formData.preferred_classes.filter((c) => c !== cls));
                        } else {
                          updateField('preferred_classes', [...formData.preferred_classes, cls]);
                        }
                      }}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cls}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP: Locations */}
        {currentStepInfo.key === 'locations' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 font-heading">
                {isAuthenticated ? '4.' : '5.'} Preferred Tuition Areas in {formData.city}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select the areas and neighborhoods where you are willing to travel for home tutoring.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                'Mirpur', 'Uttara', 'Dhanmondi', 'Gulshan', 'Banani',
                'Mohammadpur', 'Badda', 'Bashundhara R/A', 'Khilgaon',
                'Farmgate', 'Lalmatia', 'Malibagh', 'Rampura', 'Paltan'
              ].map((area) => {
                const isSelected = formData.preferred_locations.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        updateField('preferred_locations', formData.preferred_locations.filter((a) => a !== area));
                      } else {
                        updateField('preferred_locations', [...formData.preferred_locations, area]);
                      }
                    }}
                    className={`p-3 rounded-xl text-xs font-bold border text-left transition-all ${
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
          </div>
        )}

        {/* STEP: Salary & Experience */}
        {currentStepInfo.key === 'salary' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 font-heading">
                {isAuthenticated ? '5.' : '6.'} Experience & Expected Salary
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set transparent remuneration and showcase your teaching background.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Teaching Experience (Years)"
                type="number"
                value={formData.experience_years}
                onChange={(e) => updateField('experience_years', Number(e.target.value))}
                min={0}
                helperText="Use 0 if you are starting fresh as a new tutor."
              />
              <Input
                label="Expected Monthly Salary (৳ BDT)"
                type="number"
                value={formData.expected_salary}
                onChange={(e) => updateField('expected_salary', Number(e.target.value))}
                leftIcon={<DollarSign className="w-4 h-4" />}
                helperText="Typical range: ৳6,000 - ৳15,000 / month"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                About You / Short Teaching Bio
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Briefly describe your teaching philosophy, strengths in specific subjects, and academic achievements..."
              />
            </div>
          </div>
        )}

        {/* STEP: Photo & Verification */}
        {currentStepInfo.key === 'verification' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 font-heading">
                {isAuthenticated ? '6.' : '7.'} Profile Photo & Verification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified tutors with photos receive 4x more tuition job appointments.
              </p>
            </div>

            <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={formData.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt="Profile Preview"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-500 shadow-xs"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Profile Photo Ready</h4>
                <p className="text-xs text-slate-500">Professional portrait photo for verified badge display.</p>
                <div className="text-[11px] text-brand-600 font-bold">Standard tutor avatar selected</div>
              </div>
            </div>

            <Input
              label="National ID (NID) / Birth Certificate Number"
              value={formData.nid_number}
              onChange={(e) => updateField('nid_number', e.target.value)}
              placeholder="e.g. 1998XXXXXXXXXXXXX"
              helperText="This document number is kept strictly confidential for verification."
            />

            <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-700">Student ID / Degree Certificate</p>
              <p className="text-[11px] text-slate-500">Document uploads are verified by our team within 24 hours.</p>
            </div>
          </div>
        )}

        {/* STEP: Review & Submit */}
        {currentStepInfo.key === 'review' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 font-heading">
                {isAuthenticated ? '7.' : '8.'} Final Profile Review & Submit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Please double-check your information before activating your tutor profile.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <p>
                  <strong className="text-slate-900">Full Name:</strong>{' '}
                  {user?.full_name || `${user?.first_name || formData.first_name} ${user?.last_name || formData.last_name}`.trim() || formData.email}
                </p>
                <p>
                  <strong className="text-slate-900">Email:</strong> {user?.email || formData.email}
                </p>
                <p>
                  <strong className="text-slate-900">Phone:</strong> {user?.phone || formData.phone}
                </p>
                <p>
                  <strong className="text-slate-900">Gender:</strong> {formData.gender}
                </p>
                <p>
                  <strong className="text-slate-900">University:</strong> {formData.university}
                </p>
                <p>
                  <strong className="text-slate-900">Department:</strong> {formData.department} ({formData.degree})
                </p>
                <p>
                  <strong className="text-slate-900">City / Area:</strong> {formData.area}, {formData.city}
                </p>
                <p>
                  <strong className="text-slate-900">Expected Salary:</strong> ৳{formData.expected_salary}/month
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1.5">
                <p>
                  <strong className="text-slate-900">Subjects:</strong>{' '}
                  {formData.subjects.length ? formData.subjects.join(', ') : 'None selected'}
                </p>
                <p>
                  <strong className="text-slate-900">Preferred Locations:</strong>{' '}
                  {formData.preferred_locations.length ? formData.preferred_locations.join(', ') : 'None selected'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-brand-50 p-3.5 rounded-2xl border border-brand-200">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>
                By submitting, you agree to the TutorHub Terms of Service, Honor Code, and Tutor Code of Conduct.
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Navigation Buttons Footer */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || isSubmitting}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button
            type="button"
            variant="primary"
            onClick={nextStep}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Next Step
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={handleFinalSubmit}
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isAuthenticated ? 'Save & Activate Profile' : 'Register & Activate Profile'}
          </Button>
        )}
      </div>

    </div>
  );
};
