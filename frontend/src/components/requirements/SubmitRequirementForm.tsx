import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Send,
  CheckCircle2,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { locationsApi } from '../../api/locations';
import type { LocationCity } from '../../api/locations';
import { requirementsApi } from '../../api/requirements';

type RequirementFormData = {
  parent_name: string;
  phone: string;
  email: string;
  student_name: string;
  student_gender: 'Male' | 'Female' | '';
  class_level: string;
  curriculum: string;
  subjects: string[];
  city: string;
  area: string;
  address: string;
  tuition_type: string;
  preferred_tutor_gender: 'Male' | 'Female' | 'Any' | '';
  days_per_week: number | string;
  preferred_time: string;
  budget: number | string;
  additional_requirements: string;
};

export const SubmitRequirementForm: React.FC = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedReqId, setGeneratedReqId] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await locationsApi.getCities();
        setCities(data);
      } catch (err) {
        console.error('Failed to load cities for requirement form:', err);
      }
    };
    fetchCities();
  }, []);

  const [formData, setFormData] = useState<RequirementFormData>({
    parent_name: '',
    phone: '',
    email: '',
    student_name: '',
    student_gender: '',
    class_level: '',
    curriculum: '',
    subjects: [],
    city: '',
    area: '',
    address: '',
    tuition_type: '',
    preferred_tutor_gender: '',
    days_per_week: '',
    preferred_time: '',
    budget: '',
    additional_requirements: ''
  });

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const currentCity = cities.find(c => c.name === formData.city);
  const areas = currentCity ? currentCity.areas.map(a => a.name) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        student_gender: formData.student_gender || undefined,
        preferred_tutor_gender: formData.preferred_tutor_gender || undefined,
        class_level: formData.class_level || undefined,
        curriculum: formData.curriculum || undefined,
        city: formData.city || undefined,
        area: formData.area || undefined,
        address: formData.address || undefined,
        tuition_type: formData.tuition_type || undefined,
        preferred_time: formData.preferred_time || undefined,
        additional_requirements: formData.additional_requirements || undefined,
        days_per_week: formData.days_per_week === '' ? undefined : Number(formData.days_per_week),
        budget: formData.budget === '' ? undefined : Number(formData.budget),
        subjects: formData.subjects || []
      };

      const result = await requirementsApi.submitRequirement(payload);
      setGeneratedReqId(result.requirement_id);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-8 sm:p-12 text-center max-w-xl mx-auto my-12">
        <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <span className="px-3 py-1 bg-brand-50 text-brand-800 rounded-full text-xs font-mono font-bold">
          ID: {generatedReqId}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-3">
          Tutor Requirement Submitted!
        </h2>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          Our automated tutor matching algorithm has identified top rated tutors for <strong>{formData.subjects.join(', ')}</strong> in {formData.area}, {formData.city}. You will receive short-listed CVs shortly.
        </p>
        <div className="pt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
          >
            Track Requirement in Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/find-tutor')}
          >
            Explore Tutors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 max-w-3xl mx-auto my-8 space-y-8">

      {/* Form Header */}
      <div className="border-b border-slate-100 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold mb-2">
          <ClipboardList className="w-3.5 h-3.5" />
          Free Requirement Submission
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
          Post Your Tutor Requirement
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Provide your child's requirements and receive verified mentor CVs tailored specifically to your needs.
        </p>
      </div>

      {/* Section 1: Guardian & Student Details */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs">1</span>
          Guardian & Student Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Guardian / Parent Name"
            value={formData.parent_name}
            onChange={(e) => updateField('parent_name', e.target.value)}
            required
          />
          <Input
            label="Student Name"
            value={formData.student_name}
            onChange={(e) => updateField('student_name', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Contact Phone Number"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="01XXXXXXXXX"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Student Gender
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['Male', 'Female'] as ('Male' | 'Female')[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => updateField('student_gender', g)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${formData.student_gender === g
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Academic Details */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs">2</span>
          Academic Curriculum & Subjects
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Class / Grade Level"
            value={formData.class_level}
            onChange={(e) => updateField('class_level', e.target.value)}
            placeholder="Select class level"
            options={[
              'Class 1 to 5',
              'Class 6 to 8',
              'Class 9',
              'Class 10 (SSC)',
              'HSC (Science)',
              'HSC (Commerce/Arts)',
              'O Level (Edexcel/Cambridge)',
              'A Level (Edexcel/Cambridge)',
              'University Admission Prep'
            ]}
          />
          <Select
            label="Medium / Curriculum"
            value={formData.curriculum}
            onChange={(e) => updateField('curriculum', e.target.value)}
            placeholder="Select curriculum"
            options={[
              'Bangla Medium',
              'English Version',
              'English Medium',
              'Edexcel',
              'Cambridge',
              'Madrasah / Dakhil'
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Target Subjects (Select applicable)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Physics', 'Higher Math', 'Chemistry', 'Biology', 'General Math', 'English', 'ICT', 'Accounting', 'Economics', 'General Science', 'All Subjects'].map((sub) => {
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
                  className={`p-2 rounded-lg text-xs font-bold border text-center transition-all ${isSelected
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
      </div>

      {/* Section 3: Location, Schedule & Budget */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs">3</span>
          Location, Schedule & Budget
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="City"
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="Select city"
            options={cities.map(c => c.name)}
          />
          <Select
            label="Area"
            value={formData.area}
            onChange={(e) => updateField('area', e.target.value)}
            placeholder="Select area"
            options={areas}
          />
        </div>

        <Input
          label="Detailed Street Address / Landmark"
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="e.g. House 12, Road 4, Sector 10"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Preferred Tutor Gender
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['Any', 'Male', 'Female'] as ('Any' | 'Male' | 'Female')[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => updateField('preferred_tutor_gender', g)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${formData.preferred_tutor_gender === g
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Days Per Week"
            type="number"
            min={1}
            max={7}
            placeholder="e.g. 3"
            value={formData.days_per_week}
            onChange={(e) => updateField('days_per_week', e.target.value)}
          />

          <Input
            label="Monthly Budget (৳ BDT)"
            type="number"
            placeholder="e.g. 8000"
            value={formData.budget}
            onChange={(e) => updateField('budget', e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Special Notes / Requirements
          </label>
          <textarea
            rows={3}
            value={formData.additional_requirements}
            onChange={(e) => updateField('additional_requirements', e.target.value)}
            className="w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            placeholder="e.g. Prefer BUET mentor with evening availability..."
          />
        </div>
      </div>

      {/* Trust Banner & Submit */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-5 h-5 text-brand-500 shrink-0" />
          <span>100% Free service for guardians. Verified tutors with free trial class.</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          leftIcon={<Send className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Submit Requirement
        </Button>
      </div>

    </form>
  );
};
