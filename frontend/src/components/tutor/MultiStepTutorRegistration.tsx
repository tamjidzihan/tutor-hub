import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Upload,
  DollarSign
} from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { locationsApi, type LocationCity } from '../../api/locations';
import { tutorsApi } from '../../api/tutors';
import { getApiErrorMessage } from '../../api/client';

export const MultiStepTutorRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [registeredTutorId, setRegisteredTutorId] = useState('');
  const [error, setError] = useState('');

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

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Account
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    // Step 2: Personal
    gender: 'MALE' as 'MALE' | 'FEMALE',
    date_of_birth: '',
    present_address: '',
    city: 'Dhaka',
    area: '',
    // Step 3: Education
    university: '',
    department: '',
    degree: '',
    graduation_year: new Date().getFullYear(),
    // Step 4: Subjects & Classes
    subjects: [] as string[],
    preferred_classes: [] as string[],
    preferred_tuition_type: ['Home Tutoring'] as ('Home Tutoring' | 'Online' | 'Batch' | 'Crash Course')[],
    // Step 5: Locations
    preferred_locations: [] as string[],
    // Step 6: Experience & Salary
    experience_years: 1,
    expected_salary: 5000,
    bio: '',
    // Step 7: Photos & ID
    profile_photo: '',
    nid_number: ''
  });

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 8));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const tutor = await tutorsApi.registerTutor(formData);
      if (tutor?.tutor_id) {
        setRegisteredTutorId(tutor.tutor_id);
      }
      setIsCompleted(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please review your details and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Account' },
    { num: 2, label: 'Personal' },
    { num: 3, label: 'Education' },
    { num: 4, label: 'Subjects' },
    { num: 5, label: 'Locations' },
    { num: 6, label: 'Salary' },
    { num: 7, label: 'Verification' },
    { num: 8, label: 'Review' },
  ];

  if (isCompleted) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-8 sm:p-12 text-center max-w-xl mx-auto my-12">
        <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
          Congratulations! Your Tutor Profile is Live.
        </h2>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          {registeredTutorId ? <>Your profile ID <strong>{registeredTutorId}</strong> has been registered.</> : 'Your tutor profile has been registered.'} You can now browse live tuition jobs and apply to suitable opportunities.
        </p>
        <div className="pt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
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
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{error}</div>}

      {/* Progress Stepper Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Step {currentStep} of 8: {stepsList[currentStep - 1].label}
          </span>
          <span className="text-xs font-bold text-slate-500">
            {Math.round((currentStep / 8) * 100)}% Completed
          </span>
        </div>

        {/* Progress Line */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>

        {/* Step circles for desktop */}
        <div className="hidden sm:flex justify-between mt-4">
          {stepsList.map((s) => (
            <div
              key={s.num}
              className={`flex flex-col items-center ${currentStep >= s.num ? 'text-brand-600' : 'text-slate-400'
                }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStep === s.num
                  ? 'bg-brand-500 text-white ring-4 ring-brand-100'
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

        {/* STEP 1: Account Info */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                helperText="Your given name as it should appear on your profile."
                required
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                helperText="Your family name."
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                helperText="Used for login and application updates."
                required
              />
              <Input
                label="Mobile Phone Number"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="01XXXXXXXXX"
                helperText="Use a reachable phone number."
                required
              />
            </div>
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              helperText="Minimum 8 characters with at least one number."
              required
            />
          </div>
        )}

        {/* STEP 2: Personal Details */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. Personal Information & Residence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('gender', 'MALE')}
                    className={`py-2.5 rounded-lg text-sm font-bold border transition-all ${formData.gender === 'MALE'
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('gender', 'FEMALE')}
                    className={`py-2.5 rounded-lg text-sm font-bold border transition-all ${formData.gender === 'FEMALE'
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
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
                helperText="Add the area where you currently live."
              />
            </div>

            <Input
              label="Present Full Address"
              value={formData.present_address}
              onChange={(e) => updateField('present_address', e.target.value)}
              helperText="This helps us verify your location."
            />
          </div>
        )}

        {/* STEP 3: Education */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              3. Educational Qualifications
            </h3>
            <Input
              label="University / Institution"
              value={formData.university}
              onChange={(e) => updateField('university', e.target.value)}
              placeholder="e.g. BUET, Dhaka University, DMC, NSU"
              helperText="Use your official institution name."
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Department / Major"
                value={formData.department}
                onChange={(e) => updateField('department', e.target.value)}
                placeholder="e.g. EEE, CSE, English, BBA"
                helperText="Your department, major, or subject area."
                required
              />
              <Input
                label="Degree Name"
                value={formData.degree}
                onChange={(e) => updateField('degree', e.target.value)}
                placeholder="e.g. B.Sc. in EEE, MBBS, BBA"
                helperText="For example: B.Sc. in CSE or BBA."
                required
              />
            </div>
            <Input
              label="Graduation / Passing Year"
              type="number"
              value={formData.graduation_year}
              onChange={(e) => updateField('graduation_year', Number(e.target.value))}
              placeholder="2024"
              helperText="Enter the year you graduated or expect to graduate."
            />
          </div>
        )}

        {/* STEP 4: Subjects */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              4. Subjects & Teaching Mediums
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Preferred Teaching Subjects (Select All Applicable)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Physics', 'Higher Math', 'Chemistry', 'Biology', 'General Math', 'English', 'ICT', 'Accounting', 'Economics', 'Pure Math (O/A Level)', 'Bangla', 'Spoken English'].map((sub) => {
                  const isSelected = formData.subjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          updateField('subjects', formData.subjects.filter(s => s !== sub));
                        } else {
                          updateField('subjects', [...formData.subjects, sub]);
                        }
                      }}
                      className={`p-2.5 rounded-lg text-xs font-bold border text-left transition-all ${isSelected
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
                {['Class 1 to 5', 'Class 6 to 8', 'Class 9', 'Class 10 (SSC)', 'HSC (Science)', 'HSC (Commerce/Arts)', 'O Level', 'A Level', 'Admission Prep'].map((cls) => {
                  const isSelected = formData.preferred_classes.includes(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          updateField('preferred_classes', formData.preferred_classes.filter(c => c !== cls));
                        } else {
                          updateField('preferred_classes', [...formData.preferred_classes, cls]);
                        }
                      }}
                      className={`p-2 rounded-lg text-xs font-bold border text-center transition-all ${isSelected
                        ? 'bg-navy-900 text-white border-navy-900'
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

        {/* STEP 5: Locations */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              5. Preferred Tuition Areas in {formData.city}
            </h3>
            <p className="text-xs text-slate-500">
              Select the areas where you are willing to travel for home tuitions.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Mirpur', 'Uttara', 'Dhanmondi', 'Gulshan', 'Banani', 'Mohammadpur', 'Badda', 'Bashundhara R/A', 'Khilgaon', 'Farmgate', 'Lalmatia', 'Malibagh'].map((area) => {
                const isSelected = formData.preferred_locations.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        updateField('preferred_locations', formData.preferred_locations.filter(a => a !== area));
                      } else {
                        updateField('preferred_locations', [...formData.preferred_locations, area]);
                      }
                    }}
                    className={`p-2.5 rounded-lg text-xs font-bold border text-left transition-all ${isSelected
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

        {/* STEP 6: Salary & Experience */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              6. Experience & Expected Salary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Teaching Experience (Years)"
                type="number"
                value={formData.experience_years}
                onChange={(e) => updateField('experience_years', Number(e.target.value))}
                min={0}
                helperText="Use 0 if you are starting your tutoring career."
              />
              <p className="mt-1 text-xs text-slate-500">A short introduction helps guardians understand your teaching style.</p>
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
                rows={3}
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Highlight your teaching approach and academic strengths..."
              />
            </div>
          </div>
        )}

        {/* STEP 7: Photo & Verification */}
        {currentStep === 7 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              7. Profile Photo & Document Verification
            </h3>
            <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={formData.profile_photo}
                alt="Profile Preview"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-500"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Profile Photo Attached</h4>
                <p className="text-xs text-slate-500">Formal professional headshot for verified badge.</p>
                <button
                  type="button"
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Change Photo
                </button>
              </div>
            </div>

            <Input
              label="National ID (NID) / Birth Certificate Number"
              value={formData.nid_number}
              onChange={(e) => updateField('nid_number', e.target.value)}
              placeholder="e.g. 1998XXXXXXXXXXXXX"
              helperText="This is used for tutor verification and is kept private."
              required
            />

            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-700">University ID Card Uploaded</p>
              <p className="text-[11px] text-slate-400">BUET_Student_ID_2024.pdf (Verified)</p>
            </div>
          </div>
        )}

        {/* STEP 8: Review & Submit */}
        {currentStep === 8 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              8. Final Profile Review & Submit
            </h3>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <p><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
                <p><strong>University:</strong> {formData.university}</p>
                <p><strong>Department:</strong> {formData.department}</p>
                <p><strong>City / Area:</strong> {formData.area}, {formData.city}</p>
                <p><strong>Expected Salary:</strong> ৳{formData.expected_salary}/month</p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p><strong>Selected Subjects:</strong> {formData.subjects.join(', ')}</p>
                <p className="mt-1"><strong>Preferred Areas:</strong> {formData.preferred_locations.join(', ')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-brand-50 p-3 rounded-xl border border-brand-200">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>By submitting, you agree to the TutorHub Terms of Service and Code of Conduct.</span>
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

        {currentStep < 8 ? (
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
            Submit & Activate Profile
          </Button>
        )}
      </div>

    </div>
  );
};
