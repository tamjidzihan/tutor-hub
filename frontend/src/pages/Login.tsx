import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Lock, Mail, GraduationCap, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getApiErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('TUTOR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleQuickSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password, selectedRole);
      showToast('Signed in successfully.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid credentials. Check your email and password.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 py-12 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 max-w-lg w-full space-y-6">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Sign In to Tutor<span className="text-brand-500">Hub</span>
          </h1>
          <p className="text-xs text-slate-500">
            Select your portal role and enter your credentials.
          </p>
        </div>

        {/* Quick Role Toggle Bar */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 text-center">
            Sign In As
          </label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
            {(['TUTOR', 'PARENT', 'STUDENT', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleQuickSelect(r)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${selectedRole === r
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {r === 'PARENT' ? 'Parent' : r === 'TUTOR' ? 'Tutor' : r === 'STUDENT' ? 'Student' : 'Admin'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="Use the email address linked to your TutorHub account."
            required
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              helperText="Your password is case-sensitive."
              rightAction={<button type="button" onClick={() => setShowPassword((visible) => !visible)} className="rounded-md p-1 text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
              required
            />
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold text-brand-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to {selectedRole} Portal
          </Button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Sign Up Free
          </Link>
        </div>

      </div>
    </div>
  );
};
