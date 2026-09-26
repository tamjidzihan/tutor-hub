import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { GraduationCap, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';
import { getApiErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'TUTOR' as UserRole
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPasswordError('');
    setConfirmPasswordError('');

    const passwordRules = [
      formData.password.length >= 8,
      /[A-Z]/.test(formData.password),
      /[a-z]/.test(formData.password),
      /\d/.test(formData.password),
      /[^A-Za-z0-9]/.test(formData.password),
    ];
    if (!passwordRules.every(Boolean)) {
      setPasswordError('Use at least 8 characters with uppercase, lowercase, number, and special character.');
      setIsLoading(false);
      return;
    }
    if (formData.password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      await register(formData);
      showToast('Your TutorHub account was created successfully.', 'success');
      if (formData.role === 'TUTOR') {
        navigate('/become-a-tutor');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please check your details and try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 max-w-lg w-full space-y-6">

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
                className={`py-2 rounded-lg text-xs font-bold transition-all ${formData.role === r
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
              helperText="Your given name."
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

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="you@example.com"
            helperText="We will use this email for account access."
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

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            error={passwordError}
            helperText="8+ characters with uppercase, lowercase, number, and special character."
            rightAction={<button type="button" onClick={() => setShowPassword((visible) => !visible)} className="rounded-md p-1 text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
            required
          />

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg bg-slate-50 p-3 text-[11px]">
            {[['8+ characters', formData.password.length >= 8], ['Uppercase letter', /[A-Z]/.test(formData.password)], ['Lowercase letter', /[a-z]/.test(formData.password)], ['Number', /\d/.test(formData.password)], ['Special character', /[^A-Za-z0-9]/.test(formData.password)]].map(([label, valid]) => <span key={String(label)} className={`flex items-center gap-1 ${valid ? 'text-emerald-700' : 'text-slate-500'}`}>{valid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}{label}</span>)}
          </div>

          <Input
            label="Retype Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPasswordError}
            leftIcon={<span className="text-xs font-bold">↻</span>}
            rightAction={<button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="rounded-md p-1 text-slate-400 hover:text-slate-700" aria-label={showConfirmPassword ? 'Hide retyped password' : 'Show retyped password'}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
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
