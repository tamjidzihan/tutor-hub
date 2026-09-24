import React from 'react';
import { SubmitRequirementForm } from '../components/requirements/SubmitRequirementForm';
import { ClipboardList } from 'lucide-react';

export const AppointATutor: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
            <ClipboardList className="w-3.5 h-3.5" />
            100% Free Service for Guardians
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-heading">
            Appoint a Tutor for Your Child
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Fill out your tuition requirement form below. Our intelligent system will match and dispatch top-tier mentor CVs to your phone and email within 2-4 hours.
          </p>
        </div>

        {/* Form Container */}
        <SubmitRequirementForm />

      </div>
    </div>
  );
};
