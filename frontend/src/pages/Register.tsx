import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'TUTOR' as UserRole
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await register(formData);
      if (formData.role === 'TUTOR') {
        navigate('/become-a-tutor');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Create an Account
          </h1>
          <p className="text-xs text-slate-500">
            Join thousands of students, parents, and tutors on TutorHub.
          </p>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 text-center">
            I want to register as
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
            {(['TUTOR', 'PARENT', 'STUDENT'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => updateField('role', r)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  formData.role === r
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'PARENT' ? 'Parent' : r === 'TUTOR' ? 'Tutor' : 'Student'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={formData.first_name}
              onChange={(e) => updateField('first_name', e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => updateField('last_name', e.target.value)}
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Mobile Phone Number"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="01XXXXXXXXX"
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            helperText="Minimum 8 characters with at least one number."
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create {formData.role} Account
          </Button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
